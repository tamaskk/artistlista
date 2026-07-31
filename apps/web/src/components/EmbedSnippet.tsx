"use client";

import { useState } from "react";
import { toast } from "@/components/Toaster";

/** „Beágyazás" — iframe-kód másolása az előadó fellépéseihez (partner/előadó weboldalra). */
export function EmbedSnippet({ webUrl, slug, name }: { webUrl: string; slug: string; name: string }) {
  const [open, setOpen] = useState(false);
  const code = `<iframe src="${webUrl}/embed/eloado/${slug}" width="100%" height="360" style="border:0;border-radius:16px" title="${name} — következő koncertek" loading="lazy"></iframe>`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      toast("Beágyazó-kód a vágólapra másolva");
    } catch {
      toast("Nem sikerült másolni");
    }
  }

  return (
    <div className="rounded-card border border-line p-6 shadow-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-bold uppercase tracking-wide text-faint">Beágyazás</span>
        <span className="text-muted">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <p className="text-[13px] text-muted">
            Tedd ki a fellépéseket a saját weboldaladra — másold be ezt a kódot.
          </p>
          <code className="block max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-line bg-canvas p-3 font-mono text-[11px] leading-relaxed text-ink-soft">
            {code}
          </code>
          <button
            onClick={copy}
            className="rounded-lg bg-ink px-3 py-2 text-[13px] font-medium text-white"
          >
            Kód másolása
          </button>
        </div>
      )}
    </div>
  );
}
