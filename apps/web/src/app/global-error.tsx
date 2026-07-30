"use client";

import { useEffect } from "react";

/** A gyökér-layout hibáit is elkapja (html/body-t maga rendereli). */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[web global-error]", error?.digest, error?.message, error?.stack);
  }, [error]);

  return (
    <html lang="hu">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e9ebfb",
          fontFamily: "system-ui, sans-serif",
          margin: 0,
        }}
      >
        <div
          style={{
            maxWidth: 420,
            background: "#fff",
            borderRadius: 28,
            padding: 32,
            textAlign: "center",
            boxShadow: "0 24px 80px rgba(31,35,80,0.14)",
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Váratlan hiba</h1>
          <p style={{ color: "#71748a", marginTop: 8 }}>Kérlek, próbáld újra.</p>
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              background: "#0b0b0f",
              color: "#fff",
              border: 0,
              borderRadius: 999,
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Újrapróbálom
          </button>
        </div>
      </body>
    </html>
  );
}
