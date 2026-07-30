import { NextRequest, NextResponse } from "next/server";
import { Artist, Event, connectDB } from "@artistlist/database";
import { toEventCard } from "@/lib/serialize";

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  await connectDB();
  const { slug } = await ctx.params;
  const artist = await Artist.findOne({ slug, status: "published" }).select("_id").lean();
  if (!artist) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const scope = req.nextUrl.searchParams.get("scope") ?? "upcoming";
  const now = new Date();
  const filter =
    scope === "past"
      ? { artistIds: artist._id, status: { $in: ["published", "soldout", "cancelled"] }, startsAt: { $lt: now } }
      : { artistIds: artist._id, status: { $in: ["published", "soldout", "cancelled"] }, startsAt: { $gte: now } };
  const events = await Event.find(filter)
    .sort({ startsAt: scope === "past" ? -1 : 1 })
    .limit(50)
    .lean();
  return NextResponse.json(
    { events: events.map(toEventCard) },
    { headers: { "Cache-Control": "public, s-maxage=60" } },
  );
}
