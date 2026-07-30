/** Nyilvános API v1 — stabil JSON-szerződés partnereknek (jegyértékesítők, média). */
import type { EventDoc } from "@artistlist/database";

const WEB_URL = () => process.env.NEXT_PUBLIC_WEB_URL || "https://koncertlista.hu";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, max-age=300",
};

/** Egy esemény publikus API-alakja (denormalizált mezőkből — nincs belső id-szivárgás). */
export function eventToApi(e: EventDoc) {
  return {
    slug: e.slug,
    title: e.title,
    artists: e.artistNames ?? [],
    venue: e.venueName,
    city: e.city,
    startsAt: new Date(e.startsAt).toISOString(),
    genres: e.genres ?? [],
    status: e.status,
    price:
      e.price?.kind === "paid"
        ? { kind: "paid", min: e.price.min ?? null, max: e.price.max ?? null, currency: e.price.currency }
        : { kind: e.price?.kind ?? "unknown" },
    ticketUrl: e.ticketUrl ?? null,
    url: `${WEB_URL()}/esemenyek/${e.slug}`,
    image: e.image ?? null,
  };
}
