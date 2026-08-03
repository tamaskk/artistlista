import type { Metadata } from "next";
import Link from "next/link";
import { PageFrame } from "@/components/PageFrame";
import { EventCard } from "@/components/EventCard";
import { searchAll } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Keresés" };

export default async function SearchPage(props: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await props.searchParams;
  const results = q ? await searchAll(q) : null;

  return (
    <PageFrame>
      <div className="mt-8">
        <h1 className="font-display text-[32px] font-bold tracking-tight">Keresés</h1>
        <form className="mt-5 flex max-w-md gap-2" action="/kereses">
          <input
            name="q"
            defaultValue={q}
            autoFocus
            placeholder="Előadó, esemény vagy helyszín…"
            className="min-w-0 flex-1 rounded-full border-[1.5px] border-line-strong px-5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <button className="shrink-0 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-ink-hover">
            Keresés
          </button>
        </form>

        {results && (
          <div className="mt-10 flex flex-col gap-10">
            <section>
              <h2 className="mb-4 font-display text-xl font-bold">Előadók</h2>
              {results.artists.length === 0 ? (
                <p className="text-sm text-muted">Nincs találat.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {results.artists.map((a) => (
                    <Link
                      key={a.slug}
                      href={`/eloadok/${a.slug}`}
                      className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-chip"
                    >
                      {a.name}
                      <span className="ml-2 font-normal text-muted">{a.genres[0]}</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
            <section>
              <h2 className="mb-4 font-display text-xl font-bold">Események</h2>
              {results.events.length === 0 ? (
                <p className="text-sm text-muted">Nincs találat.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {results.events.map((e) => (
                    <EventCard key={e.id} event={e} />
                  ))}
                </div>
              )}
            </section>
            <section>
              <h2 className="mb-4 font-display text-xl font-bold">Helyszínek</h2>
              {results.venues.length === 0 ? (
                <p className="text-sm text-muted">Nincs találat.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {results.venues.map((v) => (
                    <Link
                      key={v.slug}
                      href={`/helyszinek/${v.slug}`}
                      className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold transition hover:bg-chip"
                    >
                      {v.name}
                      <span className="ml-2 font-normal text-muted">{v.city}</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </PageFrame>
  );
}
