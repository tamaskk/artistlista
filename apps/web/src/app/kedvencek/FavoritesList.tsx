"use client";

import { useEffect, useState } from "react";
import { EventCard } from "@/components/EventCard";
import { getFavorites } from "@/lib/favorites";
import type { PublicEventCard } from "@/lib/public-types";

export function FavoritesList() {
  const [events, setEvents] = useState<PublicEventCard[] | null>(null);

  const load = () => {
    const slugs = getFavorites();
    if (!slugs.length) {
      setEvents([]);
      return;
    }
    fetch(`/api/events?slugs=${encodeURIComponent(slugs.join(","))}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => setEvents([]));
  };

  useEffect(() => {
    load();
    window.addEventListener("favorites-changed", load);
    return () => window.removeEventListener("favorites-changed", load);
  }, []);

  if (events === null) {
    return <div className="mt-8 h-40 animate-pulse rounded-card bg-chip" />;
  }
  if (events.length === 0) {
    return (
      <div className="mt-8 flex h-40 items-center justify-center rounded-card border border-dashed border-line-strong text-sm text-muted">
        Még nincs mentett eseményed — kattints a csillagra bármelyik kártyán!
      </div>
    );
  }
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {events.map((e) => (
        <EventCard key={e.id} event={e} />
      ))}
    </div>
  );
}
