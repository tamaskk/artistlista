"use client";

import Link from "next/link";
import { useActionState } from "react";
import { GENRES } from "@artistlist/types";
import { registerArtistAccount } from "@/actions/auth";
import { Field, PrimaryButton, inputCls } from "@/components/ui";

export default function RegisterArtistPage() {
  const [state, formAction, pending] = useActionState(registerArtistAccount, null);
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <>
      <h1 className="pb-5 font-display text-2xl font-bold tracking-tight">
        Előadói regisztráció
      </h1>
      <form action={formAction} className="flex flex-col gap-4">
        {state && !state.ok && state.error && (
          <div className="rounded-xl bg-bad/10 px-4 py-3 text-sm font-medium text-bad">
            {state.error}
          </div>
        )}
        <Field label="Teljes neved" error={fe?.name}>
          <input name="name" className={inputCls} />
        </Field>
        <Field label="E-mail" error={fe?.email}>
          <input type="email" name="email" className={inputCls} />
        </Field>
        <Field label="Jelszó (min. 8 karakter)" error={fe?.password}>
          <input type="password" name="password" className={inputCls} />
        </Field>
        <div className="my-1 border-t border-line" />
        <Field label="Előadónév" error={fe?.artistName}>
          <input name="artistName" className={inputCls} />
        </Field>
        <Field label="Profilkép URL (opcionális)" error={fe?.image}>
          <input name="image" placeholder="https://… (pl. Instagram/Wikimedia kép link)" className={inputCls} />
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
        <PrimaryButton disabled={pending} className="mt-1">
          {pending ? "Regisztráció…" : "Fiók létrehozása"}
        </PrimaryButton>
        <p className="text-[12px] text-muted">
          A profil moderáció után jelenik meg a weboldalon. A regisztrációval elfogadod az
          ÁSZF-et.
        </p>
      </form>
      <div className="pt-4 text-center text-[13px] text-muted">
        <Link href="/register" className="font-semibold text-accent">
          ← Vissza
        </Link>
      </div>
    </>
  );
}
