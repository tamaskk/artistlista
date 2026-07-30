"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { VENUE_TYPES } from "@artistlist/types";
import { createVenue, geocodeAddress, getVenueSuggestions } from "@/actions/venues";
import { AutocompleteInput } from "@/components/AutocompleteInput";
import { PlaceAutocomplete } from "@/components/PlaceAutocomplete";
import { PageHeader } from "@/components/PageHeader";
import { Field, GhostButton, PrimaryButton, inputCls } from "@/components/ui";

export default function NewVenuePage() {
  const [state, formAction, pending] = useActionState(createVenue, null);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  const [coords, setCoords] = useState<{ lng: number; lat: number } | null>(null);
  const [geoResults, setGeoResults] = useState<
    { lng: number; lat: number; display: string }[] | null
  >(null);
  const [geoPending, startGeo] = useTransition();
  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [sug, setSug] = useState<{ names: string[]; cities: string[]; streets: string[] }>({
    names: [],
    cities: [],
    streets: [],
  });
  useEffect(() => {
    getVenueSuggestions()
      .then(setSug)
      .catch(() => {});
  }, []);

  const geocode = () => {
    startGeo(async () => {
      const res = await geocodeAddress(`${street}, ${city}`);
      if (res.ok && res.data) setGeoResults(res.data);
      else setGeoResults([]);
    });
  };

  return (
    <>
      <PageHeader crumb="Helyszínek / Új" title="Új helyszín" />
      <form action={formAction} className="flex max-w-2xl flex-col gap-5">
        {state && !state.ok && state.error && (
          <div className="rounded-xl bg-warn/10 px-4 py-3 text-sm font-medium text-warn">
            {state.error}
            <input type="hidden" name="force" value="1" />
          </div>
        )}
        {state?.ok && (
          <div className="rounded-xl bg-ok/10 px-4 py-3 text-sm font-medium text-ok">
            Helyszín mentve ✓ — az esemény-űrlapon már kiválasztható.
          </div>
        )}
        <Field label="Helyszín neve" error={fe?.name}>
          <PlaceAutocomplete
            name="name"
            value={name}
            onChange={setName}
            onSelectPlace={(h) => {
              setName(h.name);
              if (h.street) setStreet(h.street);
              if (h.city) setCity(h.city);
              if (h.postcode) setZip(h.postcode);
              setCoords({ lng: h.lng, lat: h.lat });
            }}
            placeholder="Keress valós helyszínt (pl. Budapest Park, Akvárium…)"
            error={!!fe?.name}
          />
          <span className="mt-1 block text-xs text-muted">
            Valós helyet keres (OpenStreetMap) — kiválasztáskor kitölti a címet és a koordinátát.
          </span>
        </Field>
        <div className="grid grid-cols-[1.5fr_1fr_0.6fr] gap-4">
          <Field label="Utca, házszám" error={fe?.street}>
            <AutocompleteInput
              name="street"
              value={street}
              onChange={setStreet}
              options={sug.streets}
              error={!!fe?.street}
            />
          </Field>
          <Field label="Város" error={fe?.city}>
            <AutocompleteInput
              name="city"
              value={city}
              onChange={setCity}
              options={sug.cities}
              error={!!fe?.city}
            />
          </Field>
          <Field label="Irányítószám" error={fe?.zip}>
            <input
              name="zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="flex flex-col gap-2.5">
          <GhostButton type="button" onClick={geocode} disabled={geoPending} className="self-start">
            {geoPending ? "Keresés…" : "Keresés a térképen (geokódolás)"}
          </GhostButton>
          {geoResults && geoResults.length === 0 && (
            <span className="text-xs text-muted">
              Nincs találat — add meg kézzel a koordinátákat.
            </span>
          )}
          {geoResults?.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setCoords({ lng: r.lng, lat: r.lat });
                setGeoResults(null);
              }}
              className="rounded-xl border border-line px-3.5 py-2.5 text-left text-[13px] transition hover:border-accent"
            >
              {r.display}
              <span className="ml-2 text-muted">
                ({r.lat.toFixed(4)}, {r.lng.toFixed(4)})
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Hosszúság (lng)" error={fe?.lng}>
            <input
              name="lng"
              value={coords?.lng ?? ""}
              onChange={(e) => setCoords((c) => ({ lat: c?.lat ?? 0, lng: Number(e.target.value) }))}
              className={inputCls}
              placeholder="19.0546"
            />
          </Field>
          <Field label="Szélesség (lat)" error={fe?.lat}>
            <input
              name="lat"
              value={coords?.lat ?? ""}
              onChange={(e) => setCoords((c) => ({ lng: c?.lng ?? 0, lat: Number(e.target.value) }))}
              className={inputCls}
              placeholder="47.4977"
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Típus" error={fe?.type}>
            <select name="type" className={inputCls} defaultValue="club">
              {VENUE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Kapacitás (opcionális)" error={fe?.capacity}>
            <input type="number" name="capacity" min={1} className={inputCls} />
          </Field>
          <Field label="Weboldal (opcionális)" error={fe?.website}>
            <input name="website" placeholder="https://…" className={inputCls} />
          </Field>
        </div>

        <PrimaryButton disabled={pending} className="self-start">
          {pending ? "Mentés…" : "Helyszín mentése"}
        </PrimaryButton>
      </form>
    </>
  );
}
