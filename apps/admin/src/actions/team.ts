"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { Invite, connectDB } from "@artistlist/database";
import { inviteMemberSchema, type ActionResult } from "@artistlist/types";
import { requireRole } from "@/lib/session";
import { sendMail } from "@/lib/mail";

const ADMIN_URL = () => process.env.NEXTAUTH_URL || "http://localhost:3001";

export async function inviteMember(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireRole("MANAGER", "SUPER_ADMIN");
  if (!user.organizationId) return { ok: false, error: "Nincs szervezeted." };
  const parsed = inviteMemberSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  await connectDB();
  const token = crypto.randomBytes(24).toString("hex");
  await Invite.create({
    email: parsed.data.email,
    token,
    organizationId: user.organizationId,
    invitedByUserId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
  });
  await sendMail(
    parsed.data.email,
    "Meghívó az ArtistList admin felületére",
    `${user.name} meghívott a szervezet csapatába. Fogadd el itt (7 napig érvényes):\n${ADMIN_URL()}/invite/${token}`,
  );
  revalidatePath("/csapat");
  return { ok: true };
}
