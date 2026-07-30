"use client";

import { useActionState } from "react";
import { GENRES } from "@artistlist/types";
import { createArtist } from "@/actions/artists";
import { PageHeader } from "@/components/PageHeader";
import { Field, PrimaryButton, inputCls } from "@/components/ui";

export default function NewArtistPage() {
  const [state, formAction, pending] = useActionState(createArtist, null);
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <>
      <PageHeader crumb="Előadóim / Új" title="Új előadó" />
      <form action={formAction} className="flex max-w-2xl flex-col gap-5">
        {state && !state.ok && state.error && (
          <div className="rounded-xl bg-bad/10 px-4 py-3 text-sm font-medium text-bad">
            {state.error}
          </div>
        )}
        <Field label="Előadónév" error={fe?.name}>
          <input name="name" className={inputCls} />
        </Field>
        <Field label="Műfajok (max 3)" error={fe?.genres}>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <label
                key={g.slug}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-1.5 text-[13px] has-checked:border-accent has-checked:bg-accent/10 has-checked:text-accent"
              >
                <input type="checkbox" name="genres" value={g.slug} className="hidden" />
                {g.name}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Rövid bemutatkozás" error={fe?.shortBio}>
          <textarea name="shortBio" rows={2} maxLength={280} className={inputCls} />
        </Field>
        <Field label="Székhely város" error={fe?.homeCity}>
          <input name="homeCity" className={inputCls} />
        </Field>
        <p className="rounded-xl bg-chip px-4 py-3 text-[13px] text-ink-soft">
          A profil moderáció után jelenik meg a weboldalon — közben már rögzíthetsz eseményeket
          piszkozatként.
        </p>
        <PrimaryButton disabled={pending} className="self-start">
          {pending ? "Létrehozás…" : "Előadó létrehozása"}
        </PrimaryButton>
      </form>
    </>
  );
}
