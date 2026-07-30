"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { EventsApiResponse, PublicEventCard } from "@/lib/public-types";
import { EventCard } from "../EventCard";
import { FilterBar } from "./FilterBar";
import {
  DEFAULT_FILTERS,
  dateRange,
  filtersToParams,
  paramsToFilters,
  type HeroFilters,
} from "./filters";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse rounded-[20px] bg-[#F4F5F9]" />
  ),
});

const SORT_LABELS: Record<HeroFilters["sort"], string> = {
  date: "Dátum",
  price: "Ár",
  popular: "Népszerűség",
};

export function HeroSearch({ fullHeight = false }: { fullHeight?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<HeroFilters>(() =>
    paramsToFilters(new URLSearchParams(searchParams.toString())),
  );
  const [view, setView] = useState<"list" | "map">("list");
  const [bbox, setBbox] = useState<[number, number, number, number] | null>(null);
  const [data, setData] = useState<EventsApiResponse | null>(null);
  const [extra, setExtra] = useState<PublicEventCard[]>([]);
  const [mapEvents, setMapEvents] = useState<PublicEventCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sortOpen, setSortOpen] = useState(false);

  const updateFilters = useCallback(
    (f: HeroFilters) => {
      setFilters(f);
      const p = filtersToParams(f);
      router.replace(p.size ? `${pathname}?${p}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (bbox && !filters.city) p.set("bbox", bbox.join(","));
    if (filters.city) p.set("city", filters.city);
    const { from, to } = dateRange(filters.date);
    p.set("from", from.toISOString());
    if (to) p.set("to", to.toISOString());
    if (filters.genres.length) p.set("genres", filters.genres.join(","));
    if (filters.priceMax) p.set("priceMax", String(filters.priceMax));
    if (filters.free) p.set("free", "1");
    if (filters.q) p.set("q", filters.q);
    p.set("sort", filters.sort);
    return p.toString();
  }, [bbox, filters]);

  useEffect(() => {
    if (!bbox && !filters.city) return; // térkép betöltésére várunk
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/events?${query}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: EventsApiResponse) => {
        setData(d);
        setExtra([]);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setLoading(false);
      });
    return () => ctrl.abort();
  }, [query, bbox, filters.city]);

  // A térkép MINDEN eseményt mutat (nem lapozva) — így a köteg-pinek (pl.
  // STRAND, Budapest Park) teljesek. Külön, magas limites lekérés.
  useEffect(() => {
    if (!bbox && !filters.city) return;
    const ctrl = new AbortController();
    fetch(`/api/events?${query}&limit=500`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: EventsApiResponse) => setMapEvents(d.events))
      .catch(() => {});
    return () => ctrl.abort();
  }, [query, bbox, filters.city]);

  const loadMore = useCallback(() => {
    if (!data?.nextCursor) return;
    fetch(`/api/events?${query}&cursor=${encodeURIComponent(data.nextCursor)}`)
      .then((r) => r.json())
      .then((d: EventsApiResponse) => {
        setExtra((prev) => [...prev, ...d.events]);
        setData((prev) => (prev ? { ...prev, nextCursor: d.nextCursor } : d));
      })
      .catch(() => {});
  }, [data?.nextCursor, query]);

  // végtelen görgetés
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  const rawEvents = useMemo(() => [...(data?.events ?? []), ...extra], [data?.events, extra]);
  // fizetős kiemelés: a promoted események mindig legfelül, tier szerint
  const events = useMemo(() => {
    const promoted = data?.promoted ?? [];
    if (!promoted.length) return rawEvents;
    const promotedIds = new Set(promoted.map((e) => e.id));
    return [...promoted, ...rawEvents.filter((e) => !promotedIds.has(e.id))];
  }, [data?.promoted, rawEvents]);
  const allPinsEvents = mapEvents;

  // A hero (szűrősor + térkép/lista) sose lógjon túl egy képernyőn: a rács
  // magassága a viewportból számol, levonva a fejléc + szűrősor + keret helyét.
  const heightClass = fullHeight
    ? "h-[calc(100vh-210px)] min-h-[460px]"
    : "h-[calc(100vh-260px)] max-h-[680px] min-h-[440px]";

  return (
    <section>
      <FilterBar filters={filters} onChange={updateFilters} view={view} onViewChange={setView} />
      <div className={`grid gap-6 lg:grid-cols-[55fr_45fr] ${heightClass}`}>
        <div className={`${view === "map" ? "block" : "hidden"} h-full lg:block`}>
          <MapView events={allPinsEvents} hoveredId={hoveredId} onBboxChange={setBbox} />
        </div>
        <div
          className={`${view === "list" ? "flex" : "hidden"} min-h-0 flex-col lg:flex`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {loading && !data ? "Keresés…" : `${data?.total ?? 0} esemény`}
              {filters.city ? `, ${filters.city}` : ""}
            </h2>
            <div className="relative">
              <button
                onClick={() => setSortOpen((o) => !o)}
                className="flex items-center gap-1.5 text-[13.5px] font-medium text-ink-soft"
              >
                {SORT_LABELS[filters.sort]}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 flex min-w-40 flex-col gap-1 rounded-2xl border border-line bg-surface p-2 shadow-pop">
                  {(Object.keys(SORT_LABELS) as HeroFilters["sort"][]).map((s) => (
                    <button
                      key={s}
                      className={`rounded-lg px-3 py-1.5 text-left text-sm hover:bg-chip ${filters.sort === s ? "font-semibold text-accent" : ""}`}
                      onClick={() => {
                        updateFilters({ ...filters, sort: s });
                        setSortOpen(false);
                      }}
                    >
                      {SORT_LABELS[s]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-2">
            {data?.tooMany && (
              <div className="mb-3 rounded-xl bg-chip px-4 py-2.5 text-[13px] text-ink-soft">
                Sok találat — szűkítsd a keresést vagy közelíts a térképen.
              </div>
            )}
            {events.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-line-strong px-6 py-10 text-center">
                <div className="text-sm font-semibold">Nincs esemény ezekkel a szűrőkkel</div>
                <div className="text-[13px] text-muted">Próbáld tágítani a keresést:</div>
                <div className="flex flex-wrap justify-center gap-2">
                  {filters.genres.length > 0 && (
                    <button
                      onClick={() => updateFilters({ ...filters, genres: [] })}
                      className="rounded-full border border-line-strong px-4 py-1.5 text-[13px] font-semibold hover:bg-chip"
                    >
                      Műfajszűrő törlése
                    </button>
                  )}
                  {(filters.priceMax || filters.free) && (
                    <button
                      onClick={() => updateFilters({ ...filters, priceMax: null, free: false })}
                      className="rounded-full border border-line-strong px-4 py-1.5 text-[13px] font-semibold hover:bg-chip"
                    >
                      Ár-szűrő törlése
                    </button>
                  )}
                  {filters.city && (
                    <button
                      onClick={() => updateFilters({ ...filters, city: "" })}
                      className="rounded-full border border-line-strong px-4 py-1.5 text-[13px] font-semibold hover:bg-chip"
                    >
                      Város-szűrő törlése
                    </button>
                  )}
                  {filters.date !== "mind" && (
                    <button
                      onClick={() => updateFilters({ ...filters, date: "mind" })}
                      className="rounded-full border border-line-strong px-4 py-1.5 text-[13px] font-semibold hover:bg-chip"
                    >
                      Összes dátum
                    </button>
                  )}
                  <button
                    onClick={() => updateFilters(DEFAULT_FILTERS)}
                    className="rounded-full bg-ink px-4 py-1.5 text-[13px] font-semibold text-white hover:bg-[#26262e]"
                  >
                    Összes szűrő törlése
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {events.map((e) => (
                  <EventCard
                    key={e.id}
                    event={e}
                    onHover={setHoveredId}
                    highlighted={hoveredId === e.id}
                  />
                ))}
              </div>
            )}
            <div ref={sentinelRef} className="h-6" />
          </div>
        </div>
      </div>
    </section>
  );
}
