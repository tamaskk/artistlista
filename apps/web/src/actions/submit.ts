"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Artist,
  Event,
  Venue,
  computeEventDenorm,
  connectDB,
  uniqueSlug,
} from "@artistlist/database";
import { submitEventSchema, type ActionResult } from "@artistlist/types";
import { getSessionUser } from "@/lib/session";
import { cityCentroid } from "@/lib/geo";
import { allow, ipFrom } from "@/lib/ratelimit";

export async function submitEvent(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Jelentkezz be a beküldéshez." };
  if (!(await allow("submit", ipFrom(await headers())))) {
    return { ok: false, error: "Túl sok beküldés rövid idő alatt — próbáld pár perc múlva." };
  }

  const parsed = submitEventSchema.safeParse({
    title: formData.get("title"),
    existingArtistId: formData.get("existingArtistId") ?? "",
    newArtistName: formData.get("newArtistName") ?? "",
    newArtistGenres: formData.getAll("newArtistGenres").map(String).filter(Boolean),
    existingVenueId: formData.get("existingVenueId") ?? "",
    newVenueName: formData.get("newVenueName") ?? "",
    newVenueCity: formData.get("newVenueCity") ?? "",
    startsAt: formData.get("startsAt"),
    priceKind: formData.get("priceKind") ?? "unknown",
    priceMin: formData.get("priceMin") || null,
    ticketUrl: formData.get("ticketUrl") || "",
    image: formData.get("image") ?? "",
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;

  await connectDB();

  // 1. Előadó: meglévő kiválasztása VAGY új létrehozása (utóbbi → pending).
  let artist;
  let newArtistCreated = false;
  if (data.existingArtistId) {
    artist = await Artist.findById(data.existingArtistId);
    if (!artist) return { ok: false, fieldErrors: { existingArtistId: ["A kiválasztott előadó nem található."] } };
  } else {
    artist = await Artist.create({
      name: data.newArtistName,
      slug: await uniqueSlug(Artist, data.newArtistName),
      genres: data.newArtistGenres,
      ownerType: "user",
      submittedByUserId: user.id,
      status: "pending",
    });
    newArtistCreated = true;
  }

  // 2. Helyszín: meglévő VAGY új (város-középpont koordinátával).
  let venue;
  if (data.existingVenueId) {
    venue = await Venue.findById(data.existingVenueId);
    if (!venue) return { ok: false, fieldErrors: { existingVenueId: ["A kiválasztott helyszín nem található."] } };
  } else {
    const [lng, lat] = cityCentroid(data.newVenueCity);
    venue = await Venue.create({
      name: data.newVenueName,
      slug: await uniqueSlug(Venue, data.newVenueName),
      address: { street: data.newVenueName, city: data.newVenueCity, zip: "", country: "HU" },
      location: { type: "Point", coordinates: [lng, lat] },
      type: "other",
      createdByUserId: user.id,
      status: "active",
    });
  }

  // 3. Esemény létrehozása pending státusszal + jóváhagyás-útvonal.
  //    - új előadó, vagy létező de se menedzsment se tulaj → superadmin
  //    - létező előadó + menedzsment (org) → a menedzsment hagyja jóvá
  //    - létező előadó + tulaj (claim-elt), nincs org → maga az előadó
  const denorm = await computeEventDenorm({ artistIds: [artist._id], venueId: venue._id });
  const doc: Record<string, unknown> = {
    title: data.title,
    slug: await uniqueSlug(Event, `${data.title}-${data.startsAt.toISOString().slice(0, 10)}`),
    artistIds: [artist._id],
    venueId: venue._id,
    ...denorm,
    startsAt: data.startsAt,
    price: {
      kind: data.priceKind,
      min: data.priceMin ?? undefined,
      currency: "HUF",
    },
    ticketUrl: data.ticketUrl || undefined,
    description: data.description,
    image: data.image || artist.images?.avatar || "",
    status: "pending",
    submittedByUserId: user.id,
    createdByUserId: user.id,
  };
  if (!newArtistCreated && artist.organizationId) {
    doc.organizationId = artist.organizationId;
  } else if (!newArtistCreated && artist.ownerUserId) {
    doc.pendingApprovalArtistId = artist._id;
  }
  await Event.create(doc);

  redirect(`/koncert-bekuldese?bekuldve=1&uj=${newArtistCreated ? 1 : 0}`);
}
