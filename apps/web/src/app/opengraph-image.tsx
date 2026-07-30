import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Koncertlista — Ki hol lép fel?";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "#e9ebfb",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800, color: "#0b0b0f" }}>Koncertlista</div>
        <div style={{ fontSize: 40, color: "#4b4d5c" }}>Ki hol lép fel? — koncertek térképen</div>
        <div
          style={{
            marginTop: 8,
            fontSize: 24,
            fontWeight: 700,
            color: "#fff",
            background: "#4f46e5",
            padding: "12px 28px",
            borderRadius: 999,
          }}
        >
          koncertlista.hu
        </div>
      </div>
    ),
    size,
  );
}
