"use server";

import { revalidatePath } from "next/cache";
import { Venue, connectDB, uniqueSlug } from "@artistlist/database";
import { CITIES, venueSchema, type ActionResult } from "@artistlist/types";
import { requireUser } from "@/lib/session";

/** Javaslatok a helyszín-űrlap dropdownjaihoz (meglévő adatokból). */
export async function getVenueSuggestions(): Promise<{
  names: string[];
  cities: string[];
  streets: string[];
}> {
  await connectDB();
  const [names, cities, streets] = await Promise.all([
    Venue.distinct("name", { status: "active" }),
    Venue.distinct("address.city", { status: "active" }),
    Venue.distinct("address.street", { status: "active" }),
  ]);
  const clean = (arr: unknown[]) =>
    Array.from(new Set(arr.map((s) => String(s).trim()).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, "hu"),
    );
  return {
    names: clean(names),
    cities: clean([...(cities as string[]), ...CITIES]),
    streets: clean(streets).slice(0, 300),
  };
}

export interface PlaceHit {
  name: string;
  street: string;
  city: string;
  postcode: string;
  lng: number;
  lat: number;
  display: string;
}

/**
 * Valós hely-keresés (Google-féle autocomplete) — Nominatim/OpenStreetMap,
 * kulcs nélkül. Globális (külföldi helyszín is jön: SK/RO), magyar nyelvvel.
 */
export async function searchPlaces(query: string): Promise<ActionResult<PlaceHit[]>> {
  await requireUser();
  const q = query.trim();
  if (q.length < 3) return { ok: true, data: [] };
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&accept-language=hu&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "ArtistList/0.1 (hello@artistlist.hu)" },
      next: { revalidate: 600 },
    });
    if (!res.ok) {
      console.warn("[searchPlaces] Nominatim hiba", res.status, "q=", q);
      return { ok: false, error: `Keresési hiba (${res.status})` };
    }
    const results = (await res.json()) as any[];
    const data: PlaceHit[] = results
      .map((r) => {
        const a = r.address ?? {};
        const city = a.city || a.town || a.village || a.municipality || a.county || "";
        const street = [a.road, a.house_number].filter(Boolean).join(" ");
        const name = r.name || street || city || String(r.display_name ?? "").split(",")[0];
        const country = a.country && a.country !== "Magyarország" ? a.country : null;
        const display = [street, [a.postcode, city].filter(Boolean).join(" "), country]
          .filter(Boolean)
          .join(", ");
        return {
          name,
          street: street || (r.name ? "" : city),
          city,
          postcode: a.postcode || "",
          lng: Number(r.lon),
          lat: Number(r.lat),
          display: display || String(r.display_name ?? ""),
        };
      })
      .filter((h) => h.lng && h.lat && h.name);
    console.log("[searchPlaces] q=", q, "→", data.length, "találat");
    return { ok: true, data };
  } catch (e) {
    console.error("[searchPlaces] kivétel", e);
    return { ok: false, error: "A helykeresés nem érhető el." };
  }
}

export async function createVenue(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult<{ id: string; name: string }>> {
  const user = await requireUser();
  const parsed = venueSchema.safeParse({
    name: formData.get("name"),
    street: formData.get("street"),
    city: formData.get("city"),
    zip: formData.get("zip") ?? "",
    country: "HU",
    lng: formData.get("lng"),
    lat: formData.get("lat"),
    type: formData.get("type"),
    capacity: formData.get("capacity") || null,
    website: formData.get("website") || "",
  });
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;

  await connectDB();
  // duplikátum-gyanú: azonos név vagy 200 m-en belüli helyszín ugyanazzal a névkezdettel
  const dup = await Venue.findOne({
    status: "active",
    name: { $regex: `^${data.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
  }).lean();
  if (dup && formData.get("force") !== "1") {
    return {
      ok: false,
      error: `Lehet, hogy már létezik: „${dup.name}" (${dup.address.city}). Küldd el újra a mentést a megerősítéshez.`,
    };
  }

  const venue = await Venue.create({
    name: data.name,
    slug: await uniqueSlug(Venue, data.name),
    address: { street: data.street, city: data.city, zip: data.zip, country: "HU" },
    location: { type: "Point", coordinates: [data.lng, data.lat] },
    type: data.type,
    capacity: data.capacity ?? undefined,
    website: data.website || undefined,
    createdByUserId: user.id,
  });
  revalidatePath("/helyszinek");
  return { ok: true, data: { id: String(venue._id), name: venue.name } };
}

/** Nominatim geokódolás — szerveroldalról, kötelező User-Agenttel. */
export async function geocodeAddress(
  query: string,
): Promise<ActionResult<{ lng: number; lat: number; display: string }[]>> {
  await requireUser();
  if (query.trim().length < 3) return { ok: true, data: [] };
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=hu&limit=5&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "ArtistList/0.1 (hello@artistlist.hu)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { ok: false, error: `Geokódolási hiba (${res.status})` };
    const results = (await res.json()) as { lon: string; lat: string; display_name: string }[];
    return {
      ok: true,
      data: results.map((r) => ({
        lng: Number(r.lon),
        lat: Number(r.lat),
        display: r.display_name,
      })),
    };
  } catch {
    return { ok: false, error: "A geokódolás nem érhető el — add meg kézzel a koordinátákat." };
  }
}
