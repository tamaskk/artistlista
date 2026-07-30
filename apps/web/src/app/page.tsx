import { Suspense } from "react";
import { PageFrame } from "@/components/PageFrame";
import { HeroSearch } from "@/components/hero/HeroSearch";
import {
  CityGrid,
  CtaBand,
  FeaturedArtists,
  GenreGrid,
  MostLiked,
  NewArtists,
  PopularVenues,
  QuickLists,
  TrendingEvents,
} from "@/components/sections/HomeSections";
import { SubmitCta } from "@/components/sections/SubmitCta";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <PageFrame active="/">
      <Suspense>
        <HeroSearch />
      </Suspense>
      <FeaturedArtists />
      <SubmitCta />
      <QuickLists />
      <GenreGrid />
      <CityGrid />
      <TrendingEvents />
      <MostLiked />
      <PopularVenues />
      <NewArtists />
      <CtaBand />
    </PageFrame>
  );
}
