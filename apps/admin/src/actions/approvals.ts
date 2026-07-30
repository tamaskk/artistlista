"use server";

import { revalidatePath } from "next/cache";
import { Artist, Event, connectDB } from "@artistlist/database";
import type { ActionResult } from "@artistlist/types";
import { requireRole, requireUser, type SessionUser } from "@/lib/session";
import { notifyFollowersOfEvent } from "@/lib/notify";

/** Jóváhagyhatja-e a user az adott pending eseményt? (útvonal szerint) */
function canApproveEvent(
  user: SessionUser,
  ev: { organizationId?: unknown; pendingApprovalArtistId?: unknown; artistIds: unknown[] },
): boolean {
  if (user.role === "SUPER_ADMIN") return true;
  if (user.role === "MANAGER") {
    return !!user.organizationId && String(ev.organizationId) === user.organizationId;
  }
  if (user.role === "ARTIST") {
    return (
      !!user.artistId &&
      (String(ev.pendingApprovalArtistId) === user.artistId ||
        ev.artistIds.map(String).includes(user.artistId))
    );
  }
  return false;
}

export async function approveEvent(eventId: string): Promise<ActionResult> {
  const user = await requireUser();
  await connectDB();
  const ev = await Event.findById(eventId).select(
    "status organizationId pendingApprovalArtistId artistIds",
  );
  if (!ev) return { ok: false, error: "Az esemény nem található." };
  if (ev.status !== "pending") return { ok: false, error: "Ez az esemény nincs jóváhagyásra várva." };
  if (!canApproveEvent(user, ev)) {
    return { ok: false, error: "Nincs jogosultságod jóváhagyni ezt az eseményt." };
  }
  await Event.updateOne(
    { _id: eventId },
    { $set: { status: "published" }, $unset: { pendingApprovalArtistId: 1 } },
  );
  // Ha új (pending) előadóhoz tartozik, azt is élesítjük a jóváhagyással.
  await Artist.updateMany(
    { _id: { $in: ev.artistIds }, status: "pending" },
    { $set: { status: "published" } },
  );
  // headliner követőinek értesítése (egyszer)
  await notifyFollowersOfEvent(eventId);
  revalidatePath("/jovahagyas");
  revalidatePath("/esemenyek");
  return { ok: true };
}

export async function rejectEvent(eventId: string, reason: string): Promise<ActionResult> {
  const user = await requireUser();
  await connectDB();
  const ev = await Event.findById(eventId).select(
    "status organizationId pendingApprovalArtistId artistIds",
  );
  if (!ev) return { ok: false, error: "Az esemény nem található." };
  if (!canApproveEvent(user, ev)) {
    return { ok: false, error: "Nincs jogosultságod ehhez az eseményhez." };
  }
  void reason; // MVP: az indoklást nem tároljuk, csak visszaállítjuk piszkozatra
  await Event.updateOne({ _id: eventId }, { $set: { status: "draft" } });
  revalidatePath("/jovahagyas");
  return { ok: true };
}

/** Superadmin: előadó menedzsmenthez (szervezethez) rendelése. */
export async function assignArtistToOrg(artistId: string, orgId: string): Promise<ActionResult> {
  await requireRole("SUPER_ADMIN");
  if (!orgId) return { ok: false, error: "Válassz menedzsmentet." };
  await connectDB();
  await Artist.updateOne(
    { _id: artistId },
    { $set: { organizationId: orgId, ownerType: "organization" } },
  );
  // a hozzá tartozó, még jóváhagyásra váró események az adott org alá kerülnek
  await Event.updateMany(
    { artistIds: artistId, status: "pending" },
    { $set: { organizationId: orgId }, $unset: { pendingApprovalArtistId: 1 } },
  );
  revalidatePath("/jovahagyas");
  revalidatePath("/admin/moderacio");
  return { ok: true };
}
