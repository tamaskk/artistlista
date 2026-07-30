import type { PublicEventCard } from "./public-types";

/** Lean event dokumentum → kliensbarát kártya-adat. */
export function toEventCard(e: any): PublicEventCard {
  const promoActive =
    e.promotion?.tier > 0 &&
    e.promotion?.activeUntil &&
    new Date(e.promotion.activeUntil).getTime() >= Date.now();
  return {
    id: String(e._id),
    slug: e.slug,
    title: e.title,
    artistNames: e.artistNames ?? [],
    venueName: e.venueName,
    city: e.city,
    startsAt: new Date(e.startsAt).toISOString(),
    price: {
      kind: e.price?.kind ?? "unknown",
      min: e.price?.min ?? null,
      max: e.price?.max ?? null,
    },
    status: e.status,
    image: e.image ?? "",
    genres: e.genres ?? [],
    lng: e.location?.coordinates?.[0] ?? 0,
    lat: e.location?.coordinates?.[1] ?? 0,
    promoTier: promoActive ? e.promotion.tier : 0,
    saves: e.stats?.saves ?? 0,
  };
}
