import type { Metadata } from "next";
import Link from "next/link";
import { VENUE_TYPES } from "@artistlist/types";
import { PageFrame } from "@/components/PageFrame";
import { getVenueList } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Helyszínek",
  description: "Klubok, arénák, szabadtéri helyszínek — hol lesz a következő koncert?",
};

export default async function VenuesPage() {
  const venues = await getVenueList();
  const typeLabel = new Map(VENUE_TYPES.map((t) => [t.value, t.label]));
  return (
    <PageFrame active="/helyszinek">
      <div className="mt-8">
        <h1 className="font-display text-[32px] font-bold tracking-tight">Helyszínek</h1>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((v) => (
            <Link
              key={v.id}
              href={`/helyszinek/${v.slug}`}
              className="rounded-card border border-line bg-surface p-5 shadow-card transition hover:-translate-y-[3px] hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[15px] font-semibold">{v.name}</div>
                  <div className="mt-0.5 text-[12.5px] text-muted">
                    {v.city} · {v.street}
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-chip px-3 py-1 text-[11px] font-semibold text-ink-soft">
                  {typeLabel.get(v.type as never) ?? v.type}
                </span>
              </div>
              <div className="mt-3 text-[12.5px] font-semibold text-accent">
                {v.count} közelgő esemény
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageFrame>
  );
}
