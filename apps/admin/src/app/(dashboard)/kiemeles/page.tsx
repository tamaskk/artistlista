import Link from "next/link";
import { Event, connectDB } from "@artistlist/database";
import { PROMO_TIERS, formatEventDate, formatHuf, promoTierName } from "@artistlist/types";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui";
import { getManagedArtists, requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const user = await requireUser();
  await connectDB();
  const artists = await getManagedArtists(user);
  const scopeFilter =
    user.role === "SUPER_ADMIN"
      ? {}
      : user.role === "MANAGER"
        ? { organizationId: user.organizationId }
        : { artistIds: { $in: artists.map((a) => a._id) } };

  const now = new Date();
  const events = await Event.find(scopeFilter).sort({ startsAt: 1 }).limit(200).lean();
  const isActive = (e: any) =>
    (e.promotion?.tier ?? 0) > 0 &&
    e.promotion?.activeUntil &&
    new Date(e.promotion.activeUntil) > now;
  // aktív kiemeltek elöl
  const sorted = [...events].sort((a, b) => Number(isActive(b)) - Number(isActive(a)));
  const activeCount = events.filter(isActive).length;

  return (
    <>
      <PageHeader crumb="Kiemelés" title="Kiemelés / Hirdetés" />

      <Card className="mb-5 border-[#F5C518]/40 bg-[#F5C518]/5 p-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[18px]">★</span>
          <h2 className="font-display text-[18px] font-bold">Emeld ki a koncertjeidet</h2>
        </div>
        <p className="mb-4 max-w-2xl text-[13.5px] text-ink-soft">
          A kiemelt esemény a nyilvános oldalon a <strong>lista tetején</strong> és a térképen{" "}
          <strong>arany pinnel</strong> jelenik meg. 5 csomag közül választhatsz — minél magasabb a
          tier, annál feljebb kerül. 1 héttől kedvezmény. Válaszd ki lent a koncertet, majd a
          „Kiemelés" gombbal állítsd be a csomagot.
        </p>
        <div className="flex flex-wrap gap-2">
          {PROMO_TIERS.map((t) => (
            <span
              key={t.tier}
              className="rounded-full border border-line-strong bg-white px-3 py-1 text-[12px] font-semibold"
            >
              {t.tier}. {t.name} · {formatHuf(t.dailyHuf)}/nap
            </span>
          ))}
        </div>
      </Card>

      <Card className="px-5 pb-5 pt-2">
        <div className="flex items-center justify-between px-2 py-3">
          <span className="text-[11.5px] font-semibold uppercase tracking-wider text-muted">
            Eseményeid ({events.length})
          </span>
          <span className="text-[12.5px] text-muted">{activeCount} aktív kiemelés</span>
        </div>
        {sorted.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            Nincs eseményed. Előbb hozz létre egyet az „Eseményeim" alatt.
          </p>
        ) : (
          sorted.map((e) => {
            const id = String(e._id);
            const active = isActive(e);
            return (
              <div
                key={id}
                className="grid grid-cols-[1.5fr_1fr_auto_auto] items-center gap-3.5 rounded-[10px] border-t border-chip px-2 py-3 hover:bg-row"
              >
                <span className="truncate text-[13.5px] font-semibold">
                  {e.artistNames?.[0] ?? e.title}
                </span>
                <span className="truncate text-[12.5px] text-muted">
                  {e.venueName} · {formatEventDate(e.startsAt)}
                </span>
                {active ? (
                  <span className="whitespace-nowrap rounded-full bg-[#F5C518]/20 px-2.5 py-1 text-[11.5px] font-bold text-[#946a00]">
                    ★ {promoTierName(e.promotion!.tier)} · lejár{" "}
                    {new Date(e.promotion!.activeUntil!).toLocaleDateString("hu-HU", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                ) : (
                  <span className="whitespace-nowrap text-[12px] text-muted">Nincs kiemelve</span>
                )}
                <Link
                  href={`/esemenyek/${id}/szerkesztes#kiemeles`}
                  className="whitespace-nowrap rounded-full bg-[#E7B008] px-4 py-1.5 text-[12.5px] font-bold text-ink transition hover:bg-[#d4a406]"
                >
                  {active ? "Kezelés" : "★ Kiemelés"}
                </Link>
              </div>
            );
          })
        )}
      </Card>
    </>
  );
}
