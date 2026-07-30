import type { Metadata } from "next";
import { PageFrame } from "@/components/PageFrame";
import { FavoritesList } from "./FavoritesList";

export const metadata: Metadata = { title: "Kedvencek" };

export default function FavoritesPage() {
  return (
    <PageFrame active="/kedvencek">
      <div className="mt-8">
        <h1 className="font-display text-[32px] font-bold tracking-tight">Kedvencek</h1>
        <p className="mt-2 text-[15px] text-muted">
          A mentett események ezen az eszközön tárolódnak.
        </p>
        <FavoritesList />
      </div>
    </PageFrame>
  );
}
