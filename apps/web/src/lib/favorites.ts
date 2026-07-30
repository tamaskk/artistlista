"use client";

/** Kedvencek — MVP: localStorage (v1-ben fiókhoz kötve). */
const KEY = "artistlist:favorites";

export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleFavorite(slug: string): boolean {
  const favs = new Set(getFavorites());
  const added = !favs.has(slug);
  if (added) favs.add(slug);
  else favs.delete(slug);
  localStorage.setItem(KEY, JSON.stringify([...favs]));
  window.dispatchEvent(new CustomEvent("favorites-changed"));
  // szerver-oldali aggregát számláló (tűzd-és-felejtsd)
  fetch("/api/like", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, liked: added }),
    keepalive: true,
  }).catch(() => {});
  return added;
}

export function isFavorite(slug: string): boolean {
  return getFavorites().includes(slug);
}
