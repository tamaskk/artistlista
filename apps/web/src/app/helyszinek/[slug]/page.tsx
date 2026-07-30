import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VENUE_TYPES } from "@artistlist/types";
import { PageFrame } from "@/components/PageFrame";
import { EventCard } from "@/components/EventCard";
import { ShareButton } from "@/components/ShareButton";
import { Thumb } from "@/components/Thumb";
import { getVenueBySlug } from "@/lib/data";

export const revalidate = 60;

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const data = await getVenueBySlug(slug);
  if (!data) return { title: "Helyszín nem található" };
  return {
    title: data.venue.name,
    description: `Közelgő koncertek és bulik: ${data.venue.name}, ${data.venue.address.city}`,
  };
}

export default async function VenuePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const data = await getVenueBySlug(slug);
  if (!data) notFound();
  const { venue, upcoming } = data;
  const typeLabel = VENUE_TYPES.find((t) => t.value === venue.type)?.label ?? venue.type;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicVenue",
    name: venue.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: venue.address.street,
      addressLocality: venue.address.city,
      addressCountry: venue.address.country,
    },
  };

  return (
    <PageFrame active="/helyszinek">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mt-8">
        <div className="h-[220px] overflow-hidden rounded-3xl">
          <Thumb
            src={venue.images?.[0]}
            alt={venue.name}
            label={`helyszínfotó — ${venue.name}`}
            className="h-full w-full"
          />
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-[32px] font-bold tracking-tight">{venue.name}</h1>
            <span className="rounded-full bg-chip px-3.5 py-1.5 text-xs font-semibold text-ink-soft">
              {typeLabel}
            </span>
            {venue.capacity && (
              <span className="rounded-full border border-line px-3.5 py-1.5 text-xs text-muted">
                {new Intl.NumberFormat("hu-HU").format(venue.capacity)} fő
              </span>
            )}
          </div>
          <ShareButton title={venue.name} path={`/helyszinek/${venue.slug}`} />
        </div>
        <div className="mt-2 text-[15px] text-muted">
          {venue.address.zip} {venue.address.city}, {venue.address.street}
          {" · "}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${venue.location.coordinates[1]},${venue.location.coordinates[0]}`}
            target="_blank"
            rel="noopener"
            className="font-semibold text-accent hover:text-accent-deep"
          >
            Útvonaltervezés →
          </a>
          {venue.website && (
            <>
              {" · "}
              <a
                href={venue.website}
                target="_blank"
                rel="noopener"
                className="font-semibold text-accent hover:text-accent-deep"
              >
                Weboldal ↗
              </a>
            </>
          )}
        </div>

        {/* mini-térkép (ingyenes OSM-embed, kulcs nélkül) */}
        <iframe
          title={`Térkép — ${venue.name}`}
          loading="lazy"
          className="mt-5 h-[240px] w-full rounded-2xl border border-line"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${
            venue.location.coordinates[0] - 0.012
          }%2C${venue.location.coordinates[1] - 0.008}%2C${
            venue.location.coordinates[0] + 0.012
          }%2C${venue.location.coordinates[1] + 0.008}&layer=mapnik&marker=${
            venue.location.coordinates[1]
          }%2C${venue.location.coordinates[0]}`}
        />
      </div>

      <section className="mt-12">
        <h2 className="mb-5 font-display text-[26px] font-bold tracking-tight">
          Közelgő események
        </h2>
        {upcoming.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-card border border-dashed border-line-strong text-sm text-muted">
            Jelenleg nincs meghirdetett esemény.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </section>
    </PageFrame>
  );
}
