"use client";

import Link from "next/link";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Főoldal" },
  { href: "/esemenyek", label: "Események" },
  { href: "/eloadok", label: "Előadók" },
  { href: "/helyszinek", label: "Helyszínek" },
  { href: "/neked", label: "Neked" },
  { href: "/kedvencek", label: "Kedvencek" },
  { href: "/koncert-bekuldese", label: "Koncert beküldése" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menü"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-ink-soft transition hover:bg-chip"
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-4 right-4 top-full z-40 mt-3 flex flex-col gap-0.5 rounded-2xl border border-line bg-surface p-2 shadow-pop">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-chip hover:text-fg"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
