import type { MetadataRoute } from "next";
import { Artist, Event, Venue, connectDB } from "@artistlist/database";

const BASE = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectDB();
  const [events, artists, venues] = await Promise.all([
    Event.find({ status: "published", startsAt: { $gte: new Date() } })
      .select("slug updatedAt")
      .lean(),
    Artist.find({ status: "published" }).select("slug updatedAt").lean(),
    Venue.find({ status: "active" }).select("slug updatedAt").lean(),
  ]);
  return [
    { url: BASE, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/esemenyek`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/eloadok`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/helyszinek`, changeFrequency: "weekly", priority: 0.6 },
    ...events.map((e) => ({
      url: `${BASE}/esemenyek/${e.slug}`,
      lastModified: e.updatedAt,
      priority: 0.8,
    })),
    ...artists.map((a) => ({
      url: `${BASE}/eloadok/${a.slug}`,
      lastModified: a.updatedAt,
      priority: 0.7,
    })),
    ...venues.map((v) => ({
      url: `${BASE}/helyszinek/${v.slug}`,
      lastModified: v.updatedAt,
      priority: 0.5,
    })),
  ];
}
