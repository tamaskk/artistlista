"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerManagerAccount } from "@/actions/auth";
import { Field, PrimaryButton, inputCls } from "@/components/ui";

export default function RegisterManagerPage() {
  const [state, formAction, pending] = useActionState(registerManagerAccount, null);
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <>
      <h1 className="pb-5 font-display text-2xl font-bold tracking-tight">
        Menedzsment regisztráció
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
        <Field label="Szervezet / ügynökség neve" error={fe?.orgName}>
          <input name="orgName" className={inputCls} />
        </Field>
        <Field label="Weboldal (opcionális)" error={fe?.orgWebsite}>
          <input name="orgWebsite" placeholder="https://…" className={inputCls} />
        </Field>
        <PrimaryButton disabled={pending} className="mt-1">
          {pending ? "Regisztráció…" : "Fiók létrehozása"}
        </PrimaryButton>
        <p className="text-[12px] text-muted">
          Belépés után hozhatod létre az első előadót és hívhatod meg a csapattagokat.
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
