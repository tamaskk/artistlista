"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { GENRES, type ActionResult } from "@artistlist/types";
import { submitEvent } from "@/actions/submit";

type FormState = ActionResult | null;
type Option = { id: string; name: string; sub?: string };

const DRAFT_KEY = "submit-draft";
const TEXT_FIELDS = [
  "title",
  "startsAt",
  "priceMin",
  "ticketUrl",
  "image",
  "description",
  "newArtistName",
  "newVenueName",
  "newVenueCity",
];

function fieldError(state: FormState, key: string): string | undefined {
  if (state && "fieldErrors" in state && state.fieldErrors) {
    return (state.fieldErrors as Record<string, string[]>)[key]?.[0];
  }
  return undefined;
}
function topError(state: FormState): string | undefined {
  return state && "error" in state ? (state.error as string) : undefined;
}

const inputCls =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-[14px] outline-none transition focus:border-accent";
const labelCls = "mb-1.5 block text-[13px] font-semibold text-ink-soft";

/** Ma (helyi idő) `YYYY-MM-DDT00:00` — a datetime-local `min`-je, hogy ne lehessen múltat választani. */
function minTodayLocal(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T00:00`;
}

/** Kereső combobox: gépelésre találatokat kér az endpointról; kiválasztható. */
function SearchPicker({
  endpoint,
  mapResults,
  placeholder,
  onPick,
  selected,
  onClear,
}: {
  endpoint: string;
  mapResults: (json: any) => Option[];
  placeholder: string;
  onPick: (o: Option) => void;
  selected: Option | null;
  onClear: () => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selected || q.trim().length < 2) {
      setResults([]);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`${endpoint}${encodeURIComponent(q.trim())}`);
        const json = await r.json();
        setResults(mapResults(json));
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 220);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, endpoint, selected, mapResults]);

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-accent/40 bg-accent/5 px-3.5 py-2.5">
        <span className="text-[14px] font-semibold">{selected.name}</span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-semibold text-accent hover:text-accent-deep"
        >
          Módosítás
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        placeholder={placeholder}
        className={inputCls}
      />
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1.5 max-h-56 w-full overflow-y-auto rounded-xl border border-line bg-surface p-1.5 shadow-pop">
          {results.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                onPick(o);
                setOpen(false);
                setQ("");
              }}
              className="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-chip"
            >
              <span className="text-[13.5px] font-semibold">{o.name}</span>
              {o.sub && <span className="text-xs text-muted">{o.sub}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SubmitEventForm({ loggedIn = true }: { loggedIn?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitEvent, null);

  const [artist, setArtist] = useState<Option | null>(null);
  const [artistNew, setArtistNew] = useState(false);
  const [venue, setVenue] = useState<Option | null>(null);
  const [venueNew, setVenueNew] = useState(false);
  const [priceKind, setPriceKind] = useState("unknown");

  const formRef = useRef<HTMLFormElement>(null);
  const [hydrated, setHydrated] = useState(false);

  const saveDraft = useCallback(() => {
    const f = formRef.current;
    if (!f) return;
    const fields: Record<string, string> = {};
    for (const n of TEXT_FIELDS) {
      const el = f.elements.namedItem(n) as HTMLInputElement | null;
      if (el) fields[n] = el.value;
    }
    const genres = Array.from(
      f.querySelectorAll<HTMLInputElement>('input[name="newArtistGenres"]:checked'),
    ).map((x) => x.value);
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ artist, artistNew, venue, venueNew, priceKind, fields, genres }),
      );
    } catch {
      /* noop */
    }
  }, [artist, artistNew, venue, venueNew, priceKind]);

  // vázlat visszaállítása belépés utáni visszatéréskor (egyszer)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.artist) setArtist(d.artist);
        if (d.artistNew) setArtistNew(true);
        if (d.venue) setVenue(d.venue);
        if (d.venueNew) setVenueNew(true);
        if (d.priceKind) setPriceKind(d.priceKind);
        setTimeout(() => {
          const f = formRef.current;
          if (!f) return;
          for (const [n, v] of Object.entries(d.fields ?? {})) {
            const el = f.elements.namedItem(n) as HTMLInputElement | null;
            if (el && typeof v === "string") el.value = v;
          }
          for (const g of d.genres ?? []) {
            const el = f.querySelector<HTMLInputElement>(
              `input[name="newArtistGenres"][value="${g}"]`,
            );
            if (el) el.checked = true;
          }
        }, 0);
      }
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  // állapot-változáskor mentés (csak a visszaállítás után)
  useEffect(() => {
    if (hydrated) saveDraft();
  }, [hydrated, artist, artistNew, venue, venueNew, priceKind, saveDraft]);

  return (
    <form
      ref={formRef}
      action={action}
      onInput={() => hydrated && saveDraft()}
      className="flex flex-col gap-6"
    >
      {topError(state) && (
        <div className="rounded-xl bg-bad/10 px-3.5 py-2.5 text-[13px] text-bad">{topError(state)}</div>
      )}

      {/* ── Előadó ── */}
      <div>
        <label className={labelCls}>Előadó *</label>
        <input type="hidden" name="existingArtistId" value={artistNew ? "" : (artist?.id ?? "")} />
        {!artistNew ? (
          <>
            <SearchPicker
              endpoint="/api/artists?q="
              mapResults={(j) =>
                (j.artists ?? []).map((a: any) => ({
                  id: a.id,
                  name: a.name,
                  sub: [a.homeCity, (a.genres ?? []).join(", ")].filter(Boolean).join(" · "),
                }))
              }
              placeholder="Keress rá az előadóra…"
              selected={artist}
              onPick={setArtist}
              onClear={() => setArtist(null)}
            />
            <button
              type="button"
              onClick={() => {
                setArtist(null);
                setArtistNew(true);
              }}
              className="mt-2 text-[13px] font-semibold text-accent hover:text-accent-deep"
            >
              + Nincs a listában? Új előadó létrehozása
            </button>
          </>
        ) : (
          <div className="rounded-xl border border-line bg-chip/40 p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink-soft">Új előadó (jóváhagyásra kerül)</span>
              <button
                type="button"
                onClick={() => setArtistNew(false)}
                className="text-xs font-semibold text-accent hover:text-accent-deep"
              >
                Mégis meglévőt választok
              </button>
            </div>
            <input
              name="newArtistName"
              placeholder="Előadó neve"
              className={inputCls}
              defaultValue=""
            />
            {fieldError(state, "newArtistName") && (
              <span className="mt-1 block text-xs text-bad">{fieldError(state, "newArtistName")}</span>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {GENRES.map((g) => (
                <label
                  key={g.slug}
                  className="cursor-pointer rounded-full border border-line-strong px-3 py-1 text-[12.5px] has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:text-white"
                >
                  <input type="checkbox" name="newArtistGenres" value={g.slug} className="hidden" />
                  {g.name}
                </label>
              ))}
            </div>
            {fieldError(state, "newArtistGenres") && (
              <span className="mt-1 block text-xs text-bad">{fieldError(state, "newArtistGenres")}</span>
            )}
          </div>
        )}
      </div>

      {/* ── Helyszín ── */}
      <div>
        <label className={labelCls}>Helyszín *</label>
        <input type="hidden" name="existingVenueId" value={venueNew ? "" : (venue?.id ?? "")} />
        {!venueNew ? (
          <>
            <SearchPicker
              endpoint="/api/venues/autocomplete?q="
              mapResults={(j) =>
                (j.venues ?? []).map((v: any) => ({
                  id: v.id,
                  name: v.name,
                  sub: [v.city, v.street].filter(Boolean).join(" · "),
                }))
              }
              placeholder="Keress rá a helyszínre…"
              selected={venue}
              onPick={setVenue}
              onClear={() => setVenue(null)}
            />
            <button
              type="button"
              onClick={() => {
                setVenue(null);
                setVenueNew(true);
              }}
              className="mt-2 text-[13px] font-semibold text-accent hover:text-accent-deep"
            >
              + Nincs a listában? Új helyszín megadása
            </button>
          </>
        ) : (
          <div className="rounded-xl border border-line bg-chip/40 p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink-soft">Új helyszín</span>
              <button
                type="button"
                onClick={() => setVenueNew(false)}
                className="text-xs font-semibold text-accent hover:text-accent-deep"
              >
                Mégis meglévőt választok
              </button>
            </div>
            <input name="newVenueName" placeholder="Helyszín neve" className={inputCls} defaultValue="" />
            {fieldError(state, "newVenueName") && (
              <span className="mt-1 block text-xs text-bad">{fieldError(state, "newVenueName")}</span>
            )}
            <input name="newVenueCity" placeholder="Város" className={`${inputCls} mt-2`} defaultValue="" />
            <p className="mt-1.5 text-xs text-muted">
              A pontos térképi pozíciót a moderátor véglegesíti.
            </p>
          </div>
        )}
      </div>

      {/* ── Alapadatok ── */}
      <label className="block">
        <span className={labelCls}>Esemény címe *</span>
        <input name="title" placeholder="pl. Azahriah // Budapest Park" className={inputCls} />
        {fieldError(state, "title") && (
          <span className="mt-1 block text-xs text-bad">{fieldError(state, "title")}</span>
        )}
      </label>

      <label className="block">
        <span className={labelCls}>Időpont *</span>
        <input name="startsAt" type="datetime-local" min={minTodayLocal()} className={inputCls} />
        {fieldError(state, "startsAt") && (
          <span className="mt-1 block text-xs text-bad">{fieldError(state, "startsAt")}</span>
        )}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={labelCls}>Ár</span>
          <select
            name="priceKind"
            value={priceKind}
            onChange={(e) => setPriceKind(e.target.value)}
            className={inputCls}
          >
            <option value="unknown">Nincs megadva</option>
            <option value="free">Ingyenes</option>
            <option value="paid">Fizetős</option>
          </select>
        </label>
        {priceKind === "paid" && (
          <label className="block">
            <span className={labelCls}>Jegyár-tól (Ft)</span>
            <input name="priceMin" type="number" min="0" placeholder="pl. 6900" className={inputCls} />
            {fieldError(state, "priceMin") && (
              <span className="mt-1 block text-xs text-bad">{fieldError(state, "priceMin")}</span>
            )}
          </label>
        )}
      </div>

      <label className="block">
        <span className={labelCls}>Jegylink (opcionális)</span>
        <input name="ticketUrl" placeholder="https://…" className={inputCls} />
        {fieldError(state, "ticketUrl") && (
          <span className="mt-1 block text-xs text-bad">{fieldError(state, "ticketUrl")}</span>
        )}
      </label>

      <label className="block">
        <span className={labelCls}>Borítókép URL (opcionális)</span>
        <input name="image" placeholder="https://…" className={inputCls} />
      </label>

      <label className="block">
        <span className={labelCls}>Leírás (opcionális)</span>
        <textarea name="description" rows={3} className={inputCls} />
      </label>

      {loggedIn ? (
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#26262e] disabled:opacity-60"
        >
          {pending ? "Beküldés…" : "Koncert beküldése jóváhagyásra"}
        </button>
      ) : (
        <Link
          href="/regisztracio?from=/koncert-bekuldese"
          onClick={saveDraft}
          className="rounded-full bg-ink px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-[#26262e]"
        >
          Regisztrálj a beküldéshez → (az adataidat megőrizzük)
        </Link>
      )}
    </form>
  );
}
