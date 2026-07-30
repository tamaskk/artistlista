import { NextRequest, NextResponse } from "next/server";
import { Event, Venue, connectDB } from "@artistlist/database";

function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  await connectDB();
  const { slug } = await ctx.params;
  const event = await Event.findOne({ slug, status: { $in: ["published", "soldout"] } }).lean();
  if (!event) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const venue = await Venue.findById(event.venueId).lean();

  const start = new Date(event.startsAt);
  const end = event.endsAt
    ? new Date(event.endsAt)
    : new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const location = venue
    ? `${venue.name}, ${venue.address.zip ?? ""} ${venue.address.city}, ${venue.address.street}`
    : event.venueName;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ArtistList//HU",
    "BEGIN:VEVENT",
    `UID:${String(event._id)}@artistlist.hu`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${esc(event.title)}`,
    `LOCATION:${esc(location)}`,
    event.ticketUrl ? `URL:${event.ticketUrl}` : null,
    event.description ? `DESCRIPTION:${esc(event.description)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
    },
  });
}
