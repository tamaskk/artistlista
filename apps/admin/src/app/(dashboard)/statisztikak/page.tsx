import { Event, connectDB } from "@artistlist/database";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui";
import { getManagedArtists, requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const user = await requireUser();
  await connectDB();
  const artists = await getManagedArtists(user);
  const scopeFilter =
    user.role === "SUPER_ADMIN"
      ? {}
      : user.role === "MANAGER"
        ? { organizationId: user.organizationId }
        : { artistIds: { $in: artists.map((a) => a._id) } };

  const events = await Event.find(scopeFilter)
    .sort({ "stats.views": -1 })
    .limit(10)
    .lean();
  const maxViews = Math.max(1, ...events.map((e) => e.stats?.views ?? 0));
  const nf = new Intl.NumberFormat("hu-HU");

  // valós összesítők a scope összes eseményéből
  const [agg] = await Event.aggregate([
    { $match: scopeFilter },
    {
      $group: {
        _id: null,
        views: { $sum: "$stats.views" },
        saves: { $sum: "$stats.saves" },
        clicks: { $sum: "$stats.ticketClicks" },
      },
    },
  ]);
  const totals = { views: agg?.views ?? 0, saves: agg?.saves ?? 0, clicks: agg?.clicks ?? 0 };
  const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

  const sources = [
    { name: "ArtistList keresés", pct: 46, dot: "#4F46E5" },
    { name: "Közvetlen link", pct: 27, dot: "#8B5CF6" },
    { name: "Instagram", pct: 18, dot: "#0B0B0F" },
    { name: "Egyéb", pct: 9, dot: "#C9C9E0" },
  ];

  return (
    <>
      <PageHeader crumb="Statisztikák" title="Statisztikák" />
      <div className="mb-4 grid grid-cols-3 gap-4">
        {[
          { label: "Megtekintés", value: totals.views, hint: "esemény-oldal" },
          { label: "Kedvencelés", value: totals.saves, hint: "mentett esemény" },
          { label: "Jegylink-katt.", value: totals.clicks, hint: `CTR ${pct(totals.clicks, totals.views)}%` },
        ].map((m) => (
          <Card key={m.label}>
            <div className="text-[12.5px] text-muted">{m.label}</div>
            <div className="text-[26px] font-bold">{nf.format(m.value)}</div>
            <div className="text-[11.5px] text-faint">{m.hint}</div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col gap-3">
          <span className="pb-1 text-[15px] font-semibold">Legnézettebb események</span>
          {events.length === 0 ? (
            <p className="text-sm text-muted">Még nincs adat.</p>
          ) : (
            events.map((e) => (
              <div key={String(e._id)} className="flex flex-col gap-1.5">
                <div className="flex justify-between gap-2 text-[13px]">
                  <span className="truncate font-medium">{e.title}</span>
                  <span className="shrink-0 text-muted">
                    {nf.format(e.stats?.views ?? 0)} megt. · {nf.format(e.stats?.saves ?? 0)} ♥ ·{" "}
                    {nf.format(e.stats?.ticketClicks ?? 0)} jegy
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#F0F0F8]">
                  <div
                    className="h-full rounded-full bg-accent/75"
                    style={{ width: `${Math.round(((e.stats?.views ?? 0) / maxViews) * 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </Card>
        <Card className="flex flex-col gap-1">
          <span className="pb-2 text-[15px] font-semibold">Források</span>
          {sources.map((s) => (
            <div
              key={s.name}
              className="flex items-center gap-3 border-t border-chip py-2.5 first:border-t-0"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: s.dot }} />
              <span className="text-[13px] font-medium">{s.name}</span>
              <span className="ml-auto text-[13px] font-semibold text-ink-soft">{s.pct}%</span>
            </div>
          ))}
          <p className="pt-2 text-[11.5px] text-muted">Demó adatok — forrás-tracking a v1-ben.</p>
        </Card>
      </div>
    </>
  );
}
