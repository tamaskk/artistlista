"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ActionResult } from "@artistlist/types";
import { loginFan, registerFan } from "@/actions/auth";

type FormState = ActionResult | null;

function fieldError(state: FormState, key: string): string | undefined {
  if (state && "fieldErrors" in state && state.fieldErrors) {
    return (state.fieldErrors as Record<string, string[]>)[key]?.[0];
  }
  return undefined;
}

function topError(state: FormState): string | undefined {
  return state && "error" in state ? (state.error as string) : undefined;
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-[14px] outline-none transition focus:border-accent ${
          error ? "border-bad" : "border-line-strong"
        }`}
      />
      {error && <span className="mt-1 block text-xs text-bad">{error}</span>}
    </label>
  );
}

function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#26262e] disabled:opacity-60"
    >
      {pending ? "Egy pillanat…" : children}
    </button>
  );
}

export function LoginForm({ from }: { from?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(loginFan, null);
  return (
    <form action={action} className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-bold tracking-tight">Belépés</h1>
      <p className="-mt-2 text-[13px] text-muted">
        Jelentkezz be, hogy koncertet tölthess fel.
      </p>
      {from && <input type="hidden" name="from" value={from} />}
      {topError(state) && (
        <div className="rounded-xl bg-bad/10 px-3.5 py-2.5 text-[13px] text-bad">{topError(state)}</div>
      )}
      <Field label="Email" name="email" type="email" autoComplete="email" error={fieldError(state, "email")} />
      <Field
        label="Jelszó"
        name="password"
        type="password"
        autoComplete="current-password"
        error={fieldError(state, "password")}
      />
      <SubmitButton pending={pending}>Belépés</SubmitButton>
      <p className="text-center text-[13px] text-muted">
        Még nincs fiókod?{" "}
        <Link
          href={from ? `/regisztracio?from=${encodeURIComponent(from)}` : "/regisztracio"}
          className="font-semibold text-accent hover:text-accent-deep"
        >
          Regisztrálj
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ from }: { from?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(registerFan, null);
  return (
    <form action={action} className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-bold tracking-tight">Regisztráció</h1>
      <p className="-mt-2 text-[13px] text-muted">
        Külsős fiók — nem kell előadónak lenned. Koncertet tölthetsz fel.
      </p>
      {from && <input type="hidden" name="from" value={from} />}
      {topError(state) && (
        <div className="rounded-xl bg-bad/10 px-3.5 py-2.5 text-[13px] text-bad">{topError(state)}</div>
      )}
      <Field label="Neved" name="name" autoComplete="name" error={fieldError(state, "name")} />
      <Field label="Email" name="email" type="email" autoComplete="email" error={fieldError(state, "email")} />
      <Field
        label="Jelszó (min. 8 karakter)"
        name="password"
        type="password"
        autoComplete="new-password"
        error={fieldError(state, "password")}
      />
      <SubmitButton pending={pending}>Fiók létrehozása</SubmitButton>
      <p className="text-center text-[13px] text-muted">
        Van már fiókod?{" "}
        <Link
          href={from ? `/belepes?from=${encodeURIComponent(from)}` : "/belepes"}
          className="font-semibold text-accent hover:text-accent-deep"
        >
          Belépés
        </Link>
      </p>
    </form>
  );
}
