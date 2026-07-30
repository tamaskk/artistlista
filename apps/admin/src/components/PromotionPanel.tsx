"use client";

import { useActionState, useState, useTransition } from "react";
import {
  PROMO_DURATIONS,
  PROMO_TIERS,
  formatHuf,
  promoQuote,
  type ActionResult,
} from "@artistlist/types";
import { cancelPromotion, purchasePromotion } from "@/actions/promotion";

export function PromotionPanel({
  eventId,
  current,
}: {
  eventId: string;
  current: { tier: number; activeUntil: string | null } | null;
}) {
  const [tier, setTier] = useState<number>(3);
  const [durationKey, setDurationKey] = useState<string>("1w");
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    purchasePromotion.bind(null, eventId),
    null,
  );
  const [cancelPending, startCancel] = useTransition();

  const quote = promoQuote(tier, durationKey);
  const activeTier =
    current && current.tier > 0 && current.activeUntil && new Date(current.activeUntil) > new Date()
      ? current.tier
      : 0;
  const activeName = PROMO_TIERS.find((t) => t.tier === activeTier)?.name;

  return (
    <section
      id="kiemeles"
      className="mt-10 max-w-3xl scroll-mt-6 rounded-frame border-2 border-[#F5C518]/50 bg-white p-6"
    >
      <div className="mb-1 flex items-center gap-2">
        <h2 className="font-display text-[20px] font-bold tracking-tight">Kiemelés (hirdetés)</h2>
        <span className="rounded-full bg-[#F5C518]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#946a00]">
          ★ Fizetős
        </span>
      </div>
      <p className="mb-4 text-[13px] text-muted">
        A kiemelt esemény a lista tetején és a térképen arany pinnel jelenik meg. Magasabb tier =
        feljebb a listában.
      </p>

      {/* Előnézet: így fog kinézni a kártya kiemelten */}
      <div className="mb-5 rounded-2xl border border-line bg-chip/40 p-4">
        <div className="mb-2.5 text-[11.5px] font-semibold uppercase tracking-wider text-muted">
          Így fog kinézni
        </div>
        <div className="flex items-center gap-4">
          <div className="w-40 shrink-0 overflow-hidden rounded-xl border-2 border-[#E7B008] bg-white ring-2 ring-[#F5C518]/40">
            <div className="relative h-16 bg-gradient-to-br from-[#dfe2f4] to-[#ebedf9]">
              <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/80 px-2 py-0.5 text-[9px] font-bold text-white">
                JÚL 31
              </span>
              <span className="absolute right-1.5 top-1.5 rounded-full bg-gradient-to-r from-[#F5C518] to-[#E7B008] px-2 py-0.5 text-[9px] font-bold text-[#0b0b0f]">
                ★ Kiemelt
              </span>
            </div>
            <div className="p-2">
              <div className="h-2 w-3/4 rounded bg-line-strong" />
              <div className="mt-1.5 h-2 w-1/2 rounded bg-line" />
            </div>
          </div>
          <ul className="space-y-1 text-[12.5px] text-ink-soft">
            <li>
              • A <strong>lista tetején</strong> jelenik meg
            </li>
            <li>
              • A térképen <strong>arany pinnel</strong> + ★ koronával
            </li>
            <li>
              • „★ Kiemelt" jelzés a kártyán
            </li>
          </ul>
        </div>
      </div>

      {activeTier > 0 && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-[#F5C518]/50 bg-[#F5C518]/8 px-4 py-3">
          <div className="text-[13.5px]">
            <span className="font-semibold">Aktív: {activeName}</span>
            <span className="text-muted">
              {" "}
              · lejár:{" "}
              {new Date(current!.activeUntil!).toLocaleDateString("hu-HU", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <button
            disabled={cancelPending}
            onClick={() => startCancel(() => void cancelPromotion(eventId))}
            className="text-[13px] font-semibold text-bad hover:underline disabled:opacity-60"
          >
            Lemondás
          </button>
        </div>
      )}

      {/* Tier választó */}
      <div className="mb-4">
        <div className="mb-2 text-[13px] font-semibold text-ink-soft">Csomag (tier)</div>
        <div className="flex flex-wrap gap-2">
          {PROMO_TIERS.map((t) => (
            <button
              key={t.tier}
              type="button"
              onClick={() => setTier(t.tier)}
              className={`flex flex-col items-start rounded-xl border px-3.5 py-2 text-left transition ${
                tier === t.tier ? "border-accent bg-accent/10" : "border-line-strong hover:bg-chip"
              }`}
            >
              <span className="text-[13px] font-semibold">
                {t.tier}. {t.name}
              </span>
              <span className="text-[11px] text-muted">{formatHuf(t.dailyHuf)}/nap</span>
            </button>
          ))}
        </div>
      </div>

      {/* Időtartam választó */}
      <div className="mb-5">
        <div className="mb-2 text-[13px] font-semibold text-ink-soft">Időtartam</div>
        <div className="flex flex-wrap gap-2">
          {PROMO_DURATIONS.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => setDurationKey(d.key)}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition ${
                durationKey === d.key
                  ? "border-ink bg-ink text-white"
                  : "border-line-strong hover:bg-chip"
              }`}
            >
              {d.label}
              {d.discount > 0 && (
                <span className={durationKey === d.key ? "text-[#F5C518]" : "text-ok"}>
                  {" "}
                  −{Math.round(d.discount * 100)}%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Ár + vásárlás */}
      {quote && (
        <form action={action} className="flex items-center gap-4 border-t border-line pt-4">
          <input type="hidden" name="tier" value={tier} />
          <input type="hidden" name="durationKey" value={durationKey} />
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[24px] font-bold">{formatHuf(quote.price)}</span>
              {quote.discount > 0 && (
                <span className="text-[13px] text-muted line-through">{formatHuf(quote.listPrice)}</span>
              )}
            </div>
            <div className="text-[12px] text-muted">
              {quote.tierName} · {quote.days} nap
              {quote.discount > 0 ? ` · −${Math.round(quote.discount * 100)}% kedvezmény` : ""}
            </div>
          </div>
          <button
            disabled={pending}
            className="ml-auto rounded-full bg-[#E7B008] px-6 py-3 text-sm font-bold text-ink transition hover:bg-[#d4a406] disabled:opacity-60"
          >
            {pending ? "Feldolgozás…" : activeTier > 0 ? "Hosszabbítás / váltás" : "Megvásárlás"}
          </button>
        </form>
      )}

      {state && !state.ok && state.error && (
        <div className="mt-3 rounded-xl bg-bad/10 px-4 py-2.5 text-[13px] text-bad">{state.error}</div>
      )}
      {state && state.ok && (
        <div className="mt-3 rounded-xl bg-ok/10 px-4 py-2.5 text-[13px] font-semibold text-ok">
          Kiemelés aktiválva! ✓
        </div>
      )}
    </section>
  );
}
