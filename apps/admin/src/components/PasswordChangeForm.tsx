"use client";

import { useActionState } from "react";
import { changePassword } from "@/actions/auth";
import { Field, PrimaryButton, inputCls } from "@/components/ui";

export function PasswordChangeForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={action} className="flex flex-col gap-3.5 border-t border-line pt-4">
      <span className="text-[13px] font-semibold text-ink-soft">Jelszó módosítása</span>
      {state?.ok && (
        <div className="rounded-lg bg-ok/10 px-3 py-2 text-[13px] font-medium text-ok">
          Jelszó frissítve ✓
        </div>
      )}
      {state && !state.ok && state.error && (
        <div className="rounded-lg bg-bad/10 px-3 py-2 text-[13px] font-medium text-bad">
          {state.error}
        </div>
      )}
      <Field label="Jelenlegi jelszó" error={fe?.currentPassword}>
        <input
          type="password"
          name="currentPassword"
          required
          autoComplete="current-password"
          className={inputCls}
        />
      </Field>
      <Field label="Új jelszó (min. 8 karakter)" error={fe?.newPassword}>
        <input
          type="password"
          name="newPassword"
          required
          autoComplete="new-password"
          className={inputCls}
        />
      </Field>
      <PrimaryButton disabled={pending}>{pending ? "Mentés…" : "Jelszó módosítása"}</PrimaryButton>
    </form>
  );
}
