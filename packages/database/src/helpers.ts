import { slugify } from "@artistlist/types";
import type { Model } from "mongoose";
import { Artist } from "./models/artist";
import { Event } from "./models/event";
import type { VenueDoc } from "./models/venue";

/** Ütközésmentes slug: foglaltság esetén számozott suffix (`-2`, `-3`, …). */
export async function uniqueSlug(
  model: Model<any>,
  base: string,
  excludeId?: unknown,
): Promise<string> {
  const root = slugify(base) || "elem";
  let candidate = root;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await model.findOne({ slug: candidate }).select("_id").lean();
    if (!existing || (excludeId && String((existing as any)._id) === String(excludeId))) {
      return candidate;
    }
    candidate = `${root}-${n++}`;
  }
}

/** Helyszín-változás után a denormalizált event-mezők szinkronja. */
export async function syncVenueToEvents(venue: VenueDoc): Promise<void> {
  await Event.updateMany(
    { venueId: venue._id },
    {
      $set: {
        location: venue.location,
        city: venue.address.city,
        venueName: venue.name,
      },
    },
  );
}

/** Előadó-átnevezés után az `artistNames` szinkronja. */
export async function syncArtistNameToEvents(artistId: unknown): Promise<void> {
  const events = await Event.find({ artistIds: artistId }).select("_id artistIds");
  for (const ev of events) {
    const artists = await Artist.find({ _id: { $in: ev.artistIds } }).select("name");
    const byId = new Map(artists.map((a) => [String(a._id), a.name]));
    const names = ev.artistIds.map((id) => byId.get(String(id))).filter(Boolean) as string[];
    await Event.updateOne({ _id: ev._id }, { $set: { artistNames: names } });
  }
}

/**
 * Előadó-avatar változása után az esemény `image` (denormalizált) szinkronja.
 * Minden eseményt frissít, ahol ez az előadó a headliner (artistIds[0]) — az
 * aktuális avatar az igazságforrás, így a régi (seed) kép is felülíródik.
 */
export async function syncArtistImageToEvents(artistId: unknown): Promise<void> {
  const artist = await Artist.findById(artistId).select("images");
  const avatar = artist?.images?.avatar;
  if (!avatar) return;
  await Event.updateMany(
    { $expr: { $eq: [{ $arrayElemAt: ["$artistIds", 0] }, artist._id] } },
    { $set: { image: avatar } },
  );
}

/** Esemény denormalizált mezőinek kiszámítása mentés előtt. */
export async function computeEventDenorm(input: {
  artistIds: unknown[];
  venueId: unknown;
  genres?: string[];
}): Promise<{
  location: { type: "Point"; coordinates: number[] };
  city: string;
  venueName: string;
  artistNames: string[];
  genres: string[];
}> {
  const { Venue } = await import("./models/venue");
  const venue = await Venue.findById(input.venueId);
  if (!venue) throw new Error("A helyszín nem található");
  const artists = await Artist.find({ _id: { $in: input.artistIds } }).select("name genres");
  const byId = new Map(artists.map((a) => [String(a._id), a]));
  const ordered = input.artistIds
    .map((id) => byId.get(String(id)))
    .filter(Boolean) as (typeof artists)[number][];
  const genres =
    input.genres && input.genres.length
      ? input.genres
      : [...new Set(ordered.flatMap((a) => a.genres))].slice(0, 5);
  return {
    location: { type: "Point", coordinates: venue.location.coordinates },
    city: venue.address.city,
    venueName: venue.name,
    artistNames: ordered.map((a) => a.name),
    genres,
  };
}
