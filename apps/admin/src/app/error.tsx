"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin error]", error?.digest, error?.message, error?.stack);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-md rounded-[24px] bg-white p-8 text-center shadow-frame">
        <h1 className="text-2xl font-bold">Hiba történt</h1>
        <p className="mt-2 text-sm text-muted">Átmeneti hiba az admin felületen.</p>
        {error?.digest && <p className="mt-2 text-[11px] text-faint">Azonosító: {error.digest}</p>}
        <button
          onClick={reset}
          className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-hover"
        >
          Újrapróbálom
        </button>
      </div>
    </div>
  );
}
