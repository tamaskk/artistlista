"use client";

import { useActionState, useState } from "react";
import { GENRES, SOCIAL_KEYS, type ActionResult } from "@artistlist/types";
import { Field, PrimaryButton, inputCls } from "./ui";

type TabKey = "base" | "images" | "links" | "booking";

const TABS: { key: TabKey; label: string }[] = [
  { key: "base", label: "Alapadatok" },
  { key: "images", label: "Képek" },
  { key: "links", label: "Linkek & embed" },
  { key: "booking", label: "Booking" },
];

const SOCIAL_LABELS: Record<string, string> = {
  website: "Weboldal",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  spotify: "Spotify",
  soundcloud: "SoundCloud",
};

export interface ArtistFormValues {
  name: string;
  shortBio: string;
  bio: string;
  genres: string[];
  homeCity: string;
  avatar: string;
  cover: string;
  gallery: string[];
  links: Record<string, string>;
  spotifyArtistId: string;
  youtubeVideoId: string;
  bookingEmail: string;
  bookingPhone: string;
  bookingPublic: boolean;
}

type TabAction = (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;

export function ArtistForm({
  baseAction,
  imagesAction,
  linksAction,
  bookingAction,
  initial,
}: {
  baseAction: TabAction;
  imagesAction: TabAction;
  linksAction: TabAction;
  bookingAction: TabAction;
  initial: ArtistFormValues;
}) {
  const [tab, setTab] = useState<TabKey>("base");

  return (
    <div>
      <div className="flex items-center gap-2 pb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-4 py-[7px] text-[13px] font-semibold transition ${
              tab === t.key
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-ink-soft hover:border-line-strong"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "base" && <BaseTab action={baseAction} initial={initial} />}
      {tab === "images" && <ImagesTab action={imagesAction} initial={initial} />}
      {tab === "links" && <LinksTab action={linksAction} initial={initial} />}
      {tab === "booking" && <BookingTab action={bookingAction} initial={initial} />}
    </div>
  );
}

type TabProps = {
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  initial: ArtistFormValues;
};

function SaveRow({ state, pending }: { state: ActionResult | null; pending: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <PrimaryButton disabled={pending}>{pending ? "Mentés…" : "Mentés"}</PrimaryButton>
      {state?.ok && <span className="text-sm font-medium text-ok">Mentve ✓</span>}
      {state && !state.ok && state.error && (
        <span className="text-sm font-medium text-bad">{state.error}</span>
      )}
    </div>
  );
}

function BaseTab({ action, initial }: TabProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <Field label="Előadónév" error={fe?.name}>
        <input name="name" defaultValue={initial.name} className={inputCls} />
      </Field>
      <Field label="Műfajok (max 3)" error={fe?.genres}>
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
                defaultChecked={initial.genres.includes(g.slug)}
                className="hidden"
              />
              {g.name}
            </label>
          ))}
        </div>
      </Field>
      <Field label="Rövid bemutatkozás (max 280 karakter)" error={fe?.shortBio}>
        <textarea name="shortBio" defaultValue={initial.shortBio} rows={2} maxLength={280} className={inputCls} />
      </Field>
      <Field label="Teljes bio" error={fe?.bio}>
        <textarea name="bio" defaultValue={initial.bio} rows={6} className={inputCls} />
      </Field>
      <Field label="Székhely város" error={fe?.homeCity}>
        <input name="homeCity" defaultValue={initial.homeCity} className={inputCls} />
      </Field>
      <SaveRow state={state} pending={pending} />
    </form>
  );
}

function ImagesTab({ action, initial }: TabProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <p className="rounded-xl bg-chip px-4 py-3 text-[13px] text-ink-soft">
        MVP: kép-URL-ek megadása (Cloudinary signed upload a v1-ben). Ajánlott méretek: avatar
        1:1 / min. 800px, borító 16:5.
      </p>
      <Field label="Avatar URL" error={fe?.avatar}>
        <input name="avatar" defaultValue={initial.avatar} className={inputCls} />
      </Field>
      <Field label="Borítókép URL" error={fe?.cover}>
        <input name="cover" defaultValue={initial.cover} className={inputCls} />
      </Field>
      <Field label="Galéria (max 12 URL, soronként egy)" error={fe?.gallery}>
        <textarea
          name="gallery"
          defaultValue={initial.gallery.join("\n")}
          rows={5}
          className={inputCls}
        />
      </Field>
      <SaveRow state={state} pending={pending} />
    </form>
  );
}

function LinksTab({ action, initial }: TabProps) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        {SOCIAL_KEYS.map((key) => (
          <Field key={key} label={SOCIAL_LABELS[key]}>
            <input
              name={`link_${key}`}
              defaultValue={initial.links[key] ?? ""}
              placeholder="https://…"
              className={inputCls}
            />
          </Field>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Spotify artist ID (embedhez)">
          <input name="spotifyArtistId" defaultValue={initial.spotifyArtistId} className={inputCls} />
        </Field>
        <Field label="YouTube videó ID (embedhez)">
          <input name="youtubeVideoId" defaultValue={initial.youtubeVideoId} className={inputCls} />
        </Field>
      </div>
      <SaveRow state={state} pending={pending} />
    </form>
  );
}

function BookingTab({ action, initial }: TabProps) {
  const [state, formAction, pending] = useActionState(action, null);
  const fe = state && !state.ok ? state.fieldErrors : undefined;
  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <Field label="Booking email" error={fe?.bookingEmail}>
        <input name="bookingEmail" defaultValue={initial.bookingEmail} className={inputCls} />
      </Field>
      <Field label="Telefon" error={fe?.bookingPhone}>
        <input name="bookingPhone" defaultValue={initial.bookingPhone} className={inputCls} />
      </Field>
      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="bookingPublic"
          defaultChecked={initial.bookingPublic}
          className="h-4 w-4 accent-accent"
        />
        Publikus megjelenítés az előadóoldalon
      </label>
      <SaveRow state={state} pending={pending} />
    </form>
  );
}
