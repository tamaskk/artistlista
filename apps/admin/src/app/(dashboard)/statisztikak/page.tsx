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
    .limit(8)
    .lean();
  const totalViews = artists.reduce((s, a) => s + (a.stats?.views30d ?? 0), 0);
  const maxViews = Math.max(1, ...events.map((e) => e.stats?.views ?? 0));
  const nf = new Intl.NumberFormat("hu-HU");

  const sources = [
    { name: "ArtistList keresés", pct: 46, dot: "#4F46E5" },
    { name: "Közvetlen link", pct: 27, dot: "#8B5CF6" },
    { name: "Instagram", pct: 18, dot: "#0B0B0F" },
    { name: "Egyéb", pct: 9, dot: "#C9C9E0" },
  ];

  return (
    <>
      <PageHeader crumb="Statisztikák" title="Statisztikák" />
      <Card className="mb-4">
        <div className="flex items-baseline gap-3.5 pb-1.5">
          <span className="text-[15px] font-semibold">Profilmegtekintések (30 nap)</span>
          <span className="text-[22px] font-bold">{nf.format(totalViews)}</span>
        </div>
        <p className="text-[12.5px] text-muted">
          Részletes idősoros bontás a v1-ben (esemény-szintű view-tracking).
        </p>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col gap-3">
          <span className="pb-1 text-[15px] font-semibold">Legnézettebb események</span>
          {events.length === 0 ? (
            <p className="text-sm text-muted">Még nincs adat.</p>
          ) : (
            events.map((e) => (
              <div key={String(e._id)} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[13px]">
                  <span className="truncate font-medium">{e.title}</span>
                  <span className="shrink-0 text-muted">{nf.format(e.stats?.views ?? 0)}</span>
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
