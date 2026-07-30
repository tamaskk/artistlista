import { ImageResponse } from "next/og";
import { getArtistBySlug } from "@/lib/data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Előadó — Koncertlista";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getArtistBySlug(slug);
  const name = data?.artist.name ?? "Előadó";
  const genres = (data?.artist.genres ?? []).slice(0, 3).join(" · ");
  const sub = data?.artist.shortBio || genres || "koncertlista.hu";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#e9ebfb",
          padding: 56,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#fff",
            borderRadius: 40,
            padding: 64,
            boxShadow: "0 24px 80px rgba(31,35,80,0.14)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#0b0b0f" }}>Koncertlista</div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#4f46e5",
                background: "#4f46e51a",
                padding: "4px 12px",
                borderRadius: 999,
              }}
            >
              ELŐADÓ
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontSize: 74, fontWeight: 800, color: "#0b0b0f", lineHeight: 1.03 }}>
              {name.slice(0, 60)}
            </div>
            <div style={{ fontSize: 32, color: "#4b4d5c" }}>{String(sub).slice(0, 120)}</div>
          </div>
          <div style={{ fontSize: 24, color: "#9a9db4" }}>koncertlista.hu</div>
        </div>
      </div>
    ),
    size,
  );
}
