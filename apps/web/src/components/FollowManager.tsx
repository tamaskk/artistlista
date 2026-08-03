"use client";

import Link from "next/link";
import { GENRES } from "@artistlist/types";
import { useFavorites } from "@/components/favorites/FavoritesProvider";

/** Követés-kezelő: műfaj-választó + követett városok (levehető). */
export function FollowManager() {
  const { ready, followedCities, isFollowingTag, toggleTagFollow } = useFavorites();

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-[15px] font-semibold">Kövess műfajokat</h2>
        <p className="mt-1 text-[13px] text-muted">
          Értesítünk, ha új koncert kerül fel a követett műfajaidban.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {GENRES.map((g) => {
            const on = isFollowingTag("genre", g.slug);
            return (
              <button
                key={g.slug}
                disabled={!ready}
                onClick={() => toggleTagFollow("genre", g.slug)}
                aria-pressed={on}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition ${
                  on ? "border-transparent bg-ink text-white" : "border-line bg-surface hover:bg-chip"
                } disabled:opacity-50`}
              >
                {on ? "✓ " : ""}
                {g.name}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-[15px] font-semibold">Követett városok</h2>
        {followedCities.length === 0 ? (
          <p className="mt-1 text-[13px] text-muted">
            Még egy várost sem követsz. Nyiss meg egy{" "}
            <Link href="/varosok" className="font-semibold text-accent">
              város-oldalt
            </Link>{" "}
            és kövesd.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {followedCities.map((c) => (
              <button
                key={c}
                onClick={() => toggleTagFollow("city", c)}
                className="rounded-full border border-transparent bg-ink px-3.5 py-1.5 text-[13px] font-medium text-white"
                title="Követés levétele"
              >
                ✓ {c} ✕
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
