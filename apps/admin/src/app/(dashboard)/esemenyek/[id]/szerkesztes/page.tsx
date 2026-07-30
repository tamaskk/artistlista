import { notFound, redirect } from "next/navigation";
import { Event, Venue, connectDB } from "@artistlist/database";
import { updateEvent } from "@/actions/events";
import { EventForm } from "@/components/EventForm";
import { PageHeader } from "@/components/PageHeader";
import { PromotionPanel } from "@/components/PromotionPanel";
import { canManageEvent, getManagedArtists, requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** UTC Date → datetime-local input érték (budapesti idő). */
function toLocalInput(d?: Date | null): string | undefined {
  if (!d) return undefined;
  const parts = new Intl.DateTimeFormat("hu-HU", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(d));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export default async function EditEventPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await requireUser();
  if (!(await canManageEvent(user, id))) redirect("/esemenyek");

  await connectDB();
  const [event, artists, venues] = await Promise.all([
    Event.findById(id).lean(),
    getManagedArtists(user),
    Venue.find({ status: "active" }).sort({ name: 1 }).lean(),
  ]);
  if (!event) notFound();

  return (
    <>
      <PageHeader crumb={`Eseményeim / ${event.title}`} title="Esemény szerkesztése" />
      <EventForm
        action={updateEvent.bind(null, id)}
        artists={artists.map((a) => ({ id: String(a._id), name: a.name }))}
        venues={venues.map((v) => ({
          id: String(v._id),
          name: v.name,
          city: v.address.city,
        }))}
        initial={{
          title: event.title,
          artistIds: event.artistIds.map(String),
          guestArtistNames: (event.guestArtistNames ?? []).join(", "),
          venueId: String(event.venueId),
          startsAt: toLocalInput(event.startsAt),
          doorsAt: toLocalInput(event.doorsAt),
          priceKind: (event.price?.kind as never) ?? "unknown",
          priceMin: event.price?.min ?? null,
          priceMax: event.price?.max ?? null,
          ticketUrl: event.ticketUrl ?? "",
          description: event.description ?? "",
          image: event.image ?? "",
          genres: event.genres ?? [],
          status: event.status,
        }}
        submitLabel="Változások mentése"
      />
      <PromotionPanel
        eventId={id}
        current={{
          tier: event.promotion?.tier ?? 0,
          activeUntil: event.promotion?.activeUntil
            ? new Date(event.promotion.activeUntil).toISOString()
            : null,
        }}
      />
    </>
  );
}
