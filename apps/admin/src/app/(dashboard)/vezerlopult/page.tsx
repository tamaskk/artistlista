import Link from "next/link";
import { Types } from "mongoose";
import { Event, connectDB } from "@artistlist/database";
import { formatEventDate } from "@artistlist/types";
import { PageHeader, NewButton } from "@/components/PageHeader";
import { Card, EventStatusBadge, InitialsAvatar } from "@/components/ui";
import { getManagedArtists, requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  await connectDB();
  const artists = await getManagedArtists(user);
  const artistIds = artists.map((a) => a._id);

  const now = new Date();
  const scopeFilter =
    user.role === "SUPER_ADMIN"
      ? {}
      : user.role === "MANAGER"
        ? { organizationId: user.organizationId }
        : { artistIds: { $in: artistIds } };

  const [upcomingCount, upcoming] = await Promise.all([
    Event.countDocuments({ ...scopeFilter, status: "published", startsAt: { $gte: now } }),
    Event.find({ ...scopeFilter, startsAt: { $gte: now } })
      .sort({ startsAt: 1 })
      .limit(6)
      .lean(),
  ]);

  const followers = artists.reduce((s, a) => s + (a.stats?.followers ?? 0), 0);
  const views = artists.reduce((s, a) => s + (a.stats?.views30d ?? 0), 0);
  // aggregate $match nem castol automatikusan → ObjectId-vá alakítjuk
  const aggFilter =
    user.role === "SUPER_ADMIN"
      ? {}
      : user.role === "MANAGER"
        ? { organizationId: new Types.ObjectId(user.organizationId!) }
        : { artistIds: { $in: artistIds } };
  const savesAgg = await Event.aggregate([
    { $match: aggFilter },
    { $group: { _id: null, saves: { $sum: "$stats.saves" } } },
  ]);
  const saves = savesAgg[0]?.saves ?? 0;

  const firstArtist = artists[0];
  const checklist = firstArtist
    ? [
        { label: "Profilkép", done: !!firstArtist.images?.avatar },
        { label: "Bemutatkozás", done: !!firstArtist.shortBio },
        { label: "Műfajok", done: (firstArtist.genres?.length ?? 0) > 0 },
        { label: "Spotify embed", done: !!firstArtist.embeds?.spotifyArtistId },
        { label: "Galéria", done: (firstArtist.images?.gallery?.length ?? 0) > 0 },
      ]
    : [];
  const pct = checklist.length
    ? Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100)
    : 0;

  const nf = new Intl.NumberFormat("hu-HU");
  const firstName = user.name.split(" ").pop();

  const stats = [
    { label: "Közelgő események", value: String(upcomingCount) },
    { label: "Profilmegtekintés (30 nap)", value: nf.format(views) },
    { label: "Követők", value: nf.format(followers) },
    { label: "Esemény-mentések", value: nf.format(saves) },
  ];

  return (
    <>
      <PageHeader
        crumb="Vezérlőpult"
        title={`Szia, ${firstName}! 👋`}
        action={<NewButton href="/esemenyek/uj" label="Új esemény" />}
      />

      {artists.length === 0 && user.role !== "SUPER_ADMIN" ? (
        <Card className="flex flex-col items-start gap-3 p-8">
          <h2 className="font-display text-xl font-bold">Kezdjük el!</h2>
          <p className="max-w-md text-sm text-muted">
            ① Hozd létre az előadói profilod → ② add hozzá az első fellépésed — jóváhagyás után
            minden azonnal megjelenik a weboldalon.
          </p>
          <Link
            href="/eloadok/uj"
            className="mt-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
          >
            Előadó létrehozása
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 pb-5">
            {stats.map((s) => (
              <Card key={s.label} className="flex flex-col gap-2.5">
                <span className="text-[12.5px] font-medium text-muted">{s.label}</span>
                <span className="text-[28px] font-bold leading-none tracking-tight">
                  {s.value}
                </span>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-[2fr_1fr] items-start gap-4">
            <Card>
              <div className="flex items-center justify-between pb-3.5">
                <span className="text-[15px] font-semibold">Közelgő események</span>
                <Link href="/esemenyek" className="text-[13px] font-medium text-accent">
                  Összes esemény →
                </Link>
              </div>
              {upcoming.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">
                  Még nincs esemény —{" "}
                  <Link href="/esemenyek/uj" className="font-semibold text-accent">
                    hozz létre egyet!
                  </Link>
                </p>
              ) : (
                <div className="flex flex-col">
                  {upcoming.map((e) => (
                    <Link
                      key={String(e._id)}
                      href={`/esemenyek/${e._id}/szerkesztes`}
                      className="grid grid-cols-[40px_1.4fr_1fr_auto] items-center gap-3.5 rounded-[10px] border-t border-chip px-2 py-2.5 hover:bg-row"
                    >
                      <InitialsAvatar name={e.artistNames[0] ?? e.title} />
                      <span className="truncate text-[13.5px] font-semibold">{e.title}</span>
                      <span className="whitespace-nowrap text-[13px] text-ink-soft">
                        {formatEventDate(e.startsAt)}
                      </span>
                      <EventStatusBadge status={e.status as never} />
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            <div className="flex flex-col gap-4">
              {firstArtist && (
                <Card className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-semibold">Profil teljessége</span>
                    <span className="text-[15px] font-bold text-accent">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#F0F0F8]">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    {checklist.map((c) => (
                      <div
                        key={c.label}
                        className={`flex items-center gap-2 text-[13px] ${c.done ? "" : "text-muted"}`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                            c.done ? "bg-ok/15 text-ok" : "bg-chip text-muted"
                          }`}
                        >
                          {c.done ? "✓" : "✕"}
                        </span>
                        {c.label}
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/eloadok/${firstArtist._id}/szerkesztes`}
                    className="self-start rounded-full border border-line-strong px-4 py-2 text-[13px] font-semibold transition hover:border-accent hover:text-accent"
                  >
                    Profil kiegészítése
                  </Link>
                </Card>
              )}
              <Card className="flex flex-col gap-2.5">
                <span className="pb-1 text-[15px] font-semibold">Gyors műveletek</span>
                {[
                  ["/esemenyek/uj", "Új esemény"],
                  ["/helyszinek/uj", "Új helyszín"],
                  ["/media", "Kép feltöltése"],
                ].map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-xl border border-line bg-[#F7F7FC] px-3.5 py-2.5 text-[13.5px] font-medium transition hover:border-line-strong hover:bg-chip"
                  >
                    {label}
                  </Link>
                ))}
              </Card>
            </div>
          </div>
        </>
      )}
    </>
  );
}
