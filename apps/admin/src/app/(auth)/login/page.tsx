"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { loginAction } from "@/actions/auth";
import { Field, PrimaryButton, inputCls } from "@/components/ui";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const [justRegistered, setJustRegistered] = useState(false);
  useEffect(() => {
    setJustRegistered(new URLSearchParams(window.location.search).get("pending") === "1");
  }, []);

  return (
    <>
      <h1 className="pb-5 font-display text-2xl font-bold tracking-tight">Bejelentkezés</h1>
      {justRegistered && (
        <div className="mb-4 rounded-xl bg-ok/10 px-4 py-3 text-sm font-medium text-ok">
          Regisztráció beküldve! A fiókod jóváhagyásra vár — a superadmin megerősítése után tudsz
          belépni.
        </div>
      )}
      <form action={formAction} className="flex flex-col gap-4">
        {state && !state.ok && (
          <div className="rounded-xl bg-bad/10 px-4 py-3 text-sm font-medium text-bad">
            {state.error}
          </div>
        )}
        <Field label="E-mail">
          <input type="email" name="email" required className={inputCls} />
        </Field>
        <Field label="Jelszó">
          <input type="password" name="password" required className={inputCls} />
        </Field>
        <PrimaryButton disabled={pending} className="mt-1">
          {pending ? "Belépés…" : "Belépés"}
        </PrimaryButton>
      </form>
      <div className="flex items-center justify-between pt-5 text-[13px]">
        <Link href="/forgot-password" className="text-muted hover:text-ink">
          Elfelejtett jelszó
        </Link>
        <Link href="/register" className="font-semibold text-accent">
          Regisztráció →
        </Link>
      </div>
    </>
  );
}
