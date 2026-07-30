"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EventCard } from "@/components/EventCard";
import { useFavorites } from "@/components/favorites/FavoritesProvider";
import type { PublicEventCard } from "@/lib/public-types";

export function FavoritesList() {
  const { favSlugs, ready, loggedIn } = useFavorites();
  const [events, setEvents] = useState<PublicEventCard[] | null>(null);
  const key = [...favSlugs].sort().join(",");

  useEffect(() => {
    if (!ready) return;
    if (!favSlugs.length) {
      setEvents([]);
      return;
    }
    fetch(`/api/events?slugs=${encodeURIComponent(favSlugs.join(","))}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => setEvents([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready]);

  if (!ready || events === null) {
    return <div className="mt-8 h-40 animate-pulse rounded-card bg-chip" />;
  }
  if (events.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line-strong px-6 py-12 text-center text-sm text-muted">
        <span>Még nincs mentett eseményed — kattints a csillagra bármelyik kártyán!</span>
        {!loggedIn && (
          <Link href="/belepes" className="font-semibold text-accent hover:text-accent-deep">
            Jelentkezz be, hogy eszközök közt szinkronizáljuk →
          </Link>
        )}
      </div>
    );
  }
  return (
    <>
      {!loggedIn && (
        <div className="mt-6 rounded-xl bg-chip px-4 py-2.5 text-[13px] text-ink-soft">
          A kedvenceid csak ezen az eszközön vannak.{" "}
          <Link href="/belepes" className="font-semibold text-accent hover:text-accent-deep">
            Jelentkezz be
          </Link>{" "}
          a szinkronhoz és a koncert-emlékeztetőkhöz.
        </div>
      )}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </>
  );
}
