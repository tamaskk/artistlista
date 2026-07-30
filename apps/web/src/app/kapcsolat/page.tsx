import type { Metadata } from "next";
import { PageFrame } from "@/components/PageFrame";

export const metadata: Metadata = { title: "Kapcsolat" };

export default function Page() {
  return (
    <PageFrame>
      <div className="mt-8 max-w-2xl">
        <h1 className="font-display text-[32px] font-bold tracking-tight">Kapcsolat</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">Írj nekünk: hello@artistlist.hu</p>
      </div>
    </PageFrame>
  );
}
