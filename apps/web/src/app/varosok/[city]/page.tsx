import type { Metadata } from "next";
import Link from "next/link";
import { PageFrame } from "@/components/PageFrame";
import { EventCard } from "@/components/EventCard";
import { TagFollowButton } from "@/components/TagFollowButton";
import { getCityEvents } from "@/lib/data";

export const revalidate = 60;

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function generateMetadata(props: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await props.params;
  const name = cap(decodeURIComponent(city));
  return {
    title: `Koncertek és bulik — ${name}`,
    description: `Minden közelgő koncert és buli ${name} városában, egy helyen az ArtistListen.`,
  };
}

export default async function CityPage(props: { params: Promise<{ city: string }> }) {
  const { city } = await props.params;
  const name = cap(decodeURIComponent(city));
  const events = await getCityEvents(name);

  return (
    <PageFrame>
      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-[32px] font-bold tracking-tight">
            Koncertek — {name}
          </h1>
          <TagFollowButton kind="city" value={name} label={name} />
        </div>
        <p className="mt-2 text-[15px] text-muted">
          {events.length} közelgő esemény.{" "}
          <Link href={`/esemenyek?varos=${name}`} className="font-semibold text-accent">
            Szűrés a keresőben →
          </Link>
        </p>
        {events.length === 0 ? (
          <div className="mt-8 flex h-40 items-center justify-center rounded-card border border-dashed border-line-strong text-sm text-muted">
            Jelenleg nincs meghirdetett esemény ebben a városban.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>
    </PageFrame>
  );
}
