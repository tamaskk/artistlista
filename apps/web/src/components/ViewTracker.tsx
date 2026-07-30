"use client";

import { useEffect } from "react";

/** Egyszer/böngésző-session számol egy megtekintést az eseményhez. */
export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `viewed:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch(`/api/events/${slug}/view`, { method: "POST", keepalive: true }).catch(() => {});
  }, [slug]);
  return null;
}
