/** Referencia-műfajlista — a `genres` kollekció seedje is ebből épül. */
export const GENRES = [
  { name: "Pop", slug: "pop", order: 1 },
  { name: "Rock", slug: "rock", order: 2 },
  { name: "Hip-hop / Rap", slug: "hip-hop", order: 3 },
  { name: "Elektronikus", slug: "elektronikus", order: 4 },
  { name: "Techno / House", slug: "techno-house", order: 5 },
  { name: "DJ / Lemezlovas", slug: "dj", order: 6 },
  { name: "Indie / Alternatív", slug: "indie", order: 7 },
  { name: "Metal", slug: "metal", order: 8 },
  { name: "Jazz", slug: "jazz", order: 9 },
  { name: "Folk / Világzene", slug: "folk", order: 10 },
  { name: "Mulatós", slug: "mulatos", order: 11 },
] as const;

export const GENRE_SLUGS = GENRES.map((g) => g.slug);

export const VENUE_TYPES = [
  { value: "club", label: "Klub" },
  { value: "arena", label: "Aréna" },
  { value: "outdoor", label: "Szabadtéri" },
  { value: "festival", label: "Fesztivál" },
  { value: "bar", label: "Bár" },
  { value: "culture_house", label: "Művelődési ház" },
  { value: "other", label: "Egyéb" },
] as const;

export type VenueType = (typeof VENUE_TYPES)[number]["value"];

export const VENUE_TYPE_VALUES = VENUE_TYPES.map((v) => v.value);

export const CITIES = [
  "Budapest",
  "Debrecen",
  "Szeged",
  "Pécs",
  "Győr",
  "Miskolc",
  "Veszprém",
  "Sopron",
] as const;

export const EVENT_STATUSES = ["draft", "pending", "published", "cancelled", "soldout"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const ARTIST_STATUSES = ["draft", "pending", "published", "archived"] as const;
export type ArtistStatus = (typeof ARTIST_STATUSES)[number];

export const USER_ROLES = ["SUPER_ADMIN", "MANAGER", "ARTIST", "FAN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const SOCIAL_KEYS = [
  "website",
  "instagram",
  "facebook",
  "tiktok",
  "youtube",
  "spotify",
  "soundcloud",
] as const;
export type SocialKey = (typeof SOCIAL_KEYS)[number];

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Piszkozat",
  pending: "Jóváhagyásra vár",
  published: "Közzétéve",
  cancelled: "Elmarad",
  soldout: "Telt ház",
};

export const ARTIST_STATUS_LABELS: Record<ArtistStatus, string> = {
  draft: "Piszkozat",
  pending: "Moderáció alatt",
  published: "Jóváhagyva",
  archived: "Archivált",
};
