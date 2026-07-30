import { Artist, connectDB } from "@artistlist/database";
import { approveArtist, rejectArtist } from "@/actions/admin";
import { PageHeader } from "@/components/PageHeader";
import { Card, InitialsAvatar } from "@/components/ui";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  await requireRole("SUPER_ADMIN");
  await connectDB();
  const pending = await Artist.find({ status: "pending" }).sort({ createdAt: 1 }).lean();

  return (
    <>
      <PageHeader crumb="Platform / Moderáció" title="Moderációs várólista" />
      {pending.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted">
          Nincs jóváhagyásra váró előadó. 🎉
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {pending.map((a) => (
            <Card key={String(a._id)} className="flex flex-col gap-3.5 p-6">
              <div className="flex items-center gap-3">
                <InitialsAvatar name={a.name} size={48} className="rounded-full" />
                <div className="flex flex-col">
                  <span className="text-[15px] font-semibold">{a.name}</span>
                  <span className="text-xs text-muted">
                    {a.genres.join(" · ")}
                    {a.homeCity ? ` · ${a.homeCity}` : ""}
                  </span>
                </div>
              </div>
              {a.shortBio && <p className="text-[13px] text-ink-soft">{a.shortBio}</p>}
              <div className="flex items-center gap-2.5 pt-1">
                <form action={async () => {
                  "use server";
                  await approveArtist(String(a._id));
                }}>
                  <button className="rounded-full bg-ok px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">
                    Jóváhagyás
                  </button>
                </form>
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    await rejectArtist(String(a._id), String(formData.get("reason") ?? ""));
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    name="reason"
                    placeholder="Indoklás…"
                    className="rounded-full border border-line-strong px-3.5 py-1.5 text-[13px] outline-none focus:border-accent"
                  />
                  <button className="rounded-full border border-bad/40 px-4 py-2 text-[13px] font-semibold text-bad transition hover:bg-bad/5">
                    Elutasítás
                  </button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
