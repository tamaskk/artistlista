import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let cached: Ratelimit | null | undefined;

function limiter(): Ratelimit | null {
  if (cached !== undefined) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  cached =
    url && token
      ? new Ratelimit({
          redis: new Redis({ url, token }),
          limiter: Ratelimit.slidingWindow(10, "60 s"),
          prefix: "rl",
        })
      : null;
  return cached;
}

/** true = engedélyezett. Upstash-config nélkül mindig true (dev/nem konfigurált). */
export async function allow(routeKey: string, id: string): Promise<boolean> {
  const l = limiter();
  if (!l) return true;
  try {
    const { success } = await l.limit(`${routeKey}:${id}`);
    return success;
  } catch {
    return true; // ha a rate-limiter elérhetetlen, ne blokkoljunk
  }
}

/** Kliens-IP kinyerése a kérés fejlécéből. */
export function ipFrom(h: Headers): string {
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "anon").trim();
}
