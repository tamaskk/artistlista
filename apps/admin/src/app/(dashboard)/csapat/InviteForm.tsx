"use client";

import { useActionState } from "react";
import { inviteMember } from "@/actions/team";
import { PrimaryButton, inputCls } from "@/components/ui";

export function InviteForm() {
  const [state, formAction, pending] = useActionState(inviteMember, null);
  return (
    <form action={formAction} className="flex items-center gap-2">
      {state?.ok && <span className="text-sm font-medium text-ok">Meghívó elküldve ✓</span>}
      {state && !state.ok && (
        <span className="text-sm font-medium text-bad">
          {state.error ?? state.fieldErrors?.email?.[0]}
        </span>
      )}
      <input
        type="email"
        name="email"
        required
        placeholder="kolléga@ceg.hu"
        className={`${inputCls} w-56`}
      />
      <PrimaryButton disabled={pending}>{pending ? "Küldés…" : "Tag meghívása"}</PrimaryButton>
    </form>
  );
}
