import { Artist, Event, User, connectDB } from "@artistlist/database";
import { formatEventDate, formatHuf } from "@artistlist/types";
import { sendMail } from "./mail";

const WEB_URL = () => process.env.NEXT_PUBLIC_WEB_URL || "https://koncertlista.hu";

/** Egy esemény kedvencelőit szedi össze (aktív fiók). */
async function favoritersOf(slug: string) {
  return User.find({ savedEventSlugs: slug, status: "active" }).select("email name").lean();
}

/**
 * Publikálás után értesíti a headliner előadó követőit — egyszer
 * (a `followersNotifiedAt` jelző véd a duplikált kiküldés ellen).
 */
export async function notifyFollowersOfEvent(eventId: string): Promise<void> {
  await connectDB();
  const ev = await Event.findById(eventId);
  if (!ev || ev.status !== "published" || (ev as any).followersNotifiedAt) return;
  const headliner = ev.artistIds?.[0];

  // előbb bélyegezzük, hogy párhuzamos hívás ne duplázzon
  await Event.updateOne({ _id: ev._id }, { $set: { followersNotifiedAt: new Date() } });

  // értesítjük: az előadó követőit + a város követőit + a műfaj(ok) követőit — e-mail-re dedupolva
  const or: Record<string, unknown>[] = [];
  if (headliner) or.push({ followedArtistIds: headliner });
  if (ev.city) or.push({ followedCities: ev.city });
  if (ev.genres?.length) or.push({ followedGenres: { $in: ev.genres } });
  if (!or.length) return;

  const followers = await User.find({ $or: or, status: "active" }).select("email name").lean();
  if (!followers.length) return;

  const artist = headliner ? await Artist.findById(headliner).select("name").lean() : null;
  const url = `${WEB_URL()}/esemenyek/${ev.slug}`;
  const when = formatEventDate(ev.startsAt);
  const subject = artist?.name
    ? `${artist.name} új koncertet jelentett be`
    : `Új koncert a követéseid alapján`;
  const lead = artist?.name ? `${artist.name} fellép:` : `Új koncert, ami érdekelhet:`;
  for (const f of followers) {
    await sendMail(
      f.email,
      subject,
      `Szia ${f.name}!\n\n${lead}\n` +
        `${ev.title}\n${ev.venueName}, ${ev.city} — ${when}\n\n` +
        `Részletek és jegy: ${url}\n\n` +
        `A követéseidet a fiókodban kezelheted a koncertlista.hu-n.`,
    );
  }
}

/** Lemondáskor értesíti azokat, akik kedvencelték az eseményt (indokkal). */
export async function notifyFavoritersOfCancellation(
  eventId: string,
  reason: string,
): Promise<void> {
  await connectDB();
  const ev = await Event.findById(eventId).select("slug title venueName city");
  if (!ev) return;
  const fans = await favoritersOf(ev.slug);
  if (!fans.length) return;
  const url = `${WEB_URL()}/esemenyek/${ev.slug}`;
  for (const f of fans) {
    await sendMail(
      f.email,
      `Elmarad: ${ev.title}`,
      `Szia ${f.name}!\n\nSajnos elmarad egy koncert, amit mentettél:\n` +
        `${ev.title}\n${ev.venueName}, ${ev.city}\n` +
        (reason ? `Indok: ${reason}\n` : "") +
        `\nRészletek: ${url}`,
    );
  }
}

/** Árcsökkenéskor értesíti a kedvencelőket (csak ha olcsóbb lett — jó hír). */
export async function notifyFavoritersOfPriceDrop(
  eventId: string,
  oldMin: number,
  newMin: number,
): Promise<void> {
  await connectDB();
  const ev = await Event.findById(eventId).select("slug title venueName city status");
  if (!ev || !["published", "soldout"].includes(ev.status)) return;
  const fans = await favoritersOf(ev.slug);
  if (!fans.length) return;
  const url = `${WEB_URL()}/esemenyek/${ev.slug}`;
  for (const f of fans) {
    await sendMail(
      f.email,
      `Olcsóbb lett: ${ev.title}`,
      `Szia ${f.name}!\n\nJó hír — olcsóbb lett egy koncert, amit mentettél:\n` +
        `${ev.title}\n${ev.venueName}, ${ev.city}\n` +
        `Ár: ${formatHuf(oldMin)} → ${formatHuf(newMin)}\n\n` +
        `Részletek és jegy: ${url}`,
    );
  }
}

/** Telt ház ("utolsó jegyek" → elfogyott): értesíti a kedvencelőket. */
export async function notifyFavoritersOfSoldOut(eventId: string): Promise<void> {
  await connectDB();
  const ev = await Event.findById(eventId).select("slug title venueName city");
  if (!ev) return;
  const fans = await favoritersOf(ev.slug);
  if (!fans.length) return;
  const url = `${WEB_URL()}/esemenyek/${ev.slug}`;
  for (const f of fans) {
    await sendMail(
      f.email,
      `Telt ház: ${ev.title}`,
      `Szia ${f.name}!\n\nElfogytak a jegyek egy koncertre, amit mentettél:\n` +
        `${ev.title}\n${ev.venueName}, ${ev.city}\n\n` +
        `Ha lesz még jegy, itt tudod követni: ${url}`,
    );
  }
}
