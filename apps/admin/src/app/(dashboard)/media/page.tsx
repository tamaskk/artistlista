import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui";
import { getManagedArtists, requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const user = await requireUser();
  const artists = await getManagedArtists(user);
  const images = artists.flatMap((a) => [
    ...(a.images?.avatar ? [{ url: a.images.avatar, kind: "avatar", artist: a.name }] : []),
    ...(a.images?.cover ? [{ url: a.images.cover, kind: "borító", artist: a.name }] : []),
    ...(a.images?.gallery ?? []).map((url: string) => ({ url, kind: "galéria", artist: a.name })),
  ]);

  return (
    <>
      <PageHeader crumb="Média" title="Média" />
      <p className="pb-5 text-[13.5px] text-muted">
        A kezelt előadók képei. Új képet az előadó profil „Képek" fülén adhatsz meg (MVP:
        URL-alapú, Cloudinary upload a v1-ben).
      </p>
      {images.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted">Még nincs feltöltött kép.</Card>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {images.map((img, i) => (
            <Card key={i} className="overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-36 w-full object-cover" />
              <div className="flex flex-col gap-0.5 p-3.5">
                <span className="truncate text-[12.5px] font-semibold">{img.artist}</span>
                <span className="text-[11px] text-muted">{img.kind}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
