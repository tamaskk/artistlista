"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  Event,
  computeEventDenorm,
  connectDB,
  uniqueSlug,
} from "@artistlist/database";
import { eventSchema, startOfToday, type ActionResult } from "@artistlist/types";
import { canManageArtist, canManageEvent, requireUser } from "@/lib/session";

function parseEventForm(formData: FormData) {
  return eventSchema.safeParse({
    title: formData.get("title"),
    artistIds: formData.getAll("artistIds").map(String).filter(Boolean),
    guestArtistNames: String(formData.get("guestArtistNames") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    venueId: formData.get("venueId"),
    startsAt: formData.get("startsAt"),
    doorsAt: formData.get("doorsAt") || null,
    priceKind: formData.get("priceKind") ?? "unknown",
    priceMin: formData.get("priceMin") || null,
    priceMax: formData.get("priceMax") || null,
    ticketUrl: formData.get("ticketUrl") || "",
    description: formData.get("description") ?? "",
    image: formData.get("image") ?? "",
    genres: formData.getAll("genres").map(String).filter(Boolean),
    status: formData.get("status") ?? "draft",
  });
}

async function assertArtistsManageable(userId: Parameters<typeof canManageArtist>[0], artistIds: string[]) {
  for (const id of artistIds) {
    if (!(await canManageArtist(userId, id))) return false;
  }
  return true;
}

export async function createEvent(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = parseEventForm(formData);
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;
  if (data.startsAt < startOfToday()) {
    return { ok: false, fieldErrors: { startsAt: ["Múltbéli dátum nem adható meg."] } };
  }
  if (!(await assertArtistsManageable(user, data.artistIds))) {
    return { ok: false, error: "Csak az általad kezelt előadókhoz hozhatsz létre eseményt." };
  }

  await connectDB();
  const denorm = await computeEventDenorm(data);
  await Event.create({
    title: data.title,
    slug: await uniqueSlug(
      Event,
      `${data.title}-${data.startsAt.toISOString().slice(0, 10)}`,
    ),
    artistIds: data.artistIds,
    guestArtistNames: data.guestArtistNames,
    venueId: data.venueId,
    ...denorm,
    startsAt: data.startsAt,
    doorsAt: data.doorsAt ?? undefined,
    price: {
      kind: data.priceKind,
      min: data.priceMin ?? undefined,
      max: data.priceMax ?? undefined,
      currency: "HUF",
    },
    ticketUrl: data.ticketUrl || undefined,
    description: data.description,
    image: data.image,
    status: data.status,
    createdByUserId: user.id,
    organizationId: user.organizationId ?? undefined,
  });
  revalidatePath("/esemenyek");
  redirect("/esemenyek?mentve=1");
}

export async function updateEvent(
  eventId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!(await canManageEvent(user, eventId))) {
    return { ok: false, error: "Nincs jogosultságod ehhez az eseményhez." };
  }
  const parsed = parseEventForm(formData);
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  const data = parsed.data;
  if (!(await assertArtistsManageable(user, data.artistIds))) {
    return { ok: false, error: "Csak az általad kezelt előadókat választhatod ki." };
  }

  await connectDB();
  const denorm = await computeEventDenorm(data);
  await Event.updateOne(
    { _id: eventId },
    {
      $set: {
        title: data.title,
        artistIds: data.artistIds,
        guestArtistNames: data.guestArtistNames,
        venueId: data.venueId,
        ...denorm,
        startsAt: data.startsAt,
        doorsAt: data.doorsAt ?? undefined,
        price: {
          kind: data.priceKind,
          min: data.priceMin ?? undefined,
          max: data.priceMax ?? undefined,
          currency: "HUF",
        },
        ticketUrl: data.ticketUrl || undefined,
        description: data.description,
        image: data.image,
        status: data.status,
      },
    },
  );
  revalidatePath("/esemenyek");
  redirect("/esemenyek?mentve=1");
}

export async function duplicateEvent(eventId: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!(await canManageEvent(user, eventId))) {
    return { ok: false, error: "Nincs jogosultságod ehhez az eseményhez." };
  }
  await connectDB();
  const src = await Event.findById(eventId).lean();
  if (!src) return { ok: false, error: "Az esemény nem található." };
  const { _id, slug, createdAt, updatedAt, stats, ...rest } = src as any;
  const copy = await Event.create({
    ...rest,
    title: `${src.title} (másolat)`,
    slug: await uniqueSlug(Event, `${src.title}-masolat`),
    status: "draft",
    stats: { views: 0, saves: 0 },
    createdByUserId: user.id,
  });
  revalidatePath("/esemenyek");
  redirect(`/esemenyek/${copy._id}/szerkesztes`);
}

async function setStatus(
  eventId: string,
  status: "published" | "cancelled" | "soldout" | "draft",
): Promise<ActionResult> {
  const user = await requireUser();
  if (!(await canManageEvent(user, eventId))) {
    return { ok: false, error: "Nincs jogosultságod ehhez az eseményhez." };
  }
  await connectDB();
  await Event.updateOne({ _id: eventId }, { $set: { status } });
  revalidatePath("/esemenyek");
  revalidatePath("/vezerlopult");
  return { ok: true };
}

export async function publishEvent(eventId: string): Promise<ActionResult> {
  return setStatus(eventId, "published");
}
export async function cancelEvent(eventId: string): Promise<ActionResult> {
  return setStatus(eventId, "cancelled");
}
export async function markSoldOut(eventId: string): Promise<ActionResult> {
  return setStatus(eventId, "soldout");
}
export async function unpublishEvent(eventId: string): Promise<ActionResult> {
  return setStatus(eventId, "draft");
}
