"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPassword } from "@/actions/auth";
import { Field, PrimaryButton, inputCls } from "@/components/ui";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, null);

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="pb-3 font-display text-2xl font-bold">Hiányzó token</h1>
        <p className="pb-5 text-sm text-muted">A visszaállító link érvénytelen.</p>
        <Link href="/forgot-password" className="font-semibold text-accent">
          Kérj új linket →
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="pb-3 font-display text-2xl font-bold">Új jelszó beállítása</h1>
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="token" value={token} />
        {state && !state.ok && state.error && (
          <div className="rounded-xl bg-bad/10 px-4 py-3 text-sm font-medium text-bad">
            {state.error}
          </div>
        )}
        <Field
          label="Új jelszó (min. 8 karakter)"
          error={state && !state.ok ? state.fieldErrors?.password : undefined}
        >
          <input type="password" name="password" required autoComplete="new-password" className={inputCls} />
        </Field>
        <PrimaryButton disabled={pending}>{pending ? "Mentés…" : "Jelszó mentése"}</PrimaryButton>
      </form>
      <div className="pt-5 text-center text-[13px]">
        <Link href="/login" className="font-semibold text-accent">
          ← Vissza a belépéshez
        </Link>
      </div>
    </>
  );
}
