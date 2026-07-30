import { Event, Venue, connectDB } from "@artistlist/database";
import { VENUE_TYPES } from "@artistlist/types";
import { NewButton, PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function VenuesPage() {
  await requireUser();
  await connectDB();
  const venues = await Venue.find({ status: "active" }).sort({ name: 1 }).limit(200).lean();
  const counts = await Event.aggregate([
    { $group: { _id: "$venueId", n: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.n]));
  const typeLabel = new Map(VENUE_TYPES.map((t) => [t.value, t.label]));

  return (
    <>
      <PageHeader
        crumb="Helyszínek"
        title="Helyszínek"
        action={<NewButton href="/helyszinek/uj" label="Új helyszín" />}
      />
      <Card className="px-5 pb-5 pt-2">
        <div className="grid grid-cols-[1.2fr_0.7fr_1.2fr_0.6fr_0.5fr_0.5fr] items-center gap-3.5 px-2 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted">
          <span>Helyszín</span>
          <span>Város</span>
          <span>Cím</span>
          <span>Típus</span>
          <span>Kapacitás</span>
          <span>Esemény</span>
        </div>
        {venues.map((v) => (
          <div
            key={String(v._id)}
            className="grid grid-cols-[1.2fr_0.7fr_1.2fr_0.6fr_0.5fr_0.5fr] items-center gap-3.5 rounded-[10px] border-t border-chip px-2 py-3 hover:bg-row"
          >
            <span className="truncate text-[13.5px] font-semibold">{v.name}</span>
            <span className="text-[13px] text-ink-soft">{v.address.city}</span>
            <span className="truncate text-[13px] text-muted">{v.address.street}</span>
            <span className="text-[13px] text-ink-soft">
              {typeLabel.get(v.type as never) ?? v.type}
            </span>
            <span className="text-[13px] text-ink-soft">
              {v.capacity ? new Intl.NumberFormat("hu-HU").format(v.capacity) : "—"}
            </span>
            <span className="text-[13px] text-ink-soft">{byId.get(String(v._id)) ?? 0}</span>
          </div>
        ))}
      </Card>
    </>
  );
}
