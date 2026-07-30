"use client";

import { useActionState } from "react";
import { acceptInvite } from "@/actions/auth";
import { Field, PrimaryButton, inputCls } from "@/components/ui";

export function InviteAcceptForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(acceptInvite, null);
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state && !state.ok && state.error && (
        <div className="rounded-xl bg-bad/10 px-4 py-3 text-sm font-medium text-bad">
          {state.error}
        </div>
      )}
      <input type="hidden" name="token" value={token} />
      <Field label="Teljes neved" error={fe?.name}>
        <input name="name" className={inputCls} />
      </Field>
      <Field label="Jelszó (min. 8 karakter)" error={fe?.password}>
        <input type="password" name="password" className={inputCls} />
      </Field>
      <PrimaryButton disabled={pending}>
        {pending ? "Csatlakozás…" : "Meghívó elfogadása"}
      </PrimaryButton>
    </form>
  );
}
