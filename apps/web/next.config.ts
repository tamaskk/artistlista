import path from "node:path";
import type { NextConfig } from "next";

const baseHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

// alap: minden útvonal SAMEORIGIN keretezéssel
const securityHeaders = [...baseHeaders, { key: "X-Frame-Options", value: "SAMEORIGIN" }];

// beágyazható widget: bárhonnan iframe-elhető (X-Frame-Options nélkül, CSP frame-ancestors *)
const embedHeaders = [
  ...baseHeaders,
  { key: "Content-Security-Policy", value: "frame-ancestors *" },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@artistlist/database", "@artistlist/types", "@artistlist/ui"],
  serverExternalPackages: ["mongoose"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  async headers() {
    return [
      // minden, ami NEM /embed → SAMEORIGIN
      { source: "/((?!embed).*)", headers: securityHeaders },
      // /embed/* → bárhonnan keretezhető
      { source: "/embed/:path*", headers: embedHeaders },
    ];
  },
};

export default nextConfig;
