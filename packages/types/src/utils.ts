/** Ékezet-mentes slug (á→a, ő→o, ű→u …), kisbetűs, kötőjeles. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const HU_TZ = "Europe/Budapest";

/** `júl. 26. szo 22:00` — magyar, budapesti idő szerint. */
export function formatEventDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const day = new Intl.DateTimeFormat("hu-HU", {
    timeZone: HU_TZ,
    month: "short",
    day: "numeric",
  }).format(date);
  const weekday = new Intl.DateTimeFormat("hu-HU", {
    timeZone: HU_TZ,
    weekday: "short",
  }).format(date);
  const time = new Intl.DateTimeFormat("hu-HU", {
    timeZone: HU_TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return `${day} ${weekday} ${time}`;
}

/** `JÚL 26` — kártya dátum-badge. */
export function formatDateBadge(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const month = new Intl.DateTimeFormat("hu-HU", { timeZone: HU_TZ, month: "short" })
    .format(date)
    .replace(".", "")
    .toUpperCase();
  const day = new Intl.DateTimeFormat("hu-HU", { timeZone: HU_TZ, day: "numeric" }).format(date);
  return `${month} ${day}`;
}

/** `21:00` budapesti idő szerint. */
export function formatTime(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("hu-HU", {
    timeZone: HU_TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** `2026. július 26., szombat 22:00` — részletoldalra. */
export function formatEventDateLong(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const main = new Intl.DateTimeFormat("hu-HU", {
    timeZone: HU_TZ,
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
  return `${main} ${formatTime(date)}`;
}

/** `6 900 Ft` — HUF formázás. */
export function formatHuf(amount: number): string {
  return `${new Intl.NumberFormat("hu-HU").format(amount)} Ft`;
}

export function formatPrice(price: {
  kind: "free" | "paid" | "unknown";
  min?: number | null;
  max?: number | null;
}): string {
  if (price.kind === "free") return "Ingyenes";
  if (price.kind === "unknown" || price.min == null) return "";
  return formatHuf(price.min);
}
