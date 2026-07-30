"use client";

import { useState } from "react";

/** Megosztás — natív Web Share, fallback: link vágólapra. */
export function ShareButton({
  title,
  path,
  className = "",
  label = "Megosztás",
}: {
  title: string;
  path: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = (typeof window !== "undefined" ? window.location.origin : "") + path;
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    if (nav?.share) {
      try {
        await nav.share({ title, url });
      } catch {
        /* megszakítva */
      }
      return;
    }
    try {
      await nav?.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      aria-label="Megosztás"
      className={`flex items-center gap-1.5 rounded-full border-[1.5px] border-line-strong px-4 py-2 text-[13px] font-semibold transition hover:bg-chip ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
      </svg>
      {copied ? "Link másolva ✓" : label}
    </button>
  );
}
