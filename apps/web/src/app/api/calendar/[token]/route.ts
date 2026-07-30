import { NextRequest, NextResponse } from "next/server";
import { Event, User, Venue, connectDB } from "@artistlist/database";
import { buildCalendar, type IcsEvent } from "@/lib/ics";

const WEB_URL = () => process.env.NEXT_PUBLIC_WEB_URL || "https://koncertlista.hu";

/**
 * Előfizethető naptár-feed (Google/Apple Calendar): a user kedvenceit adja
 * vissza .ics-ben. A `token` a User.calendarToken — cookie helyett ez azonosít,
 * mert a naptár-appok háttérben kérik le, süti nélkül.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "invalid_token" }, { status: 404 });
  }
  await connectDB();
  const user = await User.findOne({ calendarToken: token }).select("savedEventSlugs name").lean();
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const slugs = user.savedEventSlugs ?? [];
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // tegnaptól (múltbéli lejár)
  const events = slugs.length
    ? await Event.find({
        slug: { $in: slugs },
        status: { $in: ["published", "soldout"] },
        startsAt: { $gte: since },
      })
        .sort({ startsAt: 1 })
        .lean()
    : [];

  const venueIds = [...new Set(events.map((e) => String(e.venueId)).filter(Boolean))];
  const venues = venueIds.length ? await Venue.find({ _id: { $in: venueIds } }).lean() : [];
  const venueById = new Map(venues.map((v) => [String(v._id), v]));

  const items: IcsEvent[] = events.map((e) => {
    const v = venueById.get(String(e.venueId));
    const location = v
      ? `${v.name}, ${v.address?.zip ?? ""} ${v.address?.city ?? ""}, ${v.address?.street ?? ""}`.trim()
      : e.venueName;
    return {
      id: String(e._id),
      slug: e.slug,
      title: e.title,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      location,
      url: `${WEB_URL()}/esemenyek/${e.slug}`,
      description: e.description,
    };
  });

  const ics = buildCalendar(items, "Koncertlista — kedvenceim");
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="koncertlista-kedvencek.ics"',
      // a naptár-appok gyakran töltik újra — rövid cache
      "Cache-Control": "public, max-age=1800",
    },
  });
}
