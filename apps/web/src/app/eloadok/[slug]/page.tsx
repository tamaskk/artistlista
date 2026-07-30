import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SOCIAL_KEYS } from "@artistlist/types";
import { PageFrame } from "@/components/PageFrame";
import { EventCard } from "@/components/EventCard";
import { FollowButton } from "@/components/FollowButton";
import { EmbedSnippet } from "@/components/EmbedSnippet";
import { ShareButton } from "@/components/ShareButton";
import { Thumb } from "@/components/Thumb";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { getArtistBySlug } from "@/lib/data";

export const revalidate = 60;

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

const SOCIAL_LABELS: Record<string, string> = {
  website: "Weboldal",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
  spotify: "Spotify",
  soundcloud: "SoundCloud",
};

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const data = await getArtistBySlug(slug);
  if (!data) return { title: "Előadó nem található" };
  return { title: data.artist.name, description: data.artist.shortBio || undefined };
}

export default async function ArtistPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const data = await getArtistBySlug(slug);
  if (!data) notFound();
  const { artist, upcoming, past } = data;
  const links = Object.fromEntries(
    Object.entries((artist.links as Record<string, string>) ?? {}).filter(([k, v]) =>
      (SOCIAL_KEYS as readonly string[]).includes(k) && v,
    ),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: artist.name,
    genre: artist.genres,
    description: artist.shortBio || undefined,
  };

  return (
    <PageFrame active="/eloadok">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* borító + avatar */}
      <div className="relative mt-8">
        <div className="h-[220px] overflow-hidden rounded-3xl">
          <Thumb
            src={artist.images?.cover}
            alt={artist.name}
            label={`borítókép — ${artist.name}`}
            className="h-full w-full"
          />
        </div>
        <div className="absolute -bottom-10 left-8">
          <Thumb
            src={artist.images?.avatar}
            alt={artist.name}
            label="portré"
            className="h-[104px] w-[104px] rounded-full border-4 border-white shadow-card"
          />
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="flex items-center gap-2 font-display text-[32px] font-bold tracking-tight">
              {artist.name}
              {artist.verified && <VerifiedBadge size={22} />}
            </h1>
            <div className="flex items-center gap-2">
              <ShareButton title={artist.name} path={`/eloadok/${artist.slug}`} />
              <FollowButton artistId={String(artist._id)} />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {artist.genres.map((g: string) => (
              <Link
                key={g}
                href={`/esemenyek?mufaj=${g}`}
                className="rounded-full bg-chip px-3.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-canvas"
              >
                {g}
              </Link>
            ))}
            {artist.homeCity && (
              <span className="rounded-full border border-line px-3.5 py-1.5 text-xs text-muted">
                {artist.homeCity}
              </span>
            )}
          </div>

          {artist.bio && (
            <p className="mt-6 max-w-[640px] whitespace-pre-line text-[15px] leading-relaxed text-ink-soft">
              {artist.bio}
            </p>
          )}

          {Object.keys(links).length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2.5">
              {Object.entries(links).map(([k, v]) => (
                <a
                  key={k}
                  href={v}
                  target="_blank"
                  rel="noopener"
                  className="rounded-full border-[1.5px] border-line-strong px-4 py-2 text-[13px] font-semibold transition hover:bg-chip"
                >
                  {SOCIAL_LABELS[k] ?? k}
                </a>
              ))}
            </div>
          )}

          {artist.embeds?.spotifyArtistId && (
            <iframe
              className="mt-8 w-full max-w-[640px] rounded-2xl"
              src={`https://open.spotify.com/embed/artist/${artist.embeds.spotifyArtistId}`}
              height="152"
              allow="encrypted-media"
              loading="lazy"
            />
          )}
          {artist.embeds?.youtubeVideoId && (
            <iframe
              className="mt-5 aspect-video w-full max-w-[640px] rounded-2xl"
              src={`https://www.youtube-nocookie.com/embed/${artist.embeds.youtubeVideoId}`}
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          )}

          {(artist.images?.gallery ?? []).length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 font-display text-xl font-bold">Galéria</h2>
              <div className="grid grid-cols-3 gap-3">
                {artist.images.gallery.map((src: string, i: number) => (
                  <Thumb key={i} src={src} alt={artist.name} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          {artist.booking?.public && artist.booking?.email && (
            <div className="rounded-card border border-line p-6 shadow-card">
              <div className="text-sm font-bold uppercase tracking-wide text-faint">Booking</div>
              <a
                href={`mailto:${artist.booking.email}`}
                className="mt-2 block text-sm font-semibold text-accent hover:text-accent-deep"
              >
                {artist.booking.email}
              </a>
              {artist.booking.phone && (
                <div className="mt-1 text-sm text-muted">{artist.booking.phone}</div>
              )}
            </div>
          )}
          <div className="rounded-card border border-line p-6 shadow-card">
            <div className="text-sm font-bold uppercase tracking-wide text-faint">Statisztika</div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-xl font-bold">
                  {new Intl.NumberFormat("hu-HU").format(artist.stats?.followers ?? 0)}
                </div>
                <div className="text-xs text-muted">Követő</div>
              </div>
              <div>
                <div className="text-xl font-bold">{upcoming.length}</div>
                <div className="text-xs text-muted">Közelgő fellépés</div>
              </div>
            </div>
          </div>
          <EmbedSnippet webUrl={WEB_URL} slug={artist.slug} name={artist.name} />
        </aside>
      </div>

      <section className="mt-14">
        <h2 className="mb-5 font-display text-[26px] font-bold tracking-tight">
          Közelgő fellépések
        </h2>
        {upcoming.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-card border border-dashed border-line-strong text-sm text-muted">
            Jelenleg nincs meghirdetett fellépés.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <details className="mt-10">
          <summary className="cursor-pointer font-display text-xl font-bold">
            Korábbi fellépések ({past.length})
          </summary>
          <div className="mt-5 grid grid-cols-1 gap-4 opacity-70 sm:grid-cols-2 lg:grid-cols-4">
            {past.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </details>
      )}
    </PageFrame>
  );
}
