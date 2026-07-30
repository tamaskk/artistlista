import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
