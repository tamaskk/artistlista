import { Artist, Event, connectDB } from "@artistlist/database";
import { formatEventDate } from "@artistlist/types";
import { toggleArtistFeatured, toggleEventFeatured } from "@/actions/admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function FeaturedPage() {
  await requireRole("SUPER_ADMIN");
  await connectDB();
  const [artists, events] = await Promise.all([
    Artist.find({ status: "published" }).sort({ featured: -1, name: 1 }).limit(50).lean(),
    Event.find({ status: "published", startsAt: { $gte: new Date() } })
      .sort({ featured: -1, startsAt: 1 })
      .limit(50)
      .lean(),
  ]);

  return (
    <>
      <PageHeader crumb="Platform / Kiemelések" title="Kiemelések kurálása" />
      <div className="grid grid-cols-2 items-start gap-4">
        <Card className="flex flex-col gap-1 px-5 py-4">
          <span className="pb-2 text-[15px] font-semibold">Előadók</span>
          {artists.map((a) => (
            <div
              key={String(a._id)}
              className="flex items-center gap-3 border-t border-chip py-2.5"
            >
              <span className="flex-1 truncate text-[13.5px] font-medium">{a.name}</span>
              <form action={async () => {
                "use server";
                await toggleArtistFeatured(String(a._id));
              }}>
                <button
                  className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
                    a.featured
                      ? "bg-accent text-white"
                      : "border border-line-strong hover:border-accent hover:text-accent"
                  }`}
                >
                  {a.featured ? "★ Kiemelt" : "Kiemelés"}
                </button>
              </form>
            </div>
          ))}
        </Card>
        <Card className="flex flex-col gap-1 px-5 py-4">
          <span className="pb-2 text-[15px] font-semibold">Események</span>
          {events.map((e) => (
            <div
              key={String(e._id)}
              className="flex items-center gap-3 border-t border-chip py-2.5"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-medium">{e.title}</div>
                <div className="text-[11.5px] text-muted">{formatEventDate(e.startsAt)}</div>
              </div>
              <form action={async () => {
                "use server";
                await toggleEventFeatured(String(e._id));
              }}>
                <button
                  className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition ${
                    e.featured
                      ? "bg-accent text-white"
                      : "border border-line-strong hover:border-accent hover:text-accent"
                  }`}
                >
                  {e.featured ? "★ Kiemelt" : "Kiemelés"}
                </button>
              </form>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
