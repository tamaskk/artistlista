import type { Metadata } from "next";
import Link from "next/link";
import { PageFrame } from "@/components/PageFrame";
import { EventCard } from "@/components/EventCard";
import { FollowManager } from "@/components/FollowManager";
import { getRecommendations } from "@/lib/data";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Neked ajánljuk" };
export const dynamic = "force-dynamic";

export default async function ForYouPage() {
  const user = await requireUser("/neked");
  const { events, hasSignals } = await getRecommendations(user.id, 12);

  return (
    <PageFrame active="/neked">
      <div className="mt-8 space-y-8">
        <div>
          <h1 className="font-display text-[32px] font-bold tracking-tight">Neked ajánljuk</h1>
          <p className="mt-2 text-[15px] text-muted">
            A követett előadóid, városaid, műfajaid és kedvenceid alapján.
          </p>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-line-strong p-6 text-sm text-muted">
            {hasSignals
              ? "Jelenleg nincs közelgő esemény a követéseid alapján — nézz vissza később!"
              : "Kövess előadókat, városokat vagy műfajokat, és itt megjelennek a neked szóló koncertek."}{" "}
            <Link href="/eloadok" className="font-semibold text-accent">
              Fedezz fel előadókat →
            </Link>
          </div>
        )}

        <div className="border-t border-line pt-8">
          <FollowManager />
        </div>
      </div>
    </PageFrame>
  );
}
