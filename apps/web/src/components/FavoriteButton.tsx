"use client";

import { useState } from "react";
import { useFavorites } from "./favorites/FavoritesProvider";
import { toast } from "./Toaster";

export function FavoriteButton({ slug, className = "" }: { slug: string; className?: string }) {
  const { isFav, toggleFav } = useFavorites();
  const saved = isFav(slug);
  const [pop, setPop] = useState(false);

  return (
    <button
      aria-label={saved ? "Eltávolítás a kedvencekből" : "Mentés a kedvencekbe"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const willSave = !saved;
        toggleFav(slug);
        if (willSave) {
          setPop(true);
          setTimeout(() => setPop(false), 420);
        }
        toast(willSave ? "Mentve a kedvencekbe ★" : "Eltávolítva a kedvencekből");
      }}
      className={`flex h-[30px] w-[30px] items-center justify-center rounded-full bg-chip transition hover:bg-canvas ${className}`}
    >
      <svg
        className={pop ? "animate-heart" : ""}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={saved ? "#4F46E5" : "none"}
        stroke={saved ? "#4F46E5" : "#0B0B0F"}
        strokeWidth="2"
      >
        <path d="M12 3l2.7 5.6 6.3.9-4.5 4.4 1 6.1L12 17l-5.5 3 1-6.1L3 9.5l6.3-.9L12 3z" />
      </svg>
    </button>
  );
}
