"use client";

import { useState } from "react";
import { toast } from "@/components/Toaster";

/** Naptár-feed URL kártya: másolható link + „Hozzáadás" gomb (webcal://). */
export function CalendarFeed({ url }: { url: string }) {
  const [open, setOpen] = useState(false);
  const webcal = url.replace(/^https?:\/\//, "webcal://");

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast("Feed-URL a vágólapra másolva");
    } catch {
      toast("Nem sikerült másolni");
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-line bg-surface p-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="flex items-center gap-2 text-[15px] font-semibold">
          📅 Naptár-előfizetés
        </span>
        <span className="text-muted">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-[13px] text-muted">
            Fizess elő a kedvenceidre a naptáradban — az új mentések automatikusan megjelennek
            (Google Naptár: „Egyéb naptárak → URL alapján"; Apple: „Új naptár-előfizetés").
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-line bg-canvas px-3 py-2 text-[12px] text-ink-soft">
              {url}
            </code>
            <button
              onClick={copy}
              className="rounded-lg border border-line px-3 py-2 text-[13px] font-medium hover:bg-chip"
            >
              Másolás
            </button>
            <a
              href={webcal}
              className="rounded-lg bg-ink px-3 py-2 text-[13px] font-medium text-white"
            >
              Hozzáadás
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
