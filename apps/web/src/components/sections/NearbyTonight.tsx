"use client";

import { useState } from "react";
import { EventCard } from "@/components/EventCard";
import { EventCardSkeletonGrid } from "@/components/Skeleton";
import type { PublicEventCard } from "@/lib/public-types";

type State = "idle" | "loading" | "denied" | "done";

export function NearbyTonight() {
  const [state, setState] = useState<State>("idle");
  const [events, setEvents] = useState<PublicEventCard[]>([]);

  const find = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState("denied");
      return;
    }
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { longitude: lng, latitude: lat } = pos.coords;
        const d = 0.45; // ~40-45 km
        const bbox = [lng - d, lat - d, lng + d, lat + d].join(",");
        const from = new Date().toISOString();
        const to = new Date();
        to.setDate(to.getDate() + 2);
        to.setHours(0, 0, 0, 0); // ma + holnap
        try {
          const r = await fetch(
            `/api/events?bbox=${bbox}&from=${from}&to=${to.toISOString()}&limit=8&sort=date`,
          );
          const j = await r.json();
          setEvents(j.events ?? []);
        } catch {
          setEvents([]);
        }
        setState("done");
      },
      () => setState("denied"),
      { timeout: 8000, maximumAge: 300000 },
    );
  };

  return (
    <section className="my-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[26px] font-bold tracking-tight">
            Ma este a közeledben 📍
          </h2>
          <p className="mt-1 text-[14px] text-muted">
            Engedélyezd a helymeghatározást — megmutatjuk a mai és holnapi koncerteket a környékeden.
          </p>
        </div>
        {state !== "loading" && (
          <button
            onClick={find}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-hover"
          >
            {state === "done" ? "Frissítés" : "Mutasd a közelieket"}
          </button>
        )}
      </div>

      {state === "loading" && (
        <div className="mt-6">
          <EventCardSkeletonGrid count={4} />
        </div>
      )}

      {state === "denied" && (
        <div className="mt-6 rounded-card border border-dashed border-line-strong px-6 py-8 text-center text-sm text-muted">
          Nem sikerült a helymeghatározás. Engedélyezd a böngészőben, vagy használd a városkeresőt fent.
        </div>
      )}

      {state === "done" &&
        (events.length === 0 ? (
          <div className="mt-6 rounded-card border border-dashed border-line-strong px-6 py-8 text-center text-sm text-muted">
            A közeledben nincs koncert ma vagy holnap — nézd a térképet vagy tágíts a szűrőkön!
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ))}
    </section>
  );
}
