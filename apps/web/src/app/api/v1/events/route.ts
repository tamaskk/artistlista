import { NextRequest, NextResponse } from "next/server";
import { Event, connectDB } from "@artistlist/database";
import { CORS_HEADERS, eventToApi } from "@/lib/api-v1";
import { allow, ipFrom } from "@/lib/ratelimit";

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

/**
 * GET /api/v1/events — közelgő publikus események.
 * Query: city, genre (slug), limit (max 50).
 */
export async function GET(req: NextRequest) {
  if (!(await allow("api-v1", ipFrom(req.headers)))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: CORS_HEADERS });
  }
  const sp = req.nextUrl.searchParams;
  const limit = Math.min(50, Math.max(1, Number(sp.get("limit")) || 20));
  const filter: Record<string, unknown> = {
    status: { $in: ["published", "soldout"] },
    startsAt: { $gte: new Date() },
  };
  const city = sp.get("city");
  const genre = sp.get("genre");
  if (city) filter.city = { $regex: `^${city}$`, $options: "i" };
  if (genre) filter.genres = genre;

  await connectDB();
  const docs = await Event.find(filter).sort({ startsAt: 1 }).limit(limit).lean();
  return NextResponse.json(
    { count: docs.length, events: docs.map((e) => eventToApi(e as never)) },
    { headers: CORS_HEADERS },
  );
}
