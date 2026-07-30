"use client";

import { useActionState, useEffect, useState } from "react";
import { GENRES, type ActionResult } from "@artistlist/types";
import { Field, PrimaryButton, inputCls } from "./ui";

/** Mai nap helyi idő szerint `YYYY-MM-DD` (datetime-local `min`-hez). */
function localTodayStr(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export interface ArtistOption {
  id: string;
  name: string;
}
export interface VenueOption {
  id: string;
  name: string;
  city: string;
}

export interface EventFormValues {
  title?: string;
  artistIds?: string[];
  guestArtistNames?: string;
  venueId?: string;
  startsAt?: string; // datetime-local
  doorsAt?: string;
  priceKind?: "free" | "paid" | "unknown";
  priceMin?: number | null;
  priceMax?: number | null;
  ticketUrl?: string;
  description?: string;
  image?: string;
  genres?: string[];
  status?: string;
}

export function EventForm({
  action,
  artists,
  venues,
  initial,
  submitLabel,
}: {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  artists: ArtistOption[];
  venues: VenueOption[];
  initial?: EventFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  const [priceKind, setPriceKind] = useState(initial?.priceKind ?? "paid");
  const [selectedArtists, setSelectedArtists] = useState<string[]>(
    initial?.artistIds ?? (artists.length === 1 ? [artists[0].id] : []),
  );
  const [title, setTitle] = useState(initial?.title ?? "");
  const [venueId, setVenueId] = useState(initial?.venueId ?? "");
  // új esemény: ne legyen választható múltbéli dátum (meglévő szerkesztésénél engedjük)
  const minStart = initial ? undefined : `${localTodayStr()}T00:00`;

  // cím-javaslat: {Előadó} · {Helyszín}
  useEffect(() => {
    if (initial?.title) return;
    const artist = artists.find((a) => a.id === selectedArtists[0]);
    const venue = venues.find((v) => v.id === venueId);
    if (artist && venue) setTitle((t) => (t === "" || t.includes(" · ") ? `${artist.name} · ${venue.name}` : t));
  }, [selectedArtists, venueId, artists, venues, initial?.title]);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-5">
      {state && !state.ok && state.error && (
        <div className="rounded-xl bg-bad/10 px-4 py-3 text-sm font-medium text-bad">
          {state.error}
        </div>
      )}

      <Field label="Előadók (első = headliner)" error={fe?.artistIds}>
        <div className="flex flex-wrap gap-2">
          {artists.map((a) => {
            const on = selectedArtists.includes(a.id);
            return (
              <button
                type="button"
                key={a.id}
                onClick={() =>
                  setSelectedArtists((prev) =>
                    on ? prev.filter((id) => id !== a.id) : [...prev, a.id],
                  )
                }
                className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                  on
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-line-strong hover:bg-chip"
                }`}
              >
                {on ? "✓ " : ""}
                {a.name}
              </button>
            );
          })}
        </div>
        {selectedArtists.map((id) => (
          <input key={id} type="hidden" name="artistIds" value={id} />
        ))}
      </Field>

      <Field label="Vendégelőadók (vesszővel elválasztva, opcionális)">
        <input
          name="guestArtistNames"
          defaultValue={initial?.guestArtistNames}
          className={inputCls}
          placeholder="pl. Vasököl, DJ Warmup"
        />
      </Field>

      <Field label="Helyszín" error={fe?.venueId}>
        <select
          name="venueId"
          value={venueId}
          onChange={(e) => setVenueId(e.target.value)}
          className={inputCls}
        >
          <option value="">Válassz helyszínt…</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} — {v.city}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted">
          Nem találod?{" "}
          <a href="/helyszinek/uj" target="_blank" className="font-semibold text-accent">
            + Új helyszín
          </a>{" "}
          (mentés után frissítsd az oldalt)
        </span>
      </Field>

      <Field label="Cím" error={fe?.title}>
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Kezdés" error={fe?.startsAt}>
          <input
            type="datetime-local"
            name="startsAt"
            defaultValue={initial?.startsAt}
            min={minStart}
            className={inputCls}
          />
        </Field>
        <Field label="Kapunyitás (opcionális)">
          <input
            type="datetime-local"
            name="doorsAt"
            defaultValue={initial?.doorsAt}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Ár">
        <div className="flex items-center gap-2">
          {(
            [
              ["paid", "Fizetős"],
              ["free", "Ingyenes"],
              ["unknown", "Később derül ki"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setPriceKind(k)}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                priceKind === k
                  ? "border-ink bg-ink text-white"
                  : "border-line-strong hover:bg-chip"
              }`}
            >
              {label}
            </button>
          ))}
          <input type="hidden" name="priceKind" value={priceKind} />
        </div>
      </Field>

      {priceKind === "paid" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Jegyár-tól (Ft)" error={fe?.priceMin}>
            <input
              type="number"
              name="priceMin"
              defaultValue={initial?.priceMin ?? undefined}
              className={inputCls}
              min={0}
            />
          </Field>
          <Field label="Jegyár-ig (Ft, opcionális)" error={fe?.priceMax}>
            <input
              type="number"
              name="priceMax"
              defaultValue={initial?.priceMax ?? undefined}
              className={inputCls}
              min={0}
            />
          </Field>
        </div>
      )}

      <Field label="Jegylink (https://…)" error={fe?.ticketUrl}>
        <input
          name="ticketUrl"
          defaultValue={initial?.ticketUrl}
          className={inputCls}
          placeholder="https://tixa.hu/…"
        />
      </Field>

      <Field label="Leírás" error={fe?.description}>
        <textarea
          name="description"
          defaultValue={initial?.description}
          rows={5}
          className={inputCls}
        />
      </Field>

      <Field label="Borítókép URL (üresen az előadó borítója)" error={fe?.image}>
        <input name="image" defaultValue={initial?.image} className={inputCls} />
      </Field>

      <Field label="Műfaj (üresen az előadókból)" error={fe?.genres}>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <label
              key={g.slug}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-1.5 text-[13px] has-checked:border-accent has-checked:bg-accent/10 has-checked:text-accent"
            >
              <input
                type="checkbox"
                name="genres"
                value={g.slug}
                defaultChecked={initial?.genres?.includes(g.slug)}
                className="hidden"
              />
              {g.name}
            </label>
          ))}
        </div>
      </Field>

      <Field label="Állapot">
        <select name="status" defaultValue={initial?.status ?? "draft"} className={inputCls}>
          <option value="draft">Piszkozat</option>
          <option value="published">Közzétéve</option>
          <option value="cancelled">Elmarad</option>
          <option value="soldout">Telt ház</option>
        </select>
      </Field>

      <div className="flex items-center gap-3">
        <PrimaryButton disabled={pending}>{pending ? "Mentés…" : submitLabel}</PrimaryButton>
      </div>
    </form>
  );
}
