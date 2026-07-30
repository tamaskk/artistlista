"use client";

import Link from "next/link";
import { formatDateBadge, formatPrice, formatTime } from "@artistlist/types";
import type { PublicEventCard } from "@/lib/public-types";
import { FavoriteButton } from "./FavoriteButton";
import { Thumb } from "./Thumb";

export function EventCard({
  event,
  onHover,
  highlighted = false,
}: {
  event: PublicEventCard;
  onHover?: (id: string | null) => void;
  highlighted?: boolean;
}) {
  const cancelled = event.status === "cancelled";
  const soldout = event.status === "soldout";
  const promoted = (event.promoTier ?? 0) > 0;
  const price = formatPrice(event.price);

  return (
    <Link
      href={`/esemenyek/${event.slug}`}
      onMouseEnter={() => onHover?.(event.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group block overflow-hidden rounded-card border bg-surface shadow-card transition hover:-translate-y-[3px] hover:shadow-card-hover ${
        promoted
          ? "border-[#E7B008] ring-2 ring-[#F5C518]/40"
          : highlighted
            ? "border-accent ring-2 ring-accent/20"
            : "border-line"
      }`}
    >
      <div className="relative h-[118px]">
        <Thumb
          src={event.image}
          alt={event.title}
          label={`koncertfotó — ${event.venueName}`}
          className="h-full w-full"
        />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-bold tracking-wide text-white">
          {formatDateBadge(event.startsAt)}
        </span>
        <div className="absolute right-2.5 top-2.5 flex flex-col items-end gap-1">
          {promoted && (
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#F5C518] to-[#E7B008] px-2.5 py-1 text-[11px] font-bold text-[#0b0b0f] shadow-sm">
              ★ Kiemelt
            </span>
          )}
          {soldout && (
            <span className="rounded-full bg-[#FDF0DC] px-3 py-1 text-[11px] font-bold text-warn">
              Telt ház
            </span>
          )}
        </div>
        {cancelled && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="rounded-full bg-bad px-4 py-1.5 text-xs font-bold text-white">
              Elmarad
            </span>
          </span>
        )}
      </div>
      <div className="relative p-3.5">
        {event.price.kind === "free" ? (
          <span className="inline-block rounded-full bg-ok/10 px-2.5 py-0.5 text-xs font-bold text-ok">
            Ingyenes
          </span>
        ) : event.price.kind === "paid" ? (
          <div className="text-[15px] font-bold">
            {price} <span className="text-xs font-normal text-faint">/ jegytől</span>
          </div>
        ) : (
          <div className="text-[13px] font-semibold text-faint">Ár később</div>
        )}
        <div className={`mt-1 text-[14.5px] font-semibold ${cancelled ? "line-through" : ""}`}>
          {event.artistNames[0] ?? event.title}
        </div>
        <div className="mt-0.5 text-[12.5px] text-muted">
          {event.venueName} · {event.city}
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <ClockIcon /> {formatTime(event.startsAt)}
          </span>
          {event.genres[0] && (
            <span className="flex items-center gap-1">
              <NoteIcon /> {event.genres[0]}
            </span>
          )}
        </div>
        <FavoriteButton slug={event.slug} className="absolute bottom-2.5 right-2.5" />
      </div>
    </Link>
  );
}

function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
