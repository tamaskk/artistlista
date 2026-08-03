"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Vercel runtime logokban látszik (+ Sentry, ha később bekötöd)
    console.error("[web error]", error?.digest, error?.message, error?.stack);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-md rounded-[28px] bg-surface p-8 text-center shadow-frame">
        <h1 className="font-display text-2xl font-bold tracking-tight">Hopp, valami elromlott</h1>
        <p className="mt-2 text-[14px] text-muted">
          Átmeneti hiba történt. Próbáld újra, vagy térj vissza a főoldalra.
        </p>
        {error?.digest && (
          <p className="mt-2 text-[11px] text-faint">Hibaazonosító: {error.digest}</p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-hover"
          >
            Újrapróbálom
          </button>
          <Link
            href="/"
            className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold hover:bg-chip"
          >
            Főoldal
          </Link>
        </div>
      </div>
    </div>
  );
}
