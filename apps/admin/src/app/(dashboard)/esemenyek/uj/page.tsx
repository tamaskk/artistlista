import { Venue, connectDB } from "@artistlist/database";
import { createEvent } from "@/actions/events";
import { EventForm } from "@/components/EventForm";
import { PageHeader } from "@/components/PageHeader";
import { getManagedArtists, requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const user = await requireUser();
  await connectDB();
  const [artists, venues] = await Promise.all([
    getManagedArtists(user),
    Venue.find({ status: "active" }).sort({ name: 1 }).lean(),
  ]);

  return (
    <>
      <PageHeader crumb="Eseményeim / Új" title="Új esemény" />
      <EventForm
        action={createEvent}
        artists={artists.map((a) => ({ id: String(a._id), name: a.name }))}
        venues={venues.map((v) => ({
          id: String(v._id),
          name: v.name,
          city: v.address.city,
        }))}
        submitLabel="Esemény mentése"
      />
    </>
  );
}
