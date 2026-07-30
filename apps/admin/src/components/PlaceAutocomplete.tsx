"use client";

import { useEffect, useRef, useState } from "react";
import { searchPlaces, type PlaceHit } from "@/actions/venues";
import { inputCls } from "./ui";

/**
 * Google-féle hely-autocomplete: gépelésre valós helyszíneket keres (OSM/Photon).
 * Kiválasztáskor a szülő kitölti a cím-mezőket + koordinátát.
 */
export function PlaceAutocomplete({
  name,
  value,
  onChange,
  onSelectPlace,
  placeholder,
  error,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  onSelectPlace: (hit: PlaceHit) => void;
  placeholder?: string;
  error?: boolean;
}) {
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastQ = useRef("");

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const runSearch = (q: string) => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 3) {
      setHits([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      lastQ.current = q;
      setLoading(true);
      console.debug("[places] keresés:", q);
      const res = await searchPlaces(q);
      if (lastQ.current !== q) {
        console.debug("[places] elévült válasz, eldobva:", q);
        return;
      }
      setLoading(false);
      setOpen(true);
      if (res.ok && res.data) {
        console.debug("[places] találatok:", res.data.length, res.data);
        setHits(res.data);
      } else {
        console.warn("[places] hiba:", res.ok ? "üres" : res.error);
        setHits([]);
      }
    }, 300);
  };

  const pick = (h: PlaceHit) => {
    onChange(h.name);
    onSelectPlace(h);
    setOpen(false);
    setHits([]);
    setActive(-1);
  };

  return (
    <div ref={wrapRef} className="relative">
      <input
        name={name}
        value={value}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          runSearch(e.target.value);
          setActive(-1);
        }}
        onFocus={() => hits.length && setOpen(true)}
        onKeyDown={(e) => {
          if (!open || !hits.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, hits.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault();
            pick(hits[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={`${inputCls} ${error ? "border-bad" : ""}`}
      />
      {open && (loading || hits.length > 0 || value.trim().length >= 3) && (
        <div className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-xl">
          {loading && hits.length === 0 && (
            <div className="px-3 py-2 text-[13px] text-muted">Keresés…</div>
          )}
          {!loading && hits.length === 0 && (
            <div className="px-3 py-2 text-[13px] text-muted">
              Nincs találat — írd be a címet kézzel.
            </div>
          )}
          {hits.map((h, i) => (
            <button
              key={`${h.name}-${i}`}
              type="button"
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(h);
              }}
              className={`block w-full rounded-lg px-3 py-2 text-left ${
                i === active ? "bg-accent/10" : "hover:bg-chip"
              }`}
            >
              <div className="text-[13.5px] font-semibold">{h.name}</div>
              {h.display && h.display !== h.name && (
                <div className="text-[12px] text-muted">{h.display}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
