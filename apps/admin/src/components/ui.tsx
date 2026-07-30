import type { ArtistStatus, EventStatus } from "@artistlist/types";
import { ARTIST_STATUS_LABELS, EVENT_STATUS_LABELS } from "@artistlist/types";

// Közös primitívek a megosztott csomagból (a meglévő importok változatlanul mennek).
export { Card, Field, GhostButton, InitialsAvatar, PrimaryButton, inputCls } from "@artistlist/ui";

// ── admin-specifikus, domain-hez kötött badge-ek ────────────────────
const EVENT_BADGE_STYLES: Record<EventStatus, string> = {
  published: "text-ok bg-ok/10",
  pending: "text-accent bg-accent/10",
  draft: "text-warn bg-warn/10",
  cancelled: "text-bad bg-bad/10",
  soldout: "text-warn bg-warn/10",
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${EVENT_BADGE_STYLES[status]}`}
    >
      {EVENT_STATUS_LABELS[status]}
    </span>
  );
}

const ARTIST_BADGE_STYLES: Record<ArtistStatus, string> = {
  published: "text-ok bg-ok/10",
  pending: "text-warn bg-warn/10",
  draft: "text-ink-soft bg-chip",
  archived: "text-bad bg-bad/10",
};

export function ArtistStatusBadge({ status }: { status: ArtistStatus }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${ARTIST_BADGE_STYLES[status]}`}
    >
      {ARTIST_STATUS_LABELS[status]}
    </span>
  );
}
