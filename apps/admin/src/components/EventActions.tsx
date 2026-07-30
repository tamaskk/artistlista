"use client";

import { cancelEvent, deleteEvent } from "@/actions/events";

const btn =
  "flex h-7 w-7 items-center justify-center rounded-full text-[13px] text-muted transition hover:bg-chip hover:text-ink";

/** Lemondás: bekéri az indokot (megjelenik a publikus oldalon). */
export function CancelEventButton({ id }: { id: string }) {
  return (
    <button
      title="Lemondás (indokkal)"
      className={btn}
      onClick={async () => {
        const reason = window.prompt(
          "Miért marad el az esemény? (megjelenik a nyilvános eseményoldalon)",
          "",
        );
        if (reason === null) return; // Mégse
        await cancelEvent(id, reason.trim());
      }}
    >
      ✕
    </button>
  );
}

/** Végleges törlés megerősítéssel. */
export function DeleteEventButton({ id }: { id: string }) {
  return (
    <button
      title="Végleges törlés"
      className={`${btn} hover:bg-bad/10 hover:text-bad`}
      onClick={async () => {
        if (window.confirm("Biztosan VÉGLEG törlöd ezt az eseményt? Ez nem vonható vissza.")) {
          await deleteEvent(id);
        }
      }}
    >
      🗑
    </button>
  );
}
