"use client";

import { toast } from "./Toaster";

export function CalendarButton({ href, className = "" }: { href: string; className?: string }) {
  return (
    <a href={href} onClick={() => toast("Naptárba mentve — nyisd meg a letöltött fájlt 📅")} className={className}>
      Naptárba
    </a>
  );
}
