"use server";

import { revalidatePath } from "next/cache";
import { Artist, Event, Organization, User, connectDB } from "@artistlist/database";
import type { ActionResult } from "@artistlist/types";
import { requireRole } from "@/lib/session";
import { sendMail } from "@/lib/mail";

export async function approveArtist(artistId: string): Promise<ActionResult> {
  await requireRole("SUPER_ADMIN");
  await connectDB();
  const artist = await Artist.findByIdAndUpdate(artistId, { $set: { status: "published" } });
  if (artist?.ownerUserId) {
    const owner = await User.findById(artist.ownerUserId);
    if (owner) {
      await sendMail(
        owner.email,
        "Jóváhagytuk az előadói profilod — ArtistList",
        `A(z) ${artist.name} profil mostantól él a platformon.`,
      );
    }
  }
  revalidatePath("/admin/moderacio");
  return { ok: true };
}

export async function rejectArtist(artistId: string, reason: string): Promise<ActionResult> {
  await requireRole("SUPER_ADMIN");
  await connectDB();
  const artist = await Artist.findByIdAndUpdate(artistId, { $set: { status: "draft" } });
  if (artist?.ownerUserId) {
    const owner = await User.findById(artist.ownerUserId);
    if (owner) {
      await sendMail(
        owner.email,
        "Az előadói profilod javítást igényel — ArtistList",
        `Indoklás: ${reason || "nincs megadva"}. Módosítás után újra beküldheted.`,
      );
    }
  }
  revalidatePath("/admin/moderacio");
  return { ok: true };
}

export async function toggleArtistFeatured(artistId: string): Promise<ActionResult> {
  await requireRole("SUPER_ADMIN");
  await connectDB();
  const artist = await Artist.findById(artistId);
  if (!artist) return { ok: false, error: "Nem található." };
  artist.featured = !artist.featured;
  await artist.save();
  revalidatePath("/admin/kiemelesek");
  return { ok: true };
}

/** Kék pipa be/ki — hivatalos előadó-profil (superadmin). */
export async function toggleArtistVerified(artistId: string): Promise<ActionResult> {
  await requireRole("SUPER_ADMIN");
  await connectDB();
  const artist = await Artist.findById(artistId);
  if (!artist) return { ok: false, error: "Nem található." };
  (artist as any).verified = !(artist as any).verified;
  await artist.save();
  revalidatePath("/eloadok");
  revalidatePath(`/eloadok/${artistId}/szerkesztes`);
  return { ok: true };
}

export async function toggleEventFeatured(eventId: string): Promise<ActionResult> {
  await requireRole("SUPER_ADMIN");
  await connectDB();
  const event = await Event.findById(eventId);
  if (!event) return { ok: false, error: "Nem található." };
  event.featured = !event.featured;
  await event.save();
  revalidatePath("/admin/kiemelesek");
  return { ok: true };
}

/** Jóváhagyásra váró (pending) előadói/menedzsment fiók megerősítése. */
export async function approveUser(userId: string): Promise<ActionResult> {
  await requireRole("SUPER_ADMIN");
  await connectDB();
  const user = await User.findByIdAndUpdate(userId, { $set: { status: "active" } });
  if (user) {
    await sendMail(
      user.email,
      "Jóváhagytuk a fiókod — ArtistList",
      `Szia ${user.name}! A(z) ${user.role === "MANAGER" ? "menedzsment" : "előadói"} fiókod aktív — mostantól be tudsz jelentkezni.`,
    );
  }
  revalidatePath("/admin/felhasznalok");
  return { ok: true };
}

/** Regisztráció elutasítása: a pending fiók + a hozzá frissen jött előadó/szervezet törlése. */
export async function rejectUser(userId: string): Promise<ActionResult> {
  const admin = await requireRole("SUPER_ADMIN");
  if (admin.id === userId) return { ok: false, error: "Magadat nem utasíthatod el." };
  await connectDB();
  const user = await User.findById(userId);
  if (!user) return { ok: false, error: "Nem található." };
  if (user.status !== "pending") {
    return { ok: false, error: "Csak jóváhagyásra váró fiók utasítható el." };
  }
  // saját, még esemény nélküli előadó törlése
  if (user.artistId) {
    const hasEvents = await Event.exists({ artistIds: user.artistId });
    if (!hasEvents) await Artist.deleteOne({ _id: user.artistId });
  }
  // szervezet törlése, ha nincs más tagja és nincs előadója
  if (user.organizationId) {
    const otherMembers = await User.countDocuments({
      organizationId: user.organizationId,
      _id: { $ne: user._id },
    });
    const orgArtists = await Artist.exists({ organizationId: user.organizationId });
    if (!otherMembers && !orgArtists) {
      await Organization.deleteOne({ _id: user.organizationId });
    }
  }
  await User.deleteOne({ _id: user._id });
  revalidatePath("/admin/felhasznalok");
  return { ok: true };
}

export async function banUser(userId: string): Promise<ActionResult> {
  const admin = await requireRole("SUPER_ADMIN");
  if (admin.id === userId) return { ok: false, error: "Magadat nem tilthatod." };
  await connectDB();
  const user = await User.findByIdAndUpdate(userId, { $set: { status: "banned" } });
  if (user?.artistId) {
    await Artist.updateOne({ _id: user.artistId }, { $set: { status: "archived" } });
    await Event.updateMany(
      { artistIds: user.artistId, status: "published" },
      { $set: { status: "draft" } },
    );
  }
  revalidatePath("/admin/felhasznalok");
  return { ok: true };
}

export async function unbanUser(userId: string): Promise<ActionResult> {
  await requireRole("SUPER_ADMIN");
  await connectDB();
  await User.updateOne({ _id: userId }, { $set: { status: "active" } });
  revalidatePath("/admin/felhasznalok");
  return { ok: true };
}
