import { NextRequest, NextResponse } from "next/server";
import { Artist, Event, connectDB } from "@artistlist/database";
import { CORS_HEADERS, eventToApi } from "@/lib/api-v1";
import { allow, ipFrom } from "@/lib/ratelimit";

export async function OPTIONS() {
  return new NextResponse(null, { headers: CORS_HEADERS });
}

/** GET /api/v1/artists/<slug> — előadó + közelgő fellépései. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  if (!(await allow("api-v1", ipFrom(req.headers)))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: CORS_HEADERS });
  }
  const { slug } = await ctx.params;
  await connectDB();
  const a = await Artist.findOne({ slug, status: "published" }).lean();
  if (!a) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: CORS_HEADERS });
  }
  const upcoming = await Event.find({
    artistIds: a._id,
    status: { $in: ["published", "soldout"] },
    startsAt: { $gte: new Date() },
  })
    .sort({ startsAt: 1 })
    .limit(50)
    .lean();

  return NextResponse.json(
    {
      slug: a.slug,
      name: a.name,
      genres: a.genres ?? [],
      homeCity: a.homeCity || null,
      verified: !!(a as { verified?: boolean }).verified,
      image: a.images?.avatar || null,
      followers: a.stats?.followers ?? 0,
      upcoming: upcoming.map((e) => eventToApi(e as never)),
    },
    { headers: CORS_HEADERS },
  );
}
