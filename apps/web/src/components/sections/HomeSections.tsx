import Link from "next/link";
import { GENRES } from "@artistlist/types";
import {
  getCityCounts,
  getFeaturedArtists,
  getGenreCounts,
  getMostLiked,
  getNewArtists,
  getPopularVenues,
  getTrendingEvents,
} from "@/lib/data";
import { cityImage } from "@/lib/cityImages";
import { EventCard } from "../EventCard";
import { Thumb } from "../Thumb";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

function SectionHead({ title, moreHref }: { title: string; moreHref?: string }) {
  return (
    <div className="mb-5 flex items-baseline justify-between">
      <h2 className="font-display text-[26px] font-bold tracking-tight">{title}</h2>
      {moreHref && (
        <Link href={moreHref} className="text-sm font-semibold text-accent hover:text-accent-deep">
          Összes megtekintése →
        </Link>
      )}
    </div>
  );
}

export async function FeaturedArtists() {
  const artists = await getFeaturedArtists();
  if (!artists.length) return null;
  return (
    <section className="mt-14">
      <SectionHead title="Kiemelt előadók" moreHref="/eloadok" />
      <div className="flex gap-8 overflow-x-auto pb-1">
        {artists.map((a) => (
          <Link
            key={a.id}
            href={`/eloadok/${a.slug}`}
            className="group flex shrink-0 flex-col items-center gap-2.5"
          >
            <Thumb
              src={a.avatar}
              alt={a.name}
              label="portré"
              className="h-[120px] w-[120px] rounded-full transition group-hover:scale-[1.04]"
            />
            <div className="text-center">
              <div className="text-sm font-semibold">{a.name}</div>
              <div className="text-xs text-muted">{a.genres[0]}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function GenreGrid() {
  const genres = await getGenreCounts();
  return (
    <section className="mt-14">
      <SectionHead title="Böngészés műfaj szerint" />
      <div className="flex flex-wrap gap-3">
        {genres.map((g) => (
          <Link
            key={g.slug}
            href={`/esemenyek?mufaj=${g.slug}`}
            className="flex items-center gap-2 rounded-full border-[1.5px] border-line-strong px-5 py-2.5 text-sm font-semibold transition hover:border-ink hover:bg-ink hover:text-white"
          >
            {g.name} <span className="font-normal opacity-55">{g.count}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function CityGrid() {
  const cities = await getCityCounts();
  if (!cities.length) return null;
  return (
    <section className="mt-14">
      <SectionHead title="Népszerű városok" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cities.slice(0, 4).map((c) => (
          <Link
            key={c.city}
            href={`/varosok/${c.city.toLowerCase()}`}
            className="group relative h-[180px] overflow-hidden rounded-card transition hover:-translate-y-[3px]"
          >
            <div className="thumb-placeholder absolute inset-0" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cityImage(c.city)}
              alt={`${c.city} városkép`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
            <div className="absolute bottom-3.5 left-4 text-white">
              <div className="font-display text-[19px] font-bold">{c.city}</div>
              <div className="text-[12.5px] opacity-85">{c.count} esemény</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function MostLiked() {
  const { topEvent, topArtist } = await getMostLiked();
  if (!topEvent && !topArtist) return null;
  return (
    <section className="mt-14">
      <SectionHead title="Ezt jelölték be a legtöbben" />
      <div className="grid gap-4 md:grid-cols-2">
        {topEvent && (
          <div className="flex flex-col gap-2">
            <span className="text-[12.5px] font-semibold text-muted">
              💜 Legnépszerűbb koncert · {topEvent.saves ?? 0} mentés
            </span>
            <EventCard event={topEvent} />
          </div>
        )}
        {topArtist && (
          <div className="flex flex-col gap-2">
            <span className="text-[12.5px] font-semibold text-muted">
              💜 Legnépszerűbb előadó · {topArtist.saves} mentés
            </span>
            <Link
              href={`/eloadok/${topArtist.slug}`}
              className="group relative flex flex-1 items-center gap-4 overflow-hidden rounded-card border border-line bg-surface p-5 transition hover:-translate-y-[3px] hover:shadow-card-hover"
            >
              {topArtist.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={topArtist.avatar}
                  alt={topArtist.name}
                  className="h-20 w-20 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="thumb-placeholder h-20 w-20 shrink-0 rounded-full" />
              )}
              <div className="min-w-0">
                <div className="font-display text-[22px] font-bold tracking-tight">
                  {topArtist.name}
                </div>
                <div className="mt-0.5 text-[13px] text-muted">{topArtist.genres.join(" · ")}</div>
                <div className="mt-2 inline-block rounded-full bg-glow/10 px-3 py-1 text-[12.5px] font-semibold text-glow">
                  {topArtist.saves} mentés összesen
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export async function TrendingEvents() {
  const events = await getTrendingEvents();
  if (!events.length) return null;
  return (
    <section className="mt-14">
      <SectionHead title="Felkapott események" moreHref="/esemenyek" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </section>
  );
}

export async function PopularVenues() {
  const venues = await getPopularVenues();
  if (!venues.length) return null;
  return (
    <section className="mt-14">
      <SectionHead title="Népszerű helyszínek" moreHref="/helyszinek" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {venues.map((v) => (
          <Link
            key={v.id}
            href={`/helyszinek/${v.slug}`}
            className="rounded-card border border-line bg-surface p-5 shadow-card transition hover:-translate-y-[3px] hover:shadow-card-hover"
          >
            <Thumb alt={v.name} label="helyszínfotó" className="mb-4 h-24 w-full rounded-xl" />
            <div className="text-[15px] font-semibold">{v.name}</div>
            <div className="mt-0.5 text-[12.5px] text-muted">
              {v.city} · {v.count} közelgő esemény
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function NewArtists() {
  const artists = await getNewArtists();
  if (!artists.length) return null;
  return (
    <section className="mt-14">
      <SectionHead title="Új előadók a platformon" moreHref="/eloadok" />
      <div className="flex gap-6 overflow-x-auto pb-1">
        {artists.map((a) => (
          <Link
            key={a.id}
            href={`/eloadok/${a.slug}`}
            className="flex shrink-0 items-center gap-3 rounded-full border border-line py-2 pl-2 pr-5 transition hover:bg-chip"
          >
            <Thumb src={a.avatar} alt={a.name} label="" className="h-10 w-10 rounded-full" />
            <div>
              <div className="text-sm font-semibold">{a.name}</div>
              <div className="text-xs text-muted">{a.genres[0]}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className="relative mt-14 flex flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl bg-ink px-8 py-12 md:flex-row md:items-center md:px-14">
      <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.45)_0%,rgba(139,92,246,0)_70%)]" />
      <div className="relative">
        <h2 className="font-display text-[34px] font-extrabold tracking-tight text-white">
          Előadó vagy?
        </h2>
        <p className="mt-2.5 max-w-[440px] text-base text-white/70">
          Töltsd fel a fellépéseidet ingyen, és érd el a közönséged.
        </p>
      </div>
      <div className="relative flex shrink-0 items-center gap-3.5">
        <a
          href={`${ADMIN_URL}/register`}
          className="rounded-full bg-surface px-7 py-3.5 text-[15px] font-bold text-fg transition hover:bg-chip"
        >
          Ingyenes regisztráció
        </a>
        <a
          href={`${ADMIN_URL}/register`}
          className="rounded-full border-[1.5px] border-white/35 px-6 py-3 text-[15px] font-semibold text-white transition hover:border-white hover:bg-white/10"
        >
          Így működik
        </a>
      </div>
    </section>
  );
}

/** Ma · Holnap · Hétvégén gyorslista — kliens-tabok helyett 3 oszlop. */
export async function QuickLists() {
  const { getUpcomingEvents } = await import("@/lib/data");
  const events = await getUpcomingEvents(60);
  const now = new Date();
  const startOfDay = (d: Date) => {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c;
  };
  const addDays = (d: Date, n: number) => {
    const c = new Date(d);
    c.setDate(c.getDate() + n);
    return c;
  };
  const tomorrow = addDays(startOfDay(now), 1);
  const dayAfter = addDays(startOfDay(now), 2);
  const day = now.getDay();
  const friday = addDays(startOfDay(now), day === 0 ? -2 : 5 - day);
  const monday = addDays(friday, 3);

  const buckets = [
    {
      label: "Ma",
      href: "/esemenyek?datum=ma",
      items: events.filter((e) => new Date(e.startsAt) < tomorrow),
    },
    {
      label: "Holnap",
      href: "/esemenyek?datum=holnap",
      items: events.filter(
        (e) => new Date(e.startsAt) >= tomorrow && new Date(e.startsAt) < dayAfter,
      ),
    },
    {
      label: "Hétvégén",
      href: "/esemenyek?datum=hetvege",
      items: events.filter((e) => new Date(e.startsAt) >= friday && new Date(e.startsAt) < monday),
    },
  ];

  return (
    <section className="mt-14">
      <SectionHead title="Mi lesz ma, holnap, hétvégén?" moreHref="/esemenyek" />
      <div className="grid gap-4 md:grid-cols-3">
        {buckets.map((b) => (
          <div key={b.label} className="rounded-card border border-line p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-[15px] font-bold">{b.label}</span>
              <Link href={b.href} className="text-xs font-semibold text-accent">
                Mind →
              </Link>
            </div>
            {b.items.length === 0 ? (
              <div className="py-6 text-center text-[13px] text-faint">Nincs esemény.</div>
            ) : (
              <div className="flex flex-col">
                {b.items.slice(0, 4).map((e) => (
                  <Link
                    key={e.id}
                    href={`/esemenyek/${e.slug}`}
                    className="flex items-center gap-3 rounded-xl border-t border-line/60 px-2 py-2.5 first:border-t-0 hover:bg-chip"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-semibold">
                        {e.artistNames[0]}
                      </div>
                      <div className="truncate text-xs text-muted">
                        {e.venueName} · {e.city}
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-ink-soft">
                      {e.price.kind === "free"
                        ? "Ingyenes"
                        : e.price.min
                          ? `${new Intl.NumberFormat("hu-HU").format(e.price.min)} Ft`
                          : ""}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
