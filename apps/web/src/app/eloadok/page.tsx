import type { Metadata } from "next";
import Link from "next/link";
import { GENRES } from "@artistlist/types";
import { PageFrame } from "@/components/PageFrame";
import { Thumb } from "@/components/Thumb";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { getArtistCatalog } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Előadók",
  description: "Magyar előadók katalógusa — böngéssz műfaj és név szerint.",
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default async function ArtistsPage(props: {
  searchParams: Promise<{ q?: string; mufaj?: string; betu?: string }>;
}) {
  const sp = await props.searchParams;
  const artists = await getArtistCatalog({ q: sp.q, genre: sp.mufaj, letter: sp.betu });

  const linkFor = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q: sp.q, mufaj: sp.mufaj, betu: sp.betu, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return p.size ? `/eloadok?${p}` : "/eloadok";
  };

  return (
    <PageFrame active="/eloadok">
      <div className="mt-8">
        <h1 className="font-display text-[32px] font-bold tracking-tight">Előadók</h1>

        <form className="mt-5 flex max-w-md gap-2" action="/eloadok">
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Előadó keresése…"
            className="min-w-0 flex-1 rounded-full border-[1.5px] border-line-strong px-5 py-2.5 text-sm outline-none focus:border-accent"
          />
          <button className="shrink-0 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-ink-hover">
            Keresés
          </button>
        </form>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={linkFor({ mufaj: undefined })}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold ${!sp.mufaj ? "bg-ink text-white" : "border-[1.5px] border-line-strong hover:bg-chip"}`}
          >
            Összes
          </Link>
          {GENRES.map((g) => (
            <Link
              key={g.slug}
              href={linkFor({ mufaj: g.slug })}
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold ${sp.mufaj === g.slug ? "bg-ink text-white" : "border-[1.5px] border-line-strong hover:bg-chip"}`}
            >
              {g.name}
            </Link>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-1 text-[13px]">
          {LETTERS.map((l) => (
            <Link
              key={l}
              href={linkFor({ betu: sp.betu === l ? undefined : l })}
              className={`flex h-7 w-7 items-center justify-center rounded-full font-semibold ${sp.betu === l ? "bg-accent text-white" : "text-ink-soft hover:bg-chip"}`}
            >
              {l}
            </Link>
          ))}
        </div>

        {artists.length === 0 ? (
          <div className="mt-10 flex h-40 items-center justify-center rounded-card border border-dashed border-line-strong text-sm text-muted">
            Nincs találat.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((a) => (
              <Link
                key={a.id}
                href={`/eloadok/${a.slug}`}
                className="flex items-center gap-4 rounded-card border border-line bg-surface p-5 shadow-card transition hover:-translate-y-[3px] hover:shadow-card-hover"
              >
                <Thumb
                  src={a.avatar}
                  alt={a.name}
                  label="portré"
                  className="h-16 w-16 shrink-0 rounded-full"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 truncate text-[15px] font-semibold">
                    <span className="truncate">{a.name}</span>
                    {a.verified && <VerifiedBadge size={16} />}
                  </div>
                  <div className="truncate text-xs text-muted">
                    {a.genres.join(" · ")}
                    {a.homeCity ? ` · ${a.homeCity}` : ""}
                  </div>
                  {a.shortBio && (
                    <div className="mt-1 line-clamp-2 text-[12.5px] text-ink-soft">
                      {a.shortBio}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageFrame>
  );
}
