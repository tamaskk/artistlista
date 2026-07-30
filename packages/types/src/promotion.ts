/**
 * Fizetős esemény-kiemelés (hirdetés) — 5 tier, több időtartam, kedvezményekkel.
 * Minél magasabb a tier, annál drágább és annál feljebb kerül a listában.
 */
export const PROMO_TIERS = [
  { tier: 1, name: "Bronz", dailyHuf: 2000 },
  { tier: 2, name: "Ezüst", dailyHuf: 3500 },
  { tier: 3, name: "Arany", dailyHuf: 6000 },
  { tier: 4, name: "Platina", dailyHuf: 10000 },
  { tier: 5, name: "Gyémánt", dailyHuf: 18000 },
] as const;

export type PromoTier = (typeof PROMO_TIERS)[number]["tier"];

/** Időtartamok — 1 héttől kezdődően növekvő kedvezmény. */
export const PROMO_DURATIONS = [
  { key: "1d", label: "1 nap", days: 1, discount: 0 },
  { key: "1w", label: "1 hét", days: 7, discount: 0.1 },
  { key: "1m", label: "1 hónap", days: 30, discount: 0.2 },
  { key: "2m", label: "2 hónap", days: 60, discount: 0.25 },
  { key: "3m", label: "3 hónap", days: 90, discount: 0.3 },
  { key: "6m", label: "6 hónap", days: 180, discount: 0.4 },
  { key: "1y", label: "1 év", days: 365, discount: 0.5 },
] as const;

export type PromoDurationKey = (typeof PROMO_DURATIONS)[number]["key"];

export interface PromoQuote {
  tier: number;
  tierName: string;
  days: number;
  discount: number; // 0..1
  listPrice: number; // kedvezmény nélkül
  price: number; // fizetendő, 100 Ft-ra kerekítve
}

/** Ár kiszámítása tier + időtartam alapján. Ismeretlen bemenetnél null. */
export function promoQuote(tier: number, durationKey: string): PromoQuote | null {
  const t = PROMO_TIERS.find((x) => x.tier === tier);
  const d = PROMO_DURATIONS.find((x) => x.key === durationKey);
  if (!t || !d) return null;
  const listPrice = t.dailyHuf * d.days;
  const price = Math.round((listPrice * (1 - d.discount)) / 100) * 100;
  return {
    tier: t.tier,
    tierName: t.name,
    days: d.days,
    discount: d.discount,
    listPrice,
    price,
  };
}

export function promoTierName(tier: number): string {
  return PROMO_TIERS.find((x) => x.tier === tier)?.name ?? "";
}
