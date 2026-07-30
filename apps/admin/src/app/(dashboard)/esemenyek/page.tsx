import Link from "next/link";
import { Event, connectDB } from "@artistlist/database";
import { formatEventDate } from "@artistlist/types";
import { duplicateEvent, markSoldOut, publishEvent } from "@/actions/events";
import { CancelEventButton, DeleteEventButton } from "@/components/EventActions";
import { NewButton, PageHeader } from "@/components/PageHeader";
import { Card, EventStatusBadge, InitialsAvatar } from "@/components/ui";
import { getManagedArtists, requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "all", label: "Összes" },
  { key: "published", label: "Közzétéve" },
  { key: "draft", label: "Piszkozat" },
  { key: "cancelled", label: "Elmarad" },
] as const;

export default async function EventsPage(props: {
  searchParams: Promise<{ statusz?: string }>;
}) {
  const user = await requireUser();
  const { statusz = "all" } = await props.searchParams;
  await connectDB();
  const artists = await getManagedArtists(user);

  const scopeFilter =
    user.role === "SUPER_ADMIN"
      ? {}
      : user.role === "MANAGER"
        ? { organizationId: user.organizationId }
        : { artistIds: { $in: artists.map((a) => a._id) } };

  const filter = {
    ...scopeFilter,
    ...(statusz !== "all" ? { status: statusz } : {}),
  };
  const events = await Event.find(filter).sort({ startsAt: 1 }).limit(100).lean();

  return (
    <>
      <PageHeader
        crumb="Eseményeim"
        title="Eseményeim"
        action={<NewButton href="/esemenyek/uj" label="Új esemény" />}
      />
      <div className="flex items-center gap-2 pb-4">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/esemenyek" : `/esemenyek?statusz=${t.key}`}
            className={`rounded-full border px-4 py-[7px] text-[13px] font-semibold transition ${
              statusz === t.key
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-ink-soft hover:border-line-strong"
            }`}
          >
            {t.label}
          </Link>
        ))}
        <span className="ml-auto text-[13px] text-muted">{events.length} esemény</span>
      </div>

      <Card className="px-5 pb-5 pt-2">
        <div className="grid grid-cols-[40px_1.5fr_1fr_0.9fr_auto_auto] items-center gap-3.5 px-2 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted">
          <span />
          <span>Esemény</span>
          <span>Helyszín</span>
          <span>Időpont</span>
          <span>Állapot</span>
          <span>Műveletek</span>
        </div>
        {events.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Nincs esemény ebben a nézetben.</p>
        ) : (
          events.map((e) => {
            const id = String(e._id);
            return (
              <div
                key={id}
                className="grid grid-cols-[40px_1.5fr_1fr_0.9fr_auto_auto] items-center gap-3.5 rounded-[10px] border-t border-chip px-2 py-2.5 hover:bg-row"
              >
                <InitialsAvatar name={e.artistNames[0] ?? e.title} />
                <Link
                  href={`/esemenyek/${id}/szerkesztes`}
                  className="truncate text-[13.5px] font-semibold hover:text-accent"
                >
                  {e.title}
                </Link>
                <span className="truncate text-[13px] text-muted">
                  {e.venueName} · {e.city}
                </span>
                <span className="whitespace-nowrap text-[13px] text-ink-soft">
                  {formatEventDate(e.startsAt)}
                </span>
                <EventStatusBadge status={e.status as never} />
                <div className="flex items-center gap-1.5">
                  <form action={async () => {
                    "use server";
                    await duplicateEvent(id);
                  }}>
                    <RowButton title="Duplikálás">⧉</RowButton>
                  </form>
                  {e.status === "draft" && (
                    <form action={async () => {
                      "use server";
                      await publishEvent(id);
                    }}>
                      <RowButton title="Közzététel">▲</RowButton>
                    </form>
                  )}
                  {e.status === "published" && (
                    <>
                      <form action={async () => {
                        "use server";
                        await markSoldOut(id);
                      }}>
                        <RowButton title="Telt ház">◉</RowButton>
                      </form>
                      <CancelEventButton id={id} />
                    </>
                  )}
                  <DeleteEventButton id={id} />
                </div>
              </div>
            );
          })
        )}
      </Card>
    </>
  );
}

function RowButton({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <button
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded-full text-[13px] text-muted transition hover:bg-chip hover:text-ink"
    >
      {children}
    </button>
  );
}
