"use client";

import { useEffect, useState } from "react";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

export function FavoriteButton({ slug, className = "" }: { slug: string; className?: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isFavorite(slug));
    const onChange = () => setSaved(isFavorite(slug));
    window.addEventListener("favorites-changed", onChange);
    return () => window.removeEventListener("favorites-changed", onChange);
  }, [slug]);

  return (
    <button
      aria-label={saved ? "Eltávolítás a kedvencekből" : "Mentés a kedvencekbe"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved(toggleFavorite(slug));
      }}
      className={`flex h-[30px] w-[30px] items-center justify-center rounded-full bg-chip transition hover:bg-canvas ${className}`}
    >
      <svg
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
