import { slugify } from "@artistlist/types";

/**
 * Ingyenes Unsplash-képek a városkártyákhoz (kulcs nélküli direkt CDN-URL,
 * hotlinkelhető, Unsplash-licenc). Ismert városnak dedikált kép; a többinek
 * a névből determinisztikusan választunk a poolból (mindig ugyanaz a kép).
 */
const CDN = "https://images.unsplash.com/photo-";
const PARAMS = "?w=800&q=80&auto=format&fit=crop";

const POOL = [
  "1551867633-194f125bddfa", // város, este
  "1565426873118-a17ed65d74b9",
  "1519677100203-a0e668c92439", // koncert-tömeg
  "1493225457124-a3eb161ffa5f",
  "1508973379184-7517410fb0bc",
  "1470229722913-7c0e2dbbafd3",
  "1459749411175-04bf5292ceea",
  "1516450360452-9312f5e86fc7",
  "1533174072545-7a4b6ad7a6c3",
  "1524368535928-5b5e00ddc76b",
  "1514525253161-7a46d19cd819",
];

const BY_CITY: Record<string, string> = {
  budapest: "1541849546-216549ae216d", // Budapest, Parlament
};

function pick(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return POOL[h % POOL.length];
}

/** Város neve → Unsplash kép URL. */
export function cityImage(city: string): string {
  const key = slugify(city);
  const id = BY_CITY[key] ?? pick(key);
  return `${CDN}${id}${PARAMS}`;
}
