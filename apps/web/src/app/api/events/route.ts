import { NextRequest, NextResponse } from "next/server";
import { Event, connectDB } from "@artistlist/database";
import { toEventCard } from "@/lib/serialize";

const PUBLIC_STATUSES = ["published", "soldout", "cancelled"];
const MAX_PINS = 500;

export async function GET(req: NextRequest) {
  await connectDB();
  const sp = req.nextUrl.searchParams;

  // kedvencek: slug-lista lekérés
  const slugs = sp.get("slugs");
  if (slugs) {
    const events = await Event.find({
      slug: { $in: slugs.split(",").slice(0, 100) },
      status: { $in: PUBLIC_STATUSES },
    })
      .sort({ startsAt: 1 })
      .lean();
    return NextResponse.json({ events: events.map(toEventCard) });
  }

  const filter: Record<string, unknown> = { status: { $in: PUBLIC_STATUSES } };

  const from = sp.get("from") ? new Date(sp.get("from")!) : new Date();
  const to = sp.get("to") ? new Date(sp.get("to")!) : null;
  filter.startsAt = to ? { $gte: from, $lte: to } : { $gte: from };

  const city = sp.get("city");
  if (city) {
    filter.city = { $regex: `^${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" };
  } else {
    const bbox = sp.get("bbox");
    if (bbox) {
      const parts = bbox.split(",").map(Number);
      if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
        const [swLng, swLat, neLng, neLat] = parts;
        filter.location = {
          $geoWithin: {
            $box: [
              [swLng, swLat],
              [neLng, neLat],
            ],
          },
        };
      }
    }
  }

  const genres = sp.get("genres")?.split(",").filter(Boolean);
  if (genres?.length) filter.genres = { $in: genres };

  const free = sp.get("free") === "1" || sp.get("free") === "true";
  const priceMax = sp.get("priceMax") ? Number(sp.get("priceMax")) : null;
  if (free) {
    filter["price.kind"] = "free";
  } else if (priceMax) {
    (filter as any).$or = [{ "price.kind": "free" }, { "price.min": { $lte: priceMax } }];
  }

  const q = sp.get("q");
  if (q) {
    const rx = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    (filter as any).$and = [
      ...((filter as any).$and ?? []),
      { $or: [{ title: rx }, { artistNames: rx }, { venueName: rx }] },
    ];
  }

  const sort = sp.get("sort") ?? "date";
  const sortSpec: Record<string, 1 | -1> =
    sort === "price"
      ? { "price.min": 1, startsAt: 1, _id: 1 }
      : sort === "popular"
        ? { "stats.saves": -1, startsAt: 1, _id: 1 }
        : { startsAt: 1, _id: 1 };

  // a lista alap 24-esével lapoz; a térkép `limit`-tel az összeset kéri (max 500)
  const limit = Math.min(Number(sp.get("limit")) || 24, 500);
  const cursor = sp.get("cursor");
  const pageFilter = { ...filter };
  if (cursor && sort === "date") {
    const [iso, id] = cursor.split("|");
    (pageFilter as any).$or = [
      { startsAt: { $gt: new Date(iso) } },
      { startsAt: new Date(iso), _id: { $gt: id } },
    ];
    // dátumszűrővel kombinálás: $and-be tesszük
    (pageFilter as any).$and = [
      { startsAt: pageFilter.startsAt },
      { $or: (pageFilter as any).$or },
      ...((filter as any).$and ?? []),
    ];
    delete (pageFilter as any).startsAt;
    delete (pageFilter as any).$or;
  }

  const now = new Date();
  const promoFilter = {
    ...filter,
    "promotion.tier": { $gt: 0 },
    "promotion.activeUntil": { $gte: now },
  };
  const [docs, total, pinDocs, promotedDocs] = await Promise.all([
    Event.find(pageFilter).sort(sortSpec).limit(limit + 1).lean(),
    Event.countDocuments(filter),
    Event.find(filter).select("slug location").limit(MAX_PINS + 1).lean(),
    Event.find(promoFilter)
      .sort({ "promotion.tier": -1, startsAt: 1 })
      .limit(24)
      .lean(),
  ]);

  const hasMore = docs.length > limit;
  const page = hasMore ? docs.slice(0, limit) : docs;
  const last = page[page.length - 1];
  const nextCursor =
    hasMore && sort === "date" && last
      ? `${new Date(last.startsAt).toISOString()}|${String(last._id)}`
      : null;

  return NextResponse.json(
    {
      events: page.map(toEventCard),
      promoted: promotedDocs.map(toEventCard),
      pins: pinDocs.slice(0, MAX_PINS).map((p) => ({
        id: String(p._id),
        slug: p.slug,
        lng: p.location?.coordinates?.[0] ?? 0,
        lat: p.location?.coordinates?.[1] ?? 0,
      })),
      total,
      nextCursor,
      tooMany: pinDocs.length > MAX_PINS,
    },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
  );
}
