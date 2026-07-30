"use client";

import { useFavorites } from "./favorites/FavoritesProvider";

/** Előadó-követés gomb. Vendégnél belépésre irányít; belépve fiókba menti. */
export function FollowButton({
  artistId,
  className = "",
}: {
  artistId: string;
  className?: string;
}) {
  const { isFollowing, toggleFollow, ready } = useFavorites();
  const on = isFollowing(artistId);

  return (
    <button
      onClick={() => toggleFollow(artistId)}
      disabled={!ready}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
        on
          ? "bg-accent text-white hover:bg-accent-deep"
          : "border-[1.5px] border-ink bg-ink text-white hover:bg-[#26262e]"
      } ${className}`}
    >
      {on ? "✓ Követed" : "+ Követés"}
    </button>
  );
}
