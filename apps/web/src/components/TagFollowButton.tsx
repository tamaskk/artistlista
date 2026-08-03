"use client";

import { useFavorites } from "@/components/favorites/FavoritesProvider";
import { toast } from "@/components/Toaster";

/** „Kövesd" toggle városra vagy műfajra (belépés-hez kötött; vendégnél /belepes). */
export function TagFollowButton({
  kind,
  value,
  label,
  size = "md",
}: {
  kind: "city" | "genre";
  value: string;
  label?: string;
  size?: "sm" | "md";
}) {
  const { ready, isFollowingTag, toggleTagFollow, loggedIn } = useFavorites();
  const on = isFollowingTag(kind, value);
  const text = label ?? value;

  const pad = size === "sm" ? "px-3 py-1 text-[12px]" : "px-4 py-2 text-[13px]";

  return (
    <button
      disabled={!ready}
      onClick={() => {
        const willFollow = !on;
        toggleTagFollow(kind, value);
        if (loggedIn) toast(willFollow ? `Követed: ${text}` : `Követés levéve: ${text}`);
      }}
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition ${pad} ${
        on
          ? "border-transparent bg-ink text-white"
          : "border-line bg-surface hover:bg-chip"
      } disabled:opacity-50`}
      aria-pressed={on}
    >
      {on ? "✓ Követve" : `+ Követés`}
    </button>
  );
}
