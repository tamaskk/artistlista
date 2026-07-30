import { Artist, Event, Genre, Venue, connectDB } from "@artistlist/database";
import { toEventCard } from "./serialize";
import type { PublicEventCard } from "./public-types";

const PUBLIC_STATUSES = ["published", "soldout", "cancelled"];

/** Közelgő látható események (lemondottak 7 napig még látszanak). */
export async function getUpcomingEvents(limit = 24): Promise<PublicEventCard[]> {
  await connectDB();
  const now = new Date();
  const events = await Event.find({
    status: { $in: PUBLIC_STATUSES },
    startsAt: { $gte: now },
  })
    .sort({ startsAt: 1 })
    .limit(limit)
    .lean();
  return events.map(toEventCard);
}

/** "Ezt jelölték be a legtöbben": legtöbbször mentett koncert + előadó. */
export async function getMostLiked() {
  await connectDB();
  const now = new Date();
  const topEventDoc = await Event.findOne({
    status: { $in: PUBLIC_STATUSES },
    startsAt: { $gte: now },
    "stats.saves": { $gt: 0 },
  })
    .sort({ "stats.saves": -1 })
    .lean();

  const agg = await Event.aggregate([
    { $match: { status: { $in: PUBLIC_STATUSES }, "stats.saves": { $gt: 0 } } },
    { $group: { _id: { $arrayElemAt: ["$artistIds", 0] }, saves: { $sum: "$stats.saves" } } },
    { $sort: { saves: -1 } },
    { $limit: 1 },
  ]);
  let topArtist: {
    id: string;
    slug: string;
    name: string;
    genres: string[];
    avatar: string;
    saves: number;
  } | null = null;
  if (agg[0]?._id) {
    const a = await Artist.findOne({ _id: agg[0]._id, status: "published" }).lean();
    if (a) {
      topArtist = {
        id: String(a._id),
        slug: a.slug,
        name: a.name,
        genres: a.genres,
        avatar: a.images?.avatar ?? "",
        saves: agg[0].saves,
      };
    }
  }
  return { topEvent: topEventDoc ? toEventCard(topEventDoc) : null, topArtist };
}

export async function getFeaturedArtists(limit = 8) {
  await connectDB();
  const artists = await Artist.find({ status: "published", featured: true })
    .sort({ "stats.followers": -1 })
    .limit(limit)
    .lean();
  return artists.map((a) => ({
    id: String(a._id),
    slug: a.slug,
    name: a.name,
    genres: a.genres,
    avatar: a.images?.avatar ?? "",
  }));
}

export async function getNewArtists(limit = 6) {
  await connectDB();
  const artists = await Artist.find({ status: "published" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return artists.map((a) => ({
    id: String(a._id),
    slug: a.slug,
    name: a.name,
    genres: a.genres,
    avatar: a.images?.avatar ?? "",
  }));
}

export async function getGenreCounts() {
  await connectDB();
  const genres = await Genre.find().sort({ order: 1 }).lean();
  const counts = await Event.aggregate([
    { $match: { status: "published", startsAt: { $gte: new Date() } } },
    { $unwind: "$genres" },
    { $group: { _id: "$genres", n: { $sum: 1 } } },
  ]);
  const byGenre = new Map(counts.map((c) => [c._id, c.n]));
  return genres.map((g) => ({
    name: g.name,
    slug: g.slug,
    count: byGenre.get(g.slug) ?? 0,
  }));
}

export async function getCityCounts() {
  await connectDB();
  const counts = await Event.aggregate([
    { $match: { status: "published", startsAt: { $gte: new Date() } } },
    { $group: { _id: "$city", n: { $sum: 1 } } },
    { $sort: { n: -1 } },
    { $limit: 8 },
  ]);
  return counts.map((c) => ({ city: c._id as string, count: c.n as number }));
}

export async function getTrendingEvents(limit = 4): Promise<PublicEventCard[]> {
  await connectDB();
  const events = await Event.find({ status: "published", startsAt: { $gte: new Date() } })
    .sort({ "stats.saves": -1, "stats.views": -1 })
    .limit(limit)
    .lean();
  return events.map(toEventCard);
}

export async function getPopularVenues(limit = 4) {
  await connectDB();
  const counts = await Event.aggregate([
    { $match: { status: "published", startsAt: { $gte: new Date() } } },
    { $group: { _id: "$venueId", n: { $sum: 1 } } },
    { $sort: { n: -1 } },
    { $limit: limit },
  ]);
  const venues = await Venue.find({ _id: { $in: counts.map((c) => c._id) } }).lean();
  const byId = new Map(venues.map((v) => [String(v._id), v]));
  return counts
    .map((c) => {
      const v = byId.get(String(c._id));
      if (!v) return null;
      return {
        id: String(v._id),
        slug: v.slug,
        name: v.name,
        city: v.address.city,
        count: c.n as number,
      };
    })
    .filter(Boolean) as { id: string; slug: string; name: string; city: string; count: number }[];
}

export async function getEventBySlug(slug: string) {
  await connectDB();
  const event = await Event.findOne({ slug, status: { $in: PUBLIC_STATUSES } }).lean();
  if (!event) return null;
  const [artists, venue] = await Promise.all([
    Artist.find({ _id: { $in: event.artistIds } }).lean(),
    Venue.findById(event.venueId).lean(),
  ]);
  const byId = new Map(artists.map((a) => [String(a._id), a]));
  const lineup = event.artistIds
    .map((id) => byId.get(String(id)))
    .filter(Boolean)
    .map((a: any) => ({
      id: String(a._id),
      slug: a.slug,
      name: a.name,
      genres: a.genres,
      avatar: a.images?.avatar ?? "",
      published: a.status === "published",
    }));
  return { event, lineup, venue };
}

export async function getArtistBySlug(slug: string) {
  await connectDB();
  const artist = await Artist.findOne({ slug, status: "published" }).lean();
  if (!artist) return null;
  const now = new Date();
  const [upcoming, past] = await Promise.all([
    Event.find({ artistIds: artist._id, status: { $in: PUBLIC_STATUSES }, startsAt: { $gte: now } })
      .sort({ startsAt: 1 })
      .lean(),
    Event.find({ artistIds: artist._id, status: { $in: PUBLIC_STATUSES }, startsAt: { $lt: now } })
      .sort({ startsAt: -1 })
      .limit(10)
      .lean(),
  ]);
  return { artist, upcoming: upcoming.map(toEventCard), past: past.map(toEventCard) };
}

export async function getVenueBySlug(slug: string) {
  await connectDB();
  const venue = await Venue.findOne({ slug, status: "active" }).lean();
  if (!venue) return null;
  const upcoming = await Event.find({
    venueId: venue._id,
    status: { $in: PUBLIC_STATUSES },
    startsAt: { $gte: new Date() },
  })
    .sort({ startsAt: 1 })
    .lean();
  return { venue, upcoming: upcoming.map(toEventCard) };
}

export async function getArtistCatalog(params: { q?: string; genre?: string; letter?: string }) {
  await connectDB();
  const filter: Record<string, unknown> = { status: "published" };
  if (params.genre) filter.genres = params.genre;
  if (params.letter) filter.name = { $regex: `^${params.letter}`, $options: "i" };
  if (params.q) filter.$text = { $search: params.q };
  const artists = await Artist.find(filter).sort({ name: 1 }).limit(100).lean();
  return artists.map((a) => ({
    id: String(a._id),
    slug: a.slug,
    name: a.name,
    genres: a.genres,
    shortBio: a.shortBio ?? "",
    homeCity: a.homeCity ?? "",
    avatar: a.images?.avatar ?? "",
  }));
}

export async function getVenueList() {
  await connectDB();
  const venues = await Venue.find({ status: "active" }).sort({ name: 1 }).limit(200).lean();
  const counts = await Event.aggregate([
    { $match: { status: "published", startsAt: { $gte: new Date() } } },
    { $group: { _id: "$venueId", n: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));
  return venues.map((v) => ({
    id: String(v._id),
    slug: v.slug,
    name: v.name,
    city: v.address.city,
    street: v.address.street,
    type: v.type,
    count: byId.get(String(v._id)) ?? 0,
  }));
}

export async function getCityEvents(city: string): Promise<PublicEventCard[]> {
  await connectDB();
  const events = await Event.find({
    city: { $regex: `^${city}$`, $options: "i" },
    status: { $in: PUBLIC_STATUSES },
    startsAt: { $gte: new Date() },
  })
    .sort({ startsAt: 1 })
    .limit(60)
    .lean();
  return events.map(toEventCard);
}

export async function searchAll(q: string) {
  await connectDB();
  const rx = { $regex: q, $options: "i" };
  const [artists, events, venues] = await Promise.all([
    Artist.find({ status: "published", name: rx }).limit(5).lean(),
    Event.find({
      status: { $in: PUBLIC_STATUSES },
      startsAt: { $gte: new Date() },
      $or: [{ title: rx }, { artistNames: rx }, { venueName: rx }],
    })
      .sort({ startsAt: 1 })
      .limit(5)
      .lean(),
    Venue.find({ status: "active", name: rx }).limit(5).lean(),
  ]);
  return {
    artists: artists.map((a) => ({ slug: a.slug, name: a.name, genres: a.genres })),
    events: events.map(toEventCard),
    venues: venues.map((v) => ({ slug: v.slug, name: v.name, city: v.address.city })),
  };
}
