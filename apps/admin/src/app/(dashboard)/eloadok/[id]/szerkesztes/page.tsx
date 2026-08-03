import { notFound, redirect } from "next/navigation";
import { Artist, connectDB } from "@artistlist/database";
import { toggleArtistVerified } from "@/actions/admin";
import { submitArtistForReview, updateArtistTab } from "@/actions/artists";
import { ArtistForm } from "@/components/ArtistForm";
import { PageHeader } from "@/components/PageHeader";
import { ArtistStatusBadge } from "@/components/ui";
import { canManageArtist, requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000";

export default async function EditArtistPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const user = await requireUser();
  if (!(await canManageArtist(user, id))) redirect("/eloadok");

  await connectDB();
  const artist = await Artist.findById(id).lean();
  if (!artist) notFound();

  return (
    <>
      <PageHeader
        crumb={`Előadóim / ${artist.name}`}
        title={artist.name}
        action={
          <div className="flex items-center gap-3">
            <ArtistStatusBadge status={artist.status as never} />
            {user.role === "SUPER_ADMIN" && (
              <form
                action={async () => {
                  "use server";
                  await toggleArtistVerified(id);
                }}
              >
                <button
                  className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                    (artist as { verified?: boolean }).verified
                      ? "border-[#1D9BF0] text-[#1D9BF0]"
                      : "border-line-strong hover:border-accent hover:text-accent"
                  }`}
                >
                  {(artist as { verified?: boolean }).verified
                    ? "✓ Ellenőrzött — levétel"
                    : "Ellenőrzés (kék pipa)"}
                </button>
              </form>
            )}
            {artist.status === "draft" && (
              <form action={async () => {
                  "use server";
                  await submitArtistForReview(id);
                }}>
                <button className="rounded-full bg-ink px-[18px] py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-ink-hover">
                  Beküldés moderációra
                </button>
              </form>
            )}
            {artist.status === "published" && (
              <a
                href={`${WEB_URL}/eloadok/${artist.slug}`}
                target="_blank"
                className="rounded-full border border-line-strong px-4 py-2 text-[13px] font-semibold transition hover:border-accent hover:text-accent"
              >
                Megnyitás a weben ↗
              </a>
            )}
          </div>
        }
      />
      <ArtistForm
        baseAction={updateArtistTab.bind(null, id, "base")}
        imagesAction={updateArtistTab.bind(null, id, "images")}
        linksAction={updateArtistTab.bind(null, id, "links")}
        bookingAction={updateArtistTab.bind(null, id, "booking")}
        initial={{
          name: artist.name,
          shortBio: artist.shortBio ?? "",
          bio: artist.bio ?? "",
          genres: artist.genres ?? [],
          homeCity: artist.homeCity ?? "",
          avatar: artist.images?.avatar ?? "",
          cover: artist.images?.cover ?? "",
          gallery: artist.images?.gallery ?? [],
          links: Object.fromEntries(
            Object.entries((artist.links as Record<string, string>) ?? {}),
          ),
          spotifyArtistId: artist.embeds?.spotifyArtistId ?? "",
          youtubeVideoId: artist.embeds?.youtubeVideoId ?? "",
          bookingEmail: artist.booking?.email ?? "",
          bookingPhone: artist.booking?.phone ?? "",
          bookingPublic: artist.booking?.public ?? false,
        }}
      />
    </>
  );
}
