"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { User, connectDB } from "@artistlist/database";
import { registerFanSchema, type ActionResult } from "@artistlist/types";
import { signIn } from "@/auth";

function safeFrom(raw: FormDataEntryValue | null): string {
  const v = String(raw ?? "");
  // csak belső, abszolút útvonal (nyílt átirányítás ellen)
  return v.startsWith("/") && !v.startsWith("//") ? v : "/koncert-bekuldese";
}

export async function registerFan(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = registerFanSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;
  const from = safeFrom(formData.get("from"));

  await connectDB();
  if (await User.findOne({ email: data.email })) {
    return { ok: false, fieldErrors: { email: ["Ezzel az email címmel már van fiók — jelentkezz be."] } };
  }
  await User.create({
    email: data.email,
    passwordHash: bcrypt.hashSync(data.password, 10),
    name: data.name,
    role: "FAN",
    emailVerifiedAt: new Date(), // külsős fan: nincs külön verifikáció az MVP-ben
  });
  await signIn("credentials", { email: data.email, password: data.password, redirect: false });
  redirect(from);
}

export async function loginFan(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const from = safeFrom(formData.get("from"));
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch {
    return { ok: false, error: "Hibás email vagy jelszó." };
  }
  redirect(from);
}

export async function logoutFan(): Promise<void> {
  const { signOut } = await import("@/auth");
  await signOut({ redirect: false });
  redirect("/");
}
