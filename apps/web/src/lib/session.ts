import { redirect } from "next/navigation";
import { auth } from "@/auth";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "MANAGER" | "ARTIST" | "FAN";
  organizationId: string | null;
  artistId: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  const u = session?.user as any;
  if (!u?.id) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    organizationId: u.organizationId ?? null,
    artistId: u.artistId ?? null,
  };
}

export async function requireUser(from = "/koncert-bekuldese"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/regisztracio?from=${encodeURIComponent(from)}`);
  return user;
}
