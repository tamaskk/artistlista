import { z } from "zod";
import {
  ARTIST_STATUSES,
  EVENT_STATUSES,
  GENRE_SLUGS,
  SOCIAL_KEYS,
  VENUE_TYPE_VALUES,
} from "./constants";

const httpsUrl = z
  .string()
  .trim()
  .url("Érvényes URL-t adj meg")
  .refine((u) => u.startsWith("https://") || u.startsWith("http://localhost"), {
    message: "Csak https:// linket fogadunk el",
  });

const optionalHttpsUrl = z.union([httpsUrl, z.literal("")]).optional();

/** Ma 00:00 (helyi idő) — koncert nem hozható létre múltbéli dátummal. */
export const startOfToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// ── Auth ────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Érvényes email címet adj meg"),
  password: z.string().min(1, "Add meg a jelszavad"),
});

export const registerArtistSchema = z.object({
  name: z.string().trim().min(2, "Legalább 2 karakter").max(80),
  email: z.string().trim().toLowerCase().email("Érvényes email címet adj meg"),
  password: z.string().min(8, "Legalább 8 karakter"),
  artistName: z.string().trim().min(2, "Legalább 2 karakter").max(80),
  genres: z.array(z.enum(GENRE_SLUGS as unknown as [string, ...string[]])).min(1, "Válassz legalább egy műfajt").max(3, "Legfeljebb 3 műfaj"),
  image: optionalHttpsUrl, // opcionális profilkép URL
});

export const registerManagerSchema = z.object({
  name: z.string().trim().min(2, "Legalább 2 karakter").max(80),
  email: z.string().trim().toLowerCase().email("Érvényes email címet adj meg"),
  password: z.string().min(8, "Legalább 8 karakter"),
  orgName: z.string().trim().min(2, "Legalább 2 karakter").max(120),
  orgWebsite: optionalHttpsUrl,
});

/** Publikus, "külsős" fan-fiók regisztráció (web) — nem kell előadónak lenni. */
export const registerFanSchema = z.object({
  name: z.string().trim().min(2, "Legalább 2 karakter").max(80),
  email: z.string().trim().toLowerCase().email("Érvényes email címet adj meg"),
  password: z.string().min(8, "Legalább 8 karakter"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Érvényes email címet adj meg"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, "Érvénytelen token"),
  password: z.string().min(8, "Legalább 8 karakter"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Add meg a jelenlegi jelszavad"),
  newPassword: z.string().min(8, "Legalább 8 karakter"),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email("Érvényes email címet adj meg"),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(10),
  name: z.string().trim().min(2).max(80),
  password: z.string().min(8, "Legalább 8 karakter"),
});

// ── Artist ──────────────────────────────────────────────────────────

export const artistBaseSchema = z.object({
  name: z.string().trim().min(2, "Legalább 2 karakter").max(80),
  shortBio: z.string().trim().max(280, "Legfeljebb 280 karakter").optional().default(""),
  bio: z.string().trim().max(8000).optional().default(""),
  genres: z
    .array(z.enum(GENRE_SLUGS as unknown as [string, ...string[]]))
    .min(1, "Válassz legalább egy műfajt")
    .max(3, "Legfeljebb 3 műfaj"),
  homeCity: z.string().trim().max(60).optional().default(""),
});

export const artistImagesSchema = z.object({
  avatar: z.string().trim().optional().default(""),
  cover: z.string().trim().optional().default(""),
  gallery: z.array(z.string().trim()).max(12, "Legfeljebb 12 kép").default([]),
});

export const artistLinksSchema = z.object({
  links: z.record(z.enum(SOCIAL_KEYS), z.string().trim()).optional().default({}),
  spotifyArtistId: z.string().trim().max(40).optional().default(""),
  youtubeVideoId: z.string().trim().max(20).optional().default(""),
});

export const artistBookingSchema = z.object({
  bookingEmail: z.union([z.string().trim().toLowerCase().email(), z.literal("")]).optional().default(""),
  bookingPhone: z.string().trim().max(30).optional().default(""),
  bookingPublic: z.boolean().default(false),
});

export const artistStatusSchema = z.enum(ARTIST_STATUSES);

// ── Venue ───────────────────────────────────────────────────────────

export const venueSchema = z.object({
  name: z.string().trim().min(2, "Legalább 2 karakter").max(120),
  street: z.string().trim().min(2, "Add meg a címet").max(160),
  city: z.string().trim().min(2, "Add meg a várost").max(60),
  zip: z.string().trim().max(10).optional().default(""),
  country: z.string().trim().default("HU"),
  lng: z.coerce.number().min(-180).max(180),
  lat: z.coerce.number().min(-90).max(90),
  type: z.enum(VENUE_TYPE_VALUES as unknown as [string, ...string[]]),
  capacity: z.coerce.number().int().positive().optional().nullable(),
  website: optionalHttpsUrl,
});

// ── Event ───────────────────────────────────────────────────────────

export const eventSchema = z
  .object({
    title: z.string().trim().min(3, "Legalább 3 karakter").max(160),
    artistIds: z.array(z.string().min(1)).min(1, "Válassz legalább egy előadót"),
    guestArtistNames: z.array(z.string().trim().min(1).max(80)).max(10).default([]),
    venueId: z.string().min(1, "Válassz helyszínt"),
    startsAt: z.coerce.date({ message: "Érvényes dátumot adj meg" }),
    doorsAt: z.coerce.date().optional().nullable(),
    priceKind: z.enum(["free", "paid", "unknown"]).default("unknown"),
    priceMin: z.coerce.number().int().nonnegative().optional().nullable(),
    priceMax: z.coerce.number().int().nonnegative().optional().nullable(),
    ticketUrl: optionalHttpsUrl,
    description: z.string().trim().max(8000).optional().default(""),
    image: z.string().trim().optional().default(""),
    genres: z.array(z.enum(GENRE_SLUGS as unknown as [string, ...string[]])).max(5).default([]),
    status: z.enum(EVENT_STATUSES).default("draft"),
  })
  .refine((e) => e.priceKind !== "paid" || e.priceMin != null, {
    message: "Fizetős eseménynél add meg a legalacsonyabb jegyárat",
    path: ["priceMin"],
  })
  .refine(
    (e) => e.priceMin == null || e.priceMax == null || e.priceMax >= e.priceMin,
    { message: "A maximum ár nem lehet kisebb a minimumnál", path: ["priceMax"] },
  );

// ── Publikus koncert-beküldés (web, bejelentkezett user) ────────────
// Előadó: meglévőt kiválaszt VAGY újat hoz létre (utóbbi → jóváhagyásra vár).
// Helyszín: meglévőt kiválaszt VAGY új nevet+várost ad meg.
export const submitEventSchema = z
  .object({
    title: z.string().trim().min(3, "Legalább 3 karakter").max(160),
    existingArtistId: z.string().trim().optional().default(""),
    newArtistName: z.string().trim().max(80).optional().default(""),
    newArtistGenres: z
      .array(z.enum(GENRE_SLUGS as unknown as [string, ...string[]]))
      .max(3, "Legfeljebb 3 műfaj")
      .optional()
      .default([]),
    existingVenueId: z.string().trim().optional().default(""),
    newVenueName: z.string().trim().max(120).optional().default(""),
    newVenueCity: z.string().trim().max(60).optional().default(""),
    startsAt: z.coerce.date({ message: "Érvényes dátumot adj meg" }),
    priceKind: z.enum(["free", "paid", "unknown"]).default("unknown"),
    priceMin: z.coerce.number().int().nonnegative().optional().nullable(),
    ticketUrl: optionalHttpsUrl,
    image: z.string().trim().optional().default(""),
    description: z.string().trim().max(4000).optional().default(""),
  })
  .refine((e) => e.existingArtistId.length > 0 || e.newArtistName.trim().length >= 2, {
    message: "Válassz egy előadót, vagy hozz létre újat",
    path: ["newArtistName"],
  })
  .refine((e) => e.existingArtistId.length > 0 || e.newArtistGenres.length >= 1, {
    message: "Új előadóhoz válassz legalább egy műfajt",
    path: ["newArtistGenres"],
  })
  .refine(
    (e) => e.existingVenueId.length > 0 || (e.newVenueName.trim().length >= 2 && e.newVenueCity.trim().length >= 2),
    { message: "Válassz helyszínt, vagy add meg a nevét és városát", path: ["newVenueName"] },
  )
  .refine((e) => e.priceKind !== "paid" || e.priceMin != null, {
    message: "Fizetős eseménynél add meg a jegyárat",
    path: ["priceMin"],
  })
  .refine((e) => e.startsAt >= startOfToday(), {
    message: "Múltbéli dátum nem adható meg",
    path: ["startsAt"],
  });

// ── Publikus query ──────────────────────────────────────────────────

export const eventsQuerySchema = z.object({
  bbox: z
    .string()
    .regex(/^-?[\d.]+,-?[\d.]+,-?[\d.]+,-?[\d.]+$/)
    .optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  genres: z.string().optional(),
  city: z.string().optional(),
  priceMax: z.coerce.number().positive().optional(),
  free: z.coerce.boolean().optional(),
  q: z.string().max(120).optional(),
  sort: z.enum(["date", "price", "popular"]).default("date"),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(24),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterArtistInput = z.infer<typeof registerArtistSchema>;
export type RegisterManagerInput = z.infer<typeof registerManagerSchema>;
export type ArtistBaseInput = z.infer<typeof artistBaseSchema>;
export type VenueInput = z.infer<typeof venueSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type EventsQuery = z.infer<typeof eventsQuerySchema>;
export type RegisterFanInput = z.infer<typeof registerFanSchema>;
export type SubmitEventInput = z.infer<typeof submitEventSchema>;
