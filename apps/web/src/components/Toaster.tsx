"use client";

import { useEffect, useState } from "react";

/** Bárhonnan hívható: toast("Üzenet"). */
export function toast(text: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("toast", { detail: text }));
  }
}

export function Toaster() {
  const [msgs, setMsgs] = useState<{ id: number; text: string }[]>([]);

  useEffect(() => {
    let counter = 0;
    const on = (e: Event) => {
      const text = (e as CustomEvent).detail as string;
      const id = ++counter;
      setMsgs((m) => [...m, { id, text }]);
      setTimeout(() => setMsgs((m) => m.filter((x) => x.id !== id)), 2200);
    };
    window.addEventListener("toast", on);
    return () => window.removeEventListener("toast", on);
  }, []);

  if (!msgs.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {msgs.map((m) => (
        <div
          key={m.id}
          className="animate-toast rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-pop"
        >
          {m.text}
        </div>
      ))}
    </div>
  );
}
