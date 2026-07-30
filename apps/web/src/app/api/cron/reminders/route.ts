import { NextRequest, NextResponse } from "next/server";
import { Event, User, connectDB } from "@artistlist/database";
import { formatEventDate } from "@artistlist/types";
import { sendMail } from "@/lib/mail";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const WEB_URL = () => process.env.NEXT_PUBLIC_WEB_URL || "https://koncertlista.hu";

/**
 * Napi cron: a HOLNAP kezdődő koncertekre emlékeztetőt küld azoknak, akik
 * kedvencelték. Egyszeri (reminderSentAt jelző). Vercel Cron hívja (CRON_SECRET).
 */
export async function GET(req: NextRequest) {
  if (
    process.env.CRON_SECRET &&
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  await connectDB();

  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() + 1); // holnap 00:00 UTC
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const events = await Event.find({
    status: "published",
    startsAt: { $gte: start, $lt: end },
    reminderSentAt: { $exists: false },
  }).select("slug title venueName city startsAt");

  let mails = 0;
  for (const ev of events) {
    await Event.updateOne({ _id: ev._id }, { $set: { reminderSentAt: new Date() } });
    const fans = await User.find({ savedEventSlugs: ev.slug, status: "active" })
      .select("email name")
      .lean();
    const url = `${WEB_URL()}/esemenyek/${ev.slug}`;
    const when = formatEventDate(ev.startsAt);
    for (const f of fans) {
      await sendMail(
        f.email,
        `Holnap: ${ev.title}`,
        `Szia ${f.name}!\n\nEmlékeztető — holnap koncert, amit mentettél:\n` +
          `${ev.title}\n${ev.venueName}, ${ev.city} — ${when}\n\nRészletek: ${url}`,
      );
      mails++;
    }
  }
  return NextResponse.json({ ok: true, events: events.length, mails });
}
