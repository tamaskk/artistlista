"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  Artist,
  connectDB,
  syncArtistImageToEvents,
  syncArtistNameToEvents,
  uniqueSlug,
} from "@artistlist/database";
import {
  artistBaseSchema,
  artistBookingSchema,
  artistImagesSchema,
  artistLinksSchema,
  SOCIAL_KEYS,
  type ActionResult,
} from "@artistlist/types";
import { canManageArtist, requireUser } from "@/lib/session";

export async function createArtist(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  if (user.role !== "MANAGER" && user.role !== "SUPER_ADMIN") {
    return { ok: false, error: "Nincs jogosultságod előadót létrehozni." };
  }
  const parsed = artistBaseSchema.safeParse({
    name: formData.get("name"),
    shortBio: formData.get("shortBio") ?? "",
    bio: formData.get("bio") ?? "",
    genres: formData.getAll("genres"),
    homeCity: formData.get("homeCity") ?? "",
  });
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  await connectDB();
  const artist = await Artist.create({
    ...parsed.data,
    slug: await uniqueSlug(Artist, parsed.data.name),
    ownerType: user.role === "MANAGER" ? "organization" : "user",
    organizationId: user.role === "MANAGER" ? user.organizationId : undefined,
    status: "pending",
  });
  revalidatePath("/eloadok");
  redirect(`/eloadok/${artist._id}/szerkesztes`);
}

export async function updateArtistTab(
  artistId: string,
  tab: "base" | "images" | "links" | "booking",
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!(await canManageArtist(user, artistId))) {
    return { ok: false, error: "Nincs jogosultságod ehhez az előadóhoz." };
  }
  await connectDB();
  const artist = await Artist.findById(artistId);
  if (!artist) return { ok: false, error: "Az előadó nem található." };

  if (tab === "base") {
    const parsed = artistBaseSchema.safeParse({
      name: formData.get("name"),
      shortBio: formData.get("shortBio") ?? "",
      bio: formData.get("bio") ?? "",
      genres: formData.getAll("genres"),
      homeCity: formData.get("homeCity") ?? "",
    });
    if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
    const nameChanged = artist.name !== parsed.data.name;
    artist.set(parsed.data);
    await artist.save();
    if (nameChanged) await syncArtistNameToEvents(artist._id);
  } else if (tab === "images") {
    const parsed = artistImagesSchema.safeParse({
      avatar: formData.get("avatar") ?? "",
      cover: formData.get("cover") ?? "",
      gallery: String(formData.get("gallery") ?? "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
    artist.set({ images: parsed.data });
    await artist.save();
    // avatar → esemény-kártyák (denormalizált image) frissítése
    await syncArtistImageToEvents(artist._id);
  } else if (tab === "links") {
    const links: Record<string, string> = {};
    for (const key of SOCIAL_KEYS) {
      const v = String(formData.get(`link_${key}`) ?? "").trim();
      if (v) links[key] = v;
    }
    const parsed = artistLinksSchema.safeParse({
      links,
      spotifyArtistId: formData.get("spotifyArtistId") ?? "",
      youtubeVideoId: formData.get("youtubeVideoId") ?? "",
    });
    if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
    artist.set({
      links: parsed.data.links,
      embeds: {
        spotifyArtistId: parsed.data.spotifyArtistId,
        youtubeVideoId: parsed.data.youtubeVideoId,
      },
    });
    await artist.save();
  } else if (tab === "booking") {
    const parsed = artistBookingSchema.safeParse({
      bookingEmail: formData.get("bookingEmail") ?? "",
      bookingPhone: formData.get("bookingPhone") ?? "",
      bookingPublic: formData.get("bookingPublic") === "on",
    });
    if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
    artist.set({
      booking: {
        email: parsed.data.bookingEmail,
        phone: parsed.data.bookingPhone,
        public: parsed.data.bookingPublic,
      },
    });
    await artist.save();
  }

  revalidatePath(`/eloadok/${artistId}/szerkesztes`);
  return { ok: true };
}

export async function submitArtistForReview(artistId: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!(await canManageArtist(user, artistId))) {
    return { ok: false, error: "Nincs jogosultságod ehhez az előadóhoz." };
  }
  await connectDB();
  await Artist.updateOne({ _id: artistId, status: "draft" }, { $set: { status: "pending" } });
  revalidatePath(`/eloadok/${artistId}/szerkesztes`);
  return { ok: true };
}
