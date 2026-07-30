import { Artist, Event, Genre, connectDB } from "@artistlist/database";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function GenresPage() {
  await requireRole("SUPER_ADMIN");
  await connectDB();
  const genres = await Genre.find().sort({ order: 1 }).lean();
  const [artistCounts, eventCounts] = await Promise.all([
    Artist.aggregate([{ $unwind: "$genres" }, { $group: { _id: "$genres", n: { $sum: 1 } } }]),
    Event.aggregate([{ $unwind: "$genres" }, { $group: { _id: "$genres", n: { $sum: 1 } } }]),
  ]);
  const aBy = new Map(artistCounts.map((c) => [c._id, c.n]));
  const eBy = new Map(eventCounts.map((c) => [c._id, c.n]));

  return (
    <>
      <PageHeader crumb="Platform / Műfajok" title="Műfajok" />
      <Card className="max-w-2xl px-5 pb-5 pt-2">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3.5 px-2 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted">
          <span>Műfaj</span>
          <span>Előadó</span>
          <span>Esemény</span>
        </div>
        {genres.map((g) => (
          <div
            key={g.slug}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-3.5 border-t border-chip px-2 py-3"
          >
            <span className="text-[13.5px] font-medium">{g.name}</span>
            <span className="w-14 text-right text-[13px] text-ink-soft">
              {aBy.get(g.slug) ?? 0}
            </span>
            <span className="w-14 text-right text-[13px] text-ink-soft">
              {eBy.get(g.slug) ?? 0}
            </span>
          </div>
        ))}
        <p className="pt-3 text-[12.5px] text-muted">
          A műfajlista a `packages/types` konstansból seedelődik — módosítás kódból.
        </p>
      </Card>
    </>
  );
}
