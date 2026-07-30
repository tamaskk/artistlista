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
          limiter: Ratelimit.slidingWindow(15, "60 s"),
          prefix: "rl-admin",
        })
      : null;
  return cached;
}

/** true = engedélyezett. Upstash-config nélkül mindig true. */
export async function allow(routeKey: string, id: string): Promise<boolean> {
  const l = limiter();
  if (!l) return true;
  try {
    const { success } = await l.limit(`${routeKey}:${id}`);
    return success;
  } catch {
    return true;
  }
}
