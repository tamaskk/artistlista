/**
 * Dev seed: törli és újratölti a fő kollekciókat demó adatokkal.
 * Futtatás: pnpm --filter @artistlist/database seed
 */
import bcrypt from "bcryptjs";
import { GENRES, slugify } from "@artistlist/types";
import { connectDB } from "./connect";
import { Artist } from "./models/artist";
import { Event } from "./models/event";
import { Genre } from "./models/genre";
import { Organization } from "./models/organization";
import { User } from "./models/user";
import { Venue } from "./models/venue";

/** Budapesti idő (nyáron UTC+2) szerinti dátum N nappal mostantól. */
function at(daysFromNow: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  d.setUTCHours(hour - 2, minute, 0, 0);
  return d;
}

async function main() {
  await connectDB();
  console.log("Kapcsolódva. Kollekciók ürítése…");
  await Promise.all([
    User.deleteMany({}),
    Organization.deleteMany({}),
    Artist.deleteMany({}),
    Venue.deleteMany({}),
    Event.deleteMany({}),
    Genre.deleteMany({}),
  ]);

  // ── műfajok ──
  await Genre.insertMany(GENRES.map((g) => ({ ...g })));

  // ── szervezet + userek ──
  const org = await Organization.create({
    name: "Northline Booking",
    slug: "northline-booking",
    contactEmail: "hello@northline.hu",
    website: "https://northline.hu",
  });

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);
  const superAdmin = await User.create({
    email: "admin@artistlist.hu",
    passwordHash: hash("admin1234"),
    name: "Platform Admin",
    role: "SUPER_ADMIN",
    emailVerifiedAt: new Date(),
  });
  const anna = await User.create({
    email: "anna@northline.hu",
    passwordHash: hash("titok1234"),
    name: "Kiss Anna",
    role: "MANAGER",
    organizationId: org._id,
    emailVerifiedAt: new Date(),
  });
  await User.create({
    email: "bence@northline.hu",
    passwordHash: hash("titok1234"),
    name: "Tóth Bence",
    role: "MANAGER",
    organizationId: org._id,
    emailVerifiedAt: new Date(),
  });

  // ── előadók ──
  type ArtistSeed = {
    name: string;
    genres: string[];
    homeCity: string;
    shortBio: string;
    org?: boolean;
    featured?: boolean;
    status?: string;
    followers?: number;
    views?: number;
  };
  const artistSeeds: ArtistSeed[] = [
    { name: "Holdfény Projekt", genres: ["indie", "elektronikus"], homeCity: "Budapest", shortBio: "Álomszerű indie-elektronika a budapesti éjszakából.", org: true, featured: true, followers: 3214, views: 12480 },
    { name: "Neonhajnal", genres: ["elektronikus", "techno-house"], homeCity: "Budapest", shortBio: "Synthwave és elektro duó, neonfényes élő szettekkel.", org: true, featured: true, status: "pending", followers: 1087, views: 4100 },
    { name: "Vera & a Fiúk", genres: ["pop", "rock"], homeCity: "Budapest", shortBio: "Energikus pop-rock banda, teltházas klubkoncertekkel.", org: true, featured: true, followers: 8930, views: 21700 },
    { name: "Délibáb Duó", genres: ["folk"], homeCity: "Pécs", shortBio: "Akusztikus folk két hangra és sokféle húrra.", org: true, status: "pending", followers: 412, views: 900 },
    { name: "Szélcsend Zenekar", genres: ["indie"], homeCity: "Budapest", shortBio: "Indie balladák és szabadtéri esték zenekara.", featured: true, followers: 2100, views: 6800 },
    { name: "DJ Kova", genres: ["techno-house"], homeCity: "Budapest", shortBio: "House és techno szettek a város tetőteraszain.", featured: true, followers: 1750, views: 5400 },
    { name: "Basszuskulcs", genres: ["jazz"], homeCity: "Szeged", shortBio: "Modern jazz trió, improvizatív hajókoncertekkel.", featured: true, followers: 980, views: 3100 },
    { name: "Betonfal", genres: ["metal"], homeCity: "Miskolc", shortBio: "Súlyos riffek, kompromisszumok nélkül.", followers: 1420, views: 2600 },
    { name: "Rakéta Rt.", genres: ["hip-hop"], homeCity: "Debrecen", shortBio: "Hazai hip-hop kollektíva, pörgős élő show-val.", followers: 3900, views: 8800 },
    { name: "Lila Köd", genres: ["pop", "elektronikus"], homeCity: "Győr", shortBio: "Elektropop dalok ködös hajnalokra.", followers: 640, views: 1500 },
  ];
  const artists = new Map<string, any>();
  for (const a of artistSeeds) {
    const doc = await Artist.create({
      name: a.name,
      slug: slugify(a.name),
      shortBio: a.shortBio,
      bio: `${a.shortBio}\n\n${a.name} a hazai élőzenei színtér aktív szereplője — kövesd az ArtistListen, hogy egyetlen fellépésükről se maradj le.`,
      genres: a.genres,
      homeCity: a.homeCity,
      ownerType: a.org ? "organization" : "user",
      organizationId: a.org ? org._id : undefined,
      status: a.status ?? "published",
      featured: a.featured ?? false,
      stats: { followers: a.followers ?? 0, views30d: a.views ?? 0 },
      booking: { email: `booking@${slugify(a.name)}.hu`, public: true },
      links: { instagram: `https://instagram.com/${slugify(a.name)}` },
    });
    artists.set(a.name, doc);
  }

  // Szélcsend saját ARTIST fiókkal
  const szelcsendUser = await User.create({
    email: "szelcsend@example.hu",
    passwordHash: hash("titok1234"),
    name: "Szélcsend Zenekar",
    role: "ARTIST",
    artistId: artists.get("Szélcsend Zenekar")._id,
    emailVerifiedAt: new Date(),
  });
  await Artist.updateOne(
    { _id: artists.get("Szélcsend Zenekar")._id },
    { $set: { ownerUserId: szelcsendUser._id } },
  );

  // ── helyszínek (valós koordináták) ──
  type VenueSeed = {
    name: string;
    street: string;
    city: string;
    lng: number;
    lat: number;
    type: string;
    capacity?: number;
  };
  const venueSeeds: VenueSeed[] = [
    { name: "Akvárium Klub", street: "Erzsébet tér 12.", city: "Budapest", lng: 19.0546, lat: 47.4977, type: "club", capacity: 700 },
    { name: "A38 Hajó", street: "Petőfi híd, budai hídfő", city: "Budapest", lng: 19.057, lat: 47.4693, type: "club", capacity: 500 },
    { name: "Budapest Park", street: "Soroksári út 60.", city: "Budapest", lng: 19.0774, lat: 47.4636, type: "outdoor", capacity: 11000 },
    { name: "Dürer Kert", street: "Öv u. 3.", city: "Budapest", lng: 19.1408, lat: 47.5205, type: "club", capacity: 900 },
    { name: "Turbina", street: "Népszínház u. 51.", city: "Budapest", lng: 19.0794, lat: 47.4979, type: "club", capacity: 380 },
    { name: "Corvin Tető", street: "Blaha Lujza tér 1.", city: "Budapest", lng: 19.0705, lat: 47.4967, type: "bar", capacity: 450 },
    { name: "Ellátó Kert", street: "Kazinczy u. 48.", city: "Budapest", lng: 19.0637, lat: 47.501, type: "bar", capacity: 300 },
    { name: "Kobuci Kert", street: "Fő tér 1.", city: "Budapest", lng: 19.0409, lat: 47.5415, type: "outdoor", capacity: 500 },
    { name: "Szabadkikötő", street: "Felső Tisza-part 4.", city: "Szeged", lng: 20.1414, lat: 46.253, type: "outdoor", capacity: 600 },
    { name: "Nagyerdei Víztorony", street: "Pallagi út 7.", city: "Debrecen", lng: 21.622, lat: 47.5559, type: "outdoor", capacity: 800 },
    { name: "Zsolnay Negyed", street: "Zsolnay Vilmos u. 37.", city: "Pécs", lng: 18.247, lat: 46.0755, type: "culture_house", capacity: 1200 },
    { name: "Rómer Ház", street: "Teleki László u. 21.", city: "Győr", lng: 17.635, lat: 47.6874, type: "club", capacity: 250 },
  ];
  const venues = new Map<string, any>();
  for (const v of venueSeeds) {
    const doc = await Venue.create({
      name: v.name,
      slug: slugify(v.name),
      address: { street: v.street, city: v.city, country: "HU" },
      location: { type: "Point", coordinates: [v.lng, v.lat] },
      type: v.type,
      capacity: v.capacity,
      createdByUserId: superAdmin._id,
    });
    venues.set(v.name, doc);
  }

  // ── események ──
  type EventSeed = {
    artists: string[];
    venue: string;
    day: number;
    hour: number;
    price: number | "free" | null;
    priceMax?: number;
    status?: "draft" | "published" | "cancelled" | "soldout";
    featured?: boolean;
    saves?: number;
    views?: number;
    guests?: string[];
  };
  const eventSeeds: EventSeed[] = [
    { artists: ["Holdfény Projekt"], venue: "Akvárium Klub", day: 3, hour: 22, price: 5900, priceMax: 7900, featured: true, saves: 210, views: 3841 },
    { artists: ["Szélcsend Zenekar"], venue: "Kobuci Kert", day: 4, hour: 19, price: "free", featured: true, saves: 130, views: 2100 },
    { artists: ["DJ Kova"], venue: "Corvin Tető", day: 8, hour: 23, price: 4500, saves: 95, views: 1800 },
    { artists: ["Vera & a Fiúk"], venue: "Budapest Park", day: 10, hour: 20, price: 8900, priceMax: 14900, status: "soldout", featured: true, saves: 480, views: 6200 },
    { artists: ["Basszuskulcs"], venue: "A38 Hajó", day: 13, hour: 21, price: 3500, saves: 60, views: 990 },
    { artists: ["Neonhajnal"], venue: "Turbina", day: 16, hour: 22, price: 6500, saves: 72, views: 1400 },
    { artists: ["Rakéta Rt."], venue: "Nagyerdei Víztorony", day: 17, hour: 20, price: 4900, saves: 150, views: 2500 },
    { artists: ["Betonfal"], venue: "Dürer Kert", day: 19, hour: 21, price: 3900, saves: 44, views: 700 },
    { artists: ["Délibáb Duó"], venue: "Zsolnay Negyed", day: 21, hour: 19, price: "free", saves: 25, views: 400 },
    { artists: ["Holdfény Projekt"], venue: "Szabadkikötő", day: 23, hour: 21, price: 4900, saves: 88, views: 1632 },
    { artists: ["Lila Köd"], venue: "Rómer Ház", day: 24, hour: 20, price: 2900, saves: 18, views: 350 },
    { artists: ["DJ Kova", "Neonhajnal"], venue: "Akvárium Klub", day: 27, hour: 23, price: 5500, saves: 120, views: 2050 },
    { artists: ["Vera & a Fiúk"], venue: "Kobuci Kert", day: 29, hour: 20, status: "cancelled", price: 6900, saves: 90, views: 1500 },
    { artists: ["Szélcsend Zenekar"], venue: "A38 Hajó", day: 31, hour: 21, price: 3900, saves: 66, views: 1100 },
    { artists: ["Basszuskulcs"], venue: "Szabadkikötő", day: 34, hour: 20, price: "free", saves: 40, views: 620 },
    { artists: ["Rakéta Rt."], venue: "Budapest Park", day: 36, hour: 19, price: 7900, priceMax: 12900, saves: 210, views: 3300 },
    { artists: ["Holdfény Projekt"], venue: "Ellátó Kert", day: 38, hour: 22, price: 2500, saves: 55, views: 988 },
    { artists: ["Neonhajnal"], venue: "Dürer Kert", day: 41, hour: 21, status: "draft", price: 5900, saves: 0, views: 0 },
    { artists: ["Betonfal", "Rakéta Rt."], venue: "Turbina", day: 43, hour: 20, price: 4500, saves: 38, views: 640, guests: ["Vasököl"] },
    { artists: ["Lila Köd"], venue: "Akvárium Klub", day: 45, hour: 21, price: 3500, saves: 29, views: 510 },
    { artists: ["Délibáb Duó"], venue: "Kobuci Kert", day: 47, hour: 19, price: "free", saves: 33, views: 480 },
    { artists: ["DJ Kova"], venue: "Corvin Tető", day: 50, hour: 23, price: 4500, saves: 41, views: 700 },
    { artists: ["Vera & a Fiúk"], venue: "Nagyerdei Víztorony", day: 52, hour: 20, price: 7500, saves: 160, views: 2400 },
    { artists: ["Szélcsend Zenekar"], venue: "Zsolnay Negyed", day: 55, hour: 19, price: 2900, saves: 21, views: 380 },
    { artists: ["Holdfény Projekt"], venue: "Dürer Kert", day: 57, hour: 21, status: "draft", price: 5900, saves: 0, views: 0 },
    { artists: ["Basszuskulcs"], venue: "Ellátó Kert", day: 59, hour: 20, price: 3200, saves: 26, views: 430 },
    // múltbeli — előadóoldal "korábbi fellépések" szekciójához
    { artists: ["Holdfény Projekt"], venue: "Turbina", day: -12, hour: 22, price: 4900, saves: 140, views: 2900 },
    { artists: ["Vera & a Fiúk"], venue: "Akvárium Klub", day: -6, hour: 21, price: 6900, saves: 220, views: 4100 },
  ];

  for (const e of eventSeeds) {
    const artistDocs = e.artists.map((n) => artists.get(n));
    const venue = venues.get(e.venue);
    const title = `${e.artists[0]} · ${e.venue}`;
    const startsAt = at(e.day, e.hour);
    const doors = at(e.day, e.hour - 1);
    const genres = [...new Set(artistDocs.flatMap((a: any) => a.genres))].slice(0, 5);
    const price =
      e.price === "free"
        ? { kind: "free" as const, currency: "HUF" }
        : e.price == null
          ? { kind: "unknown" as const, currency: "HUF" }
          : { kind: "paid" as const, min: e.price, max: e.priceMax, currency: "HUF" };
    const slugBase = slugify(`${title}-${startsAt.toISOString().slice(0, 10)}`);
    await Event.create({
      title,
      slug: slugBase,
      artistIds: artistDocs.map((a: any) => a._id),
      guestArtistNames: e.guests ?? [],
      venueId: venue._id,
      location: venue.location,
      city: venue.address.city,
      venueName: venue.name,
      genres,
      artistNames: e.artists,
      startsAt,
      doorsAt: doors,
      price,
      ticketUrl: e.price === "free" ? undefined : "https://tixa.hu",
      description: `${e.artists.join(" és ")} a ${e.venue} színpadán. Gyere el, hozd a barátaidat!`,
      status: e.status ?? "published",
      createdByUserId: anna._id,
      organizationId: org._id,
      stats: { views: e.views ?? 0, saves: e.saves ?? 0 },
      featured: e.featured ?? false,
    });
  }

  const counts = {
    users: await User.countDocuments(),
    artists: await Artist.countDocuments(),
    venues: await Venue.countDocuments(),
    events: await Event.countDocuments(),
    genres: await Genre.countDocuments(),
  };
  console.log("Seed kész:", counts);
  console.log("Belépések:");
  console.log("  SUPER_ADMIN  admin@artistlist.hu / admin1234");
  console.log("  MANAGER      anna@northline.hu / titok1234");
  console.log("  ARTIST       szelcsend@example.hu / titok1234");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
