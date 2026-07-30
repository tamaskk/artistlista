"use client";

import { useEffect, useRef, useState } from "react";
import { GENRES, formatHuf } from "@artistlist/types";
import { DATE_OPTIONS, type HeroFilters } from "./filters";

const PRICE_STEPS = [3000, 5000, 8000, 10000, 15000, 20000];

export function FilterBar({
  filters,
  onChange,
  view,
  onViewChange,
}: {
  filters: HeroFilters;
  onChange: (f: HeroFilters) => void;
  view: "list" | "map";
  onViewChange: (v: "list" | "map") => void;
}) {
  const [cityInput, setCityInput] = useState(false);
  const [cityDraft, setCityDraft] = useState("");
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (!cityInput || cities.length) return;
    fetch("/api/cities")
      .then((r) => r.json())
      .then((d) => setCities(d.cities ?? []))
      .catch(() => {});
  }, [cityInput, cities.length]);

  const cityMatches = (
    cityDraft.trim()
      ? cities.filter((c) => c.toLowerCase().includes(cityDraft.trim().toLowerCase()))
      : cities
  ).slice(0, 10);

  const pickCity = (c: string) => {
    onChange({ ...filters, city: c });
    setCityInput(false);
    setCityDraft("");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-5">
      <div className="flex flex-wrap items-center gap-3.5">
        {/* nézetváltó — mobilon vezérli a nézetet */}
        <div className="flex rounded-full bg-chip p-1 lg:hidden">
          <button
            onClick={() => onViewChange("list")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              view === "list" ? "bg-ink font-semibold text-white" : "text-ink-soft"
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => onViewChange("map")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${
              view === "map" ? "bg-ink font-semibold text-white" : "text-ink-soft"
            }`}
          >
            Térkép
          </button>
        </div>

        {/* város */}
        {filters.city ? (
          <span className="flex items-center gap-2 rounded-full bg-chip px-4 py-2 text-sm font-semibold">
            {filters.city}
            <button
              onClick={() => onChange({ ...filters, city: "" })}
              className="font-normal text-faint hover:text-ink"
              aria-label="Város törlése"
            >
              ✕
            </button>
          </span>
        ) : cityInput ? (
          <div className="relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (cityMatches[0]) pickCity(cityMatches[0]);
                else if (cityDraft.trim()) pickCity(cityDraft.trim());
              }}
            >
              <input
                autoFocus
                value={cityDraft}
                onChange={(e) => setCityDraft(e.target.value)}
                onBlur={() => setTimeout(() => setCityInput(false), 120)}
                placeholder="Város keresése…"
                className="w-44 rounded-full border-[1.5px] border-line-strong px-4 py-1.5 text-sm outline-none focus:border-accent"
              />
            </form>
            {cityMatches.length > 0 && (
              <div className="absolute left-0 top-full z-20 mt-1.5 max-h-56 w-44 overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-pop">
                {cityMatches.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pickCity(c);
                    }}
                    className="block w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-chip"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setCityInput(true)}
            className="flex h-[38px] items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white transition hover:bg-[#26262e]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            Város
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* max ár */}
        <Dropdown
          label={
            filters.free
              ? "Csak ingyenes"
              : filters.priceMax
                ? `Max ${formatHuf(filters.priceMax)}`
                : "Max ár"
          }
          active={filters.free || !!filters.priceMax}
          onClear={
            filters.free || filters.priceMax
              ? () => onChange({ ...filters, priceMax: null, free: false })
              : undefined
          }
        >
          {(close) => (
            <div className="flex flex-col gap-1 p-2">
              <button
                className={`rounded-lg px-3 py-1.5 text-left text-sm hover:bg-chip ${filters.free ? "font-semibold text-accent" : ""}`}
                onClick={() => {
                  onChange({ ...filters, free: !filters.free, priceMax: null });
                  close();
                }}
              >
                Csak ingyenes
              </button>
              <div className="my-1 border-t border-line" />
              {PRICE_STEPS.map((p) => (
                <button
                  key={p}
                  className={`rounded-lg px-3 py-1.5 text-left text-sm hover:bg-chip ${filters.priceMax === p ? "font-semibold text-accent" : ""}`}
                  onClick={() => {
                    onChange({ ...filters, priceMax: p, free: false });
                    close();
                  }}
                >
                  Max {formatHuf(p)}
                </button>
              ))}
            </div>
          )}
        </Dropdown>

        {/* műfaj */}
        <Dropdown
          label={filters.genres.length ? `Műfaj (${filters.genres.length})` : "Műfaj"}
          active={!!filters.genres.length}
          onClear={
            filters.genres.length ? () => onChange({ ...filters, genres: [] }) : undefined
          }
        >
          {() => (
            <div className="grid w-64 grid-cols-2 gap-1 p-2">
              {GENRES.map((g) => {
                const on = filters.genres.includes(g.slug);
                return (
                  <button
                    key={g.slug}
                    className={`rounded-lg px-3 py-1.5 text-left text-sm hover:bg-chip ${on ? "font-semibold text-accent" : ""}`}
                    onClick={() =>
                      onChange({
                        ...filters,
                        genres: on
                          ? filters.genres.filter((s) => s !== g.slug)
                          : [...filters.genres, g.slug],
                      })
                    }
                  >
                    {on ? "✓ " : ""}
                    {g.name}
                  </button>
                );
              })}
            </div>
          )}
        </Dropdown>

        {/* dátum */}
        <Dropdown
          label={DATE_OPTIONS.find((d) => d.value === filters.date)?.label ?? "Dátum"}
          active={filters.date !== "honap"}
        >
          {(close) => (
            <div className="flex flex-col gap-1 p-2">
              {DATE_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  className={`rounded-lg px-3 py-1.5 text-left text-sm hover:bg-chip ${filters.date === d.value ? "font-semibold text-accent" : ""}`}
                  onClick={() => {
                    onChange({ ...filters, date: d.value });
                    close();
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </Dropdown>
      </div>
    </div>
  );
}

function Dropdown({
  label,
  active,
  onClear,
  children,
}: {
  label: string;
  active?: boolean;
  onClear?: () => void;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] px-4 py-2 text-[13.5px] font-medium transition hover:bg-chip ${
          active ? "border-accent text-accent" : "border-line-strong"
        }`}
      >
        {label}
        {onClear ? (
          <span
            role="button"
            tabIndex={0}
            className="text-faint hover:text-ink"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
          >
            ✕
          </span>
        ) : (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 min-w-44 rounded-2xl border border-line bg-white shadow-pop">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
