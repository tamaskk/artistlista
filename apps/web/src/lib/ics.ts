/** iCalendar (RFC 5545) építő — per-event és feed (kedvencek) kimenethez. */

export function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function esc(s: string): string {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export type IcsEvent = {
  id: string;
  slug: string;
  title: string;
  startsAt: Date | string;
  endsAt?: Date | string | null;
  location: string;
  url?: string | null;
  description?: string | null;
};

/** Egy VEVENT blokk sorai (a VCALENDAR-ba ágyazva). */
export function veventLines(ev: IcsEvent): string[] {
  const start = new Date(ev.startsAt);
  const end = ev.endsAt ? new Date(ev.endsAt) : new Date(start.getTime() + 3 * 60 * 60 * 1000);
  return [
    "BEGIN:VEVENT",
    `UID:${ev.id}@koncertlista.hu`,
    `DTSTAMP:${icsDate(start)}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${esc(ev.title)}`,
    `LOCATION:${esc(ev.location)}`,
    ev.url ? `URL:${ev.url}` : null,
    ev.description ? `DESCRIPTION:${esc(ev.description)}` : null,
    "END:VEVENT",
  ].filter(Boolean) as string[];
}

/** Teljes VCALENDAR — több eseménnyel (feed) vagy eggyel. */
export function buildCalendar(events: IcsEvent[], calName = "Koncertlista"): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Koncertlista//HU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(calName)}`,
    "X-WR-TIMEZONE:Europe/Budapest",
    ...events.flatMap(veventLines),
    "END:VCALENDAR",
  ].join("\r\n");
}
