import { Artist, Event, User, connectDB } from "@artistlist/database";
import { formatEventDate } from "@artistlist/types";
import { sendMail } from "./mail";

const WEB_URL = () => process.env.NEXT_PUBLIC_WEB_URL || "https://koncertlista.hu";

/**
 * Publikálás után értesíti a headliner előadó követőit — egyszer
 * (a `followersNotifiedAt` jelző véd a duplikált kiküldés ellen).
 */
export async function notifyFollowersOfEvent(eventId: string): Promise<void> {
  await connectDB();
  const ev = await Event.findById(eventId);
  if (!ev || ev.status !== "published" || (ev as any).followersNotifiedAt) return;
  const headliner = ev.artistIds?.[0];
  if (!headliner) return;

  // előbb bélyegezzük, hogy párhuzamos hívás ne duplázzon
  await Event.updateOne({ _id: ev._id }, { $set: { followersNotifiedAt: new Date() } });

  const followers = await User.find({ followedArtistIds: headliner, status: "active" })
    .select("email name")
    .lean();
  if (!followers.length) return;

  const artist = await Artist.findById(headliner).select("name").lean();
  const url = `${WEB_URL()}/esemenyek/${ev.slug}`;
  const when = formatEventDate(ev.startsAt);
  for (const f of followers) {
    await sendMail(
      f.email,
      `${artist?.name ?? "Kedvenc előadód"} új koncertet jelentett be`,
      `Szia ${f.name}!\n\n${artist?.name ?? "Egy követett előadód"} fellép:\n` +
        `${ev.title}\n${ev.venueName}, ${ev.city} — ${when}\n\n` +
        `Részletek és jegy: ${url}\n\n` +
        `A követéseidet a fiókodban kezelheted a koncertlista.hu-n.`,
    );
  }
}
