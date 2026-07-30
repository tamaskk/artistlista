"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/actions/auth";
import { Field, PrimaryButton, inputCls } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);

  return (
    <>
      <h1 className="pb-3 font-display text-2xl font-bold">Elfelejtett jelszó</h1>
      {state?.ok ? (
        <div className="rounded-xl bg-ok/10 px-4 py-3 text-sm font-medium text-ok">
          Ha létezik fiók ezzel az email címmel, elküldtük a visszaállító linket. Nézd meg a
          postaládád (a spam mappát is).
        </div>
      ) : (
        <form action={action} className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Add meg az email címed — küldünk egy linket, amivel új jelszót állíthatsz be.
          </p>
          <Field
            label="Email"
            error={state && !state.ok ? state.fieldErrors?.email : undefined}
          >
            <input type="email" name="email" required className={inputCls} />
          </Field>
          <PrimaryButton disabled={pending}>
            {pending ? "Küldés…" : "Visszaállító link kérése"}
          </PrimaryButton>
        </form>
      )}
      <div className="pt-5 text-center text-[13px]">
        <Link href="/login" className="font-semibold text-accent">
          ← Vissza a belépéshez
        </Link>
      </div>
    </>
  );
}
