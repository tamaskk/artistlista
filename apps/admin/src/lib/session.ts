import { redirect } from "next/navigation";
import { Artist, Event, connectDB } from "@artistlist/database";
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

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(...roles: SessionUser["role"][]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/vezerlopult");
  return user;
}

/** Entitás-szintű jogosultság: kezelheti-e a user az adott előadót? */
export async function canManageArtist(user: SessionUser, artistId: string): Promise<boolean> {
  if (user.role === "SUPER_ADMIN") return true;
  await connectDB();
  const artist = await Artist.findById(artistId).select("organizationId ownerUserId").lean();
  if (!artist) return false;
  if (user.role === "MANAGER") {
    return !!user.organizationId && String(artist.organizationId) === user.organizationId;
  }
  if (user.role === "ARTIST") {
    return user.artistId === artistId || String(artist.ownerUserId) === user.id;
  }
  return false;
}

export async function canManageEvent(user: SessionUser, eventId: string): Promise<boolean> {
  if (user.role === "SUPER_ADMIN") return true;
  await connectDB();
  const event = await Event.findById(eventId).select("organizationId artistIds createdByUserId").lean();
  if (!event) return false;
  if (user.role === "MANAGER") {
    return !!user.organizationId && String(event.organizationId) === user.organizationId;
  }
  if (user.role === "ARTIST") {
    return (
      String(event.createdByUserId) === user.id ||
      (!!user.artistId && event.artistIds.map(String).includes(user.artistId))
    );
  }
  return false;
}

/** A user által kezelt előadók listája (dropdownokhoz, szűréshez). */
export async function getManagedArtists(user: SessionUser) {
  await connectDB();
  if (user.role === "SUPER_ADMIN") {
    return Artist.find({ status: { $ne: "archived" } }).sort({ name: 1 }).lean();
  }
  if (user.role === "MANAGER" && user.organizationId) {
    return Artist.find({ organizationId: user.organizationId, status: { $ne: "archived" } })
      .sort({ name: 1 })
      .lean();
  }
  if (user.role === "ARTIST" && user.artistId) {
    return Artist.find({ _id: user.artistId }).lean();
  }
  return [];
}
