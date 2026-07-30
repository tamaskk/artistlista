import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatEventDateLong,
  formatHuf,
  formatTime,
} from "@artistlist/types";
import { PageFrame } from "@/components/PageFrame";
import { CalendarButton } from "@/components/CalendarButton";
import { EventCard } from "@/components/EventCard";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButton } from "@/components/ShareButton";
import { Thumb } from "@/components/Thumb";
import { getEventBySlug, getUpcomingEvents } from "@/lib/data";

export const revalidate = 60;

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const data = await getEventBySlug(slug);
  if (!data) return { title: "Esemény nem található" };
  return {
    title: data.event.title,
    description: `${data.event.artistNames.join(", ")} · ${data.event.venueName}, ${data.event.city}`,
  };
}

export default async function EventPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const data = await getEventBySlug(slug);
  if (!data) notFound();
  const { event, lineup, venue } = data;
  const cancelled = event.status === "cancelled";
  const soldout = event.status === "soldout";
  const related = (await getUpcomingEvents(30))
    .filter(
      (e) =>
        e.slug !== event.slug &&
        (e.city === event.city || e.artistNames.some((n) => event.artistNames.includes(n))),
    )
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: event.title,
    startDate: new Date(event.startsAt).toISOString(),
    eventStatus: cancelled
      ? "https://schema.org/EventCancelled"
      : "https://schema.org/EventScheduled",
    location: venue
      ? {
          "@type": "MusicVenue",
          name: venue.name,
          address: {
            "@type": "PostalAddress",
            streetAddress: venue.address.street,
            addressLocality: venue.address.city,
            addressCountry: venue.address.country,
          },
        }
      : undefined,
    performer: lineup.map((a) => ({ "@type": "MusicGroup", name: a.name })),
    offers:
      event.price?.kind === "paid" && event.ticketUrl
        ? {
            "@type": "Offer",
            price: event.price.min,
            priceCurrency: "HUF",
            url: event.ticketUrl,
            availability: soldout ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
          }
        : undefined,
  };

  return (
    <PageFrame active="/esemenyek">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="relative h-[320px] overflow-hidden rounded-3xl">
            <Thumb
              src={event.image}
              alt={event.title}
              label={`koncertfotó — ${event.venueName}`}
              className="h-full w-full"
            />
            {cancelled && (
              <span className="absolute inset-0 flex items-center justify-center bg-white/60">
                <span className="rounded-full bg-bad px-6 py-2 text-sm font-bold text-white">
                  Elmarad
                </span>
              </span>
            )}
          </div>
          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-[32px] font-bold leading-tight tracking-tight">
                {event.title}
              </h1>
              <div className="mt-2 text-[15px] text-ink-soft">
                {formatEventDateLong(event.startsAt)}
                {event.doorsAt && (
                  <span className="text-muted"> · kapunyitás {formatTime(event.doorsAt)}</span>
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <ShareButton title={event.title} path={`/esemenyek/${event.slug}`} />
              <FavoriteButton slug={event.slug} className="h-10 w-10" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {event.genres.map((g: string) => (
              <Link
                key={g}
                href={`/esemenyek?mufaj=${g}`}
                className="rounded-full bg-chip px-3.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-canvas"
              >
                {g}
              </Link>
            ))}
          </div>

          {event.description && (
            <p className="mt-6 max-w-[640px] whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
              {event.description}
            </p>
          )}

          <div className="mt-8">
            <h2 className="mb-3 font-display text-xl font-bold">Fellépők</h2>
            <div className="flex flex-wrap gap-3">
              {lineup.map((a, i) => (
                <Link
                  key={a.id}
                  href={a.published ? `/eloadok/${a.slug}` : "#"}
                  className="flex items-center gap-3 rounded-full border border-line py-2 pl-2 pr-5 transition hover:bg-chip"
                >
                  <Thumb src={a.avatar} alt={a.name} label="" className="h-10 w-10 rounded-full" />
                  <div>
                    <div className="text-sm font-semibold">
                      {a.name}
                      {i === 0 && (
                        <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                          headliner
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted">{a.genres.join(" · ")}</div>
                  </div>
                </Link>
              ))}
              {(event.guestArtistNames ?? []).map((n: string) => (
                <span
                  key={n}
                  className="flex items-center rounded-full border border-dashed border-line-strong px-5 py-3 text-sm text-muted"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-card border border-line p-6 shadow-card">
            {event.price?.kind === "free" ? (
              <div className="text-2xl font-bold text-ok">Ingyenes</div>
            ) : event.price?.min ? (
              <div>
                <span className="text-2xl font-bold">{formatHuf(event.price.min)}</span>
                {event.price.max && event.price.max !== event.price.min && (
                  <span className="text-muted"> – {formatHuf(event.price.max)}</span>
                )}
                <span className="ml-1 text-sm text-faint">/ jegy</span>
              </div>
            ) : (
              <div className="text-lg font-semibold text-muted">Ár később</div>
            )}
            {!cancelled && !soldout && event.ticketUrl && (
              <a
                href={event.ticketUrl}
                target="_blank"
                rel="sponsored noopener"
                className="mt-4 block rounded-full bg-ink py-3.5 text-center text-[15px] font-bold text-white transition hover:bg-[#26262e]"
              >
                Jegyvásárlás ↗
              </a>
            )}
            {soldout && (
              <div className="mt-4 rounded-full bg-[#FDF0DC] py-3 text-center text-sm font-bold text-warn">
                Telt ház
              </div>
            )}
            {cancelled && (
              <div className="mt-4 rounded-2xl bg-bad/10 px-4 py-3 text-center text-sm font-bold text-bad">
                Az esemény elmarad
                {event.cancelReason && (
                  <div className="mt-1 text-[13px] font-normal text-bad/90">
                    Indok: {event.cancelReason}
                  </div>
                )}
              </div>
            )}
            <CalendarButton
              href={`/api/events/${event.slug}/ics`}
              className="mt-3 block rounded-full border-[1.5px] border-line-strong py-3 text-center text-sm font-semibold transition hover:bg-chip"
            />
          </div>

          {venue && (
            <div className="rounded-card border border-line p-6 shadow-card">
              <div className="text-sm font-bold uppercase tracking-wide text-faint">Helyszín</div>
              <Link
                href={`/helyszinek/${venue.slug}`}
                className="mt-2 block text-lg font-bold hover:text-accent"
              >
                {venue.name}
              </Link>
              <div className="mt-1 text-sm text-muted">
                {venue.address.zip} {venue.address.city}, {venue.address.street}
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${venue.location.coordinates[1]},${venue.location.coordinates[0]}`}
                target="_blank"
                rel="noopener"
                className="mt-3 inline-block text-sm font-semibold text-accent hover:text-accent-deep"
              >
                Útvonaltervezés →
              </a>
            </div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 font-display text-[26px] font-bold tracking-tight">
            Kapcsolódó események
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </PageFrame>
  );
}
