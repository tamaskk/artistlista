import type { Metadata } from "next";
import { Suspense } from "react";
import { PageFrame } from "@/components/PageFrame";
import { HeroSearch } from "@/components/hero/HeroSearch";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Események",
  description: "Koncertek és bulik térképen és listában — szűrj városra, dátumra, műfajra, árra.",
};

export default function EventsPage() {
  return (
    <PageFrame active="/esemenyek">
      <Suspense>
        <HeroSearch fullHeight />
      </Suspense>
    </PageFrame>
  );
}
