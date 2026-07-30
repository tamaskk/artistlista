"use server";

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import {
  Artist,
  Invite,
  Organization,
  User,
  connectDB,
  uniqueSlug,
} from "@artistlist/database";
import {
  acceptInviteSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  registerArtistSchema,
  registerManagerSchema,
  resetPasswordSchema,
  type ActionResult,
} from "@artistlist/types";
import { signIn } from "@/auth";
import { requireUser } from "@/lib/session";
import { mailEnabled, sendMail } from "@/lib/mail";

const ADMIN_URL = () => process.env.NEXTAUTH_URL || "http://localhost:3001";

function fieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
  return { ok: false as const, fieldErrors: error.flatten().fieldErrors };
}

async function issueVerification(userId: string, email: string): Promise<void> {
  if (!mailEnabled()) {
    // Dev mód: nincs Resend kulcs → auto-verify
    await User.updateOne({ _id: userId }, { $set: { emailVerifiedAt: new Date() } });
    return;
  }
  const token = crypto.randomBytes(24).toString("hex");
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        verifyToken: token,
        verifyTokenExpires: new Date(Date.now() + 24 * 3600 * 1000),
      },
    },
  );
  await sendMail(
    email,
    "Erősítsd meg az email címed — ArtistList",
    `Kattints a linkre a megerősítéshez (24 óráig érvényes):\n${ADMIN_URL()}/verify-email?token=${token}`,
  );
}

export async function registerArtistAccount(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = registerArtistSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    artistName: formData.get("artistName"),
    genres: formData.getAll("genres"),
    image: formData.get("image") || "",
  });
  if (!parsed.success) return fieldErrors(parsed.error);
  const data = parsed.data;

  await connectDB();
  if (await User.findOne({ email: data.email })) {
    return { ok: false, fieldErrors: { email: ["Ezzel az email címmel már van fiók"] } };
  }
  // előadó-claim védelem: azonos nevű meglévő előadó
  const existingArtist = await Artist.findOne({
    name: { $regex: `^${data.artistName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    status: { $ne: "archived" },
  });
  if (existingArtist) {
    return {
      ok: false,
      fieldErrors: {
        artistName: [
          "Ez az előadói profil már létezik a platformon. Írj a hello@artistlist.hu címre a hozzáférés igényléséhez.",
        ],
      },
    };
  }

  const artist = await Artist.create({
    name: data.artistName,
    slug: await uniqueSlug(Artist, data.artistName),
    genres: data.genres,
    ownerType: "user",
    status: "pending",
    ...(data.image ? { images: { avatar: data.image, cover: data.image } } : {}),
  });
  const user = await User.create({
    email: data.email,
    passwordHash: bcrypt.hashSync(data.password, 10),
    name: data.name,
    role: "ARTIST",
    artistId: artist._id,
    status: "pending", // superadmin jóváhagyásáig nem léphet be
  });
  await Artist.updateOne({ _id: artist._id }, { $set: { ownerUserId: user._id } });
  await issueVerification(String(user._id), data.email);

  // nincs auto-login: a fiók jóváhagyásra vár
  redirect("/login?pending=1");
}

export async function registerManagerAccount(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = registerManagerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    orgName: formData.get("orgName"),
    orgWebsite: formData.get("orgWebsite") || "",
  });
  if (!parsed.success) return fieldErrors(parsed.error);
  const data = parsed.data;

  await connectDB();
  if (await User.findOne({ email: data.email })) {
    return { ok: false, fieldErrors: { email: ["Ezzel az email címmel már van fiók"] } };
  }
  const org = await Organization.create({
    name: data.orgName,
    slug: await uniqueSlug(Organization, data.orgName),
    contactEmail: data.email,
    website: data.orgWebsite || undefined,
  });
  const user = await User.create({
    email: data.email,
    passwordHash: bcrypt.hashSync(data.password, 10),
    name: data.name,
    role: "MANAGER",
    organizationId: org._id,
    status: "pending", // superadmin jóváhagyásáig nem léphet be
  });
  await issueVerification(String(user._id), data.email);

  // nincs auto-login: a fiók jóváhagyásra vár
  redirect("/login?pending=1");
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  await connectDB();
  const user = await User.findOne({
    verifyToken: token,
    verifyTokenExpires: { $gte: new Date() },
  });
  if (!user) return false;
  await User.updateOne(
    { _id: user._id },
    { $set: { emailVerifiedAt: new Date() }, $unset: { verifyToken: 1, verifyTokenExpires: 1 } },
  );
  return true;
}

export async function acceptInvite(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = acceptInviteSchema.safeParse({
    token: formData.get("token"),
    name: formData.get("name"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fieldErrors(parsed.error);
  const data = parsed.data;

  await connectDB();
  const invite = await Invite.findOne({
    token: data.token,
    acceptedAt: null,
    expiresAt: { $gte: new Date() },
  });
  if (!invite) return { ok: false, error: "A meghívó érvénytelen vagy lejárt." };
  if (await User.findOne({ email: invite.email })) {
    return { ok: false, error: "Ezzel az email címmel már van fiók — jelentkezz be." };
  }
  await User.create({
    email: invite.email,
    passwordHash: bcrypt.hashSync(data.password, 10),
    name: data.name,
    role: "MANAGER",
    organizationId: invite.organizationId,
    emailVerifiedAt: new Date(),
  });
  await Invite.updateOne({ _id: invite._id }, { $set: { acceptedAt: new Date() } });

  await signIn("credentials", {
    email: invite.email,
    password: data.password,
    redirect: false,
  });
  redirect("/vezerlopult");
}

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  await connectDB();
  const existing = await User.findOne({ email }).select("status");
  if (existing?.status === "pending") {
    return {
      ok: false,
      error: "A fiókod jóváhagyásra vár — a superadmin hamarosan megerősíti.",
    };
  }
  if (existing?.status === "banned") {
    return { ok: false, error: "A fiókod le van tiltva." };
  }
  try {
    await signIn("credentials", {
      email,
      password: formData.get("password"),
      redirect: false,
    });
  } catch {
    return { ok: false, error: "Hibás email vagy jelszó." };
  }
  redirect("/vezerlopult");
}

export async function requestPasswordReset(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return fieldErrors(parsed.error);
  await connectDB();
  const user = await User.findOne({ email: parsed.data.email });
  if (user) {
    const token = crypto.randomBytes(24).toString("hex");
    await User.updateOne(
      { _id: user._id },
      { $set: { resetToken: token, resetTokenExpires: new Date(Date.now() + 3600 * 1000) } },
    );
    await sendMail(
      user.email,
      "Jelszó-visszaállítás — Koncertlista",
      `Kattints a linkre az új jelszó beállításához (1 óráig érvényes):\n` +
        `${ADMIN_URL()}/reset-password?token=${token}\n\n` +
        `Ha nem te kérted, hagyd figyelmen kívül ezt a levelet.`,
    );
  }
  // Mindig sikeres — nem áruljuk el, létezik-e a fiók (enumeration-védelem).
  return { ok: true };
}

export async function resetPassword(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) return fieldErrors(parsed.error);
  await connectDB();
  const user = await User.findOne({
    resetToken: parsed.data.token,
    resetTokenExpires: { $gte: new Date() },
  });
  if (!user) return { ok: false, error: "A link érvénytelen vagy lejárt — kérj újat." };
  await User.updateOne(
    { _id: user._id },
    {
      $set: { passwordHash: bcrypt.hashSync(parsed.data.password, 10) },
      $unset: { resetToken: 1, resetTokenExpires: 1 },
    },
  );
  redirect("/login?reset=1");
}

export async function changePassword(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const sessionUser = await requireUser();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) return fieldErrors(parsed.error);
  await connectDB();
  const user = await User.findById(sessionUser.id);
  if (!user?.passwordHash || !bcrypt.compareSync(parsed.data.currentPassword, user.passwordHash)) {
    return { ok: false, fieldErrors: { currentPassword: ["A jelenlegi jelszó hibás"] } };
  }
  await User.updateOne(
    { _id: user._id },
    { $set: { passwordHash: bcrypt.hashSync(parsed.data.newPassword, 10) } },
  );
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const { signOut } = await import("@/auth");
  await signOut({ redirect: false });
  redirect("/login");
}
