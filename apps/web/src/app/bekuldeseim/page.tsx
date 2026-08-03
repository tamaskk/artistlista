import Link from "next/link";
import { Event, connectDB } from "@artistlist/database";
import { formatEventDate } from "@artistlist/types";
import { PageFrame } from "@/components/PageFrame";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Beküldéseim" };

const STATUS: Record<string, { text: string; cls: string }> = {
  pending: { text: "Jóváhagyásra vár", cls: "bg-accent/10 text-accent" },
  published: { text: "Élesítve ✓", cls: "bg-ok/10 text-ok" },
  cancelled: { text: "Elmarad", cls: "bg-bad/10 text-bad" },
  soldout: { text: "Telt ház", cls: "bg-warn/10 text-warn" },
  draft: { text: "Elutasítva", cls: "bg-chip text-muted" },
};

export default async function MySubmissionsPage() {
  const user = await requireUser("/bekuldeseim");
  await connectDB();
  const events = await Event.find({ submittedByUserId: user.id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return (
    <PageFrame>
      <div className="mx-auto max-w-[720px] py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-[28px] font-bold tracking-tight">Beküldéseim</h1>
          <Link
            href="/koncert-bekuldese"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-hover"
          >
            + Új beküldés
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="mt-8 rounded-card border border-dashed border-line-strong px-6 py-12 text-center text-sm text-muted">
            Még nincs beküldésed.{" "}
            <Link href="/koncert-bekuldese" className="font-semibold text-accent hover:text-accent-deep">
              Küldj be egy koncertet →
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-2.5">
            {events.map((e) => {
              const st = STATUS[e.status] ?? STATUS.draft;
              const row = (
                <div className="flex items-center justify-between gap-3 rounded-card border border-line bg-surface px-4 py-3.5 transition hover:border-line-strong">
                  <div className="min-w-0">
                    <div className="truncate text-[14.5px] font-semibold">
                      {e.artistNames?.[0] ?? e.title}
                    </div>
                    <div className="truncate text-[12.5px] text-muted">
                      {e.venueName} · {e.city} · {formatEventDate(e.startsAt)}
                    </div>
                  </div>
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-bold ${st.cls}`}
                  >
                    {st.text}
                  </span>
                </div>
              );
              return e.status === "published" ? (
                <Link key={String(e._id)} href={`/esemenyek/${e.slug}`}>
                  {row}
                </Link>
              ) : (
                <div key={String(e._id)}>{row}</div>
              );
            })}
          </div>
        )}
      </div>
    </PageFrame>
  );
}
