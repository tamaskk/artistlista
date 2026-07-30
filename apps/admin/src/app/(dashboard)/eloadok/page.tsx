import Link from "next/link";
import { redirect } from "next/navigation";
import { NewButton, PageHeader } from "@/components/PageHeader";
import { ArtistStatusBadge, Card, InitialsAvatar } from "@/components/ui";
import { getManagedArtists, requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ArtistsPage() {
  const user = await requireUser();
  if (user.role === "ARTIST" && user.artistId) {
    redirect(`/eloadok/${user.artistId}/szerkesztes`);
  }
  const artists = await getManagedArtists(user);
  const nf = new Intl.NumberFormat("hu-HU");

  return (
    <>
      <PageHeader
        crumb="Előadóim"
        title="Előadóim"
        action={
          user.role !== "ARTIST" ? <NewButton href="/eloadok/uj" label="Új előadó" /> : undefined
        }
      />
      {artists.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted">
          Még nincs előadód —{" "}
          <Link href="/eloadok/uj" className="font-semibold text-accent">
            hozd létre az elsőt!
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {artists.map((a) => (
            <Card key={String(a._id)} className="flex flex-col gap-3.5 p-5">
              <div className="flex items-center gap-3">
                {a.images?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={a.images.avatar}
                    alt={a.name}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <InitialsAvatar name={a.name} size={48} className="rounded-full" />
                )}
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-[15px] font-semibold">{a.name}</span>
                  <span className="truncate text-xs text-muted">{a.genres.join(" · ")}</span>
                </div>
                <span className="ml-auto">
                  <ArtistStatusBadge status={a.status as never} />
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-y border-chip py-3">
                <div className="flex flex-col">
                  <span className="text-base font-bold">
                    {nf.format(a.stats?.followers ?? 0)}
                  </span>
                  <span className="text-[11px] text-muted">Követő</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold">
                    {nf.format(a.stats?.views30d ?? 0)}
                  </span>
                  <span className="text-[11px] text-muted">Megtekintés (30 nap)</span>
                </div>
              </div>
              <Link
                href={`/eloadok/${a._id}/szerkesztes`}
                className="rounded-full border border-line-strong py-2 text-center text-[13px] font-semibold transition hover:border-accent hover:text-accent"
              >
                Profil szerkesztése
              </Link>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
