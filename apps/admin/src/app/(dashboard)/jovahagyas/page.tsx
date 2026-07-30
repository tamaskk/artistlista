import { Artist, Event, Organization, connectDB } from "@artistlist/database";
import { formatEventDate, formatPrice } from "@artistlist/types";
import { approveEvent, assignArtistToOrg, rejectEvent } from "@/actions/approvals";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const user = await requireUser();
  await connectDB();

  let filter: Record<string, unknown>;
  if (user.role === "SUPER_ADMIN") {
    filter = { status: "pending" };
  } else if (user.role === "MANAGER" && user.organizationId) {
    filter = { status: "pending", organizationId: user.organizationId };
  } else if (user.role === "ARTIST" && user.artistId) {
    filter = {
      status: "pending",
      $or: [{ pendingApprovalArtistId: user.artistId }, { artistIds: user.artistId }],
    };
  } else {
    filter = { _id: null };
  }

  const pending = await Event.find(filter).sort({ createdAt: 1 }).lean();
  const orgs =
    user.role === "SUPER_ADMIN" ? await Organization.find().sort({ name: 1 }).lean() : [];
  const headlinerIds = pending.map((e) => e.artistIds?.[0]).filter(Boolean);
  const artists = await Artist.find({ _id: { $in: headlinerIds } })
    .select("name status organizationId ownerUserId")
    .lean();
  const artistById = new Map(artists.map((a) => [String(a._id), a]));

  return (
    <>
      <PageHeader crumb="Jóváhagyás" title="Jóváhagyásra váró koncertek" />
      <p className="-mt-3 pb-5 text-[13.5px] text-muted">
        {user.role === "SUPER_ADMIN"
          ? "Külsős beküldések — hagyd jóvá, utasítsd el, vagy rendeld menedzsmenthez az új előadót."
          : "A hozzád beküldött koncertek jóváhagyása."}
      </p>
      {pending.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted">
          Nincs jóváhagyásra váró koncert. 🎉
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((e) => {
            const art = artistById.get(String(e.artistIds?.[0]));
            const isNewArtist = art?.status === "pending";
            const needsOrg = !art?.organizationId;
            return (
              <Card key={String(e._id)} className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-semibold">
                        {e.artistNames?.[0] ?? e.title}
                      </span>
                      {isNewArtist && (
                        <span className="rounded-full bg-warn/15 px-2.5 py-0.5 text-[11px] font-semibold text-warn">
                          Új előadó
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[13px] text-ink-soft">{e.title}</div>
                    <div className="mt-1 text-[12.5px] text-muted">
                      {e.venueName} · {e.city} · {formatEventDate(e.startsAt)}
                      {formatPrice(e.price) ? ` · ${formatPrice(e.price)}` : ""}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 border-t border-line pt-3">
                  <form
                    action={async () => {
                      "use server";
                      await approveEvent(String(e._id));
                    }}
                  >
                    <button className="rounded-full bg-ok px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">
                      Jóváhagyás{isNewArtist ? " + előadó élesítése" : ""}
                    </button>
                  </form>

                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      await rejectEvent(String(e._id), String(formData.get("reason") ?? ""));
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

                  {user.role === "SUPER_ADMIN" && needsOrg && art && orgs.length > 0 && (
                    <form
                      action={async (formData: FormData) => {
                        "use server";
                        await assignArtistToOrg(String(art._id), String(formData.get("orgId") ?? ""));
                      }}
                      className="ml-auto flex items-center gap-2"
                    >
                      <select
                        name="orgId"
                        defaultValue=""
                        className="rounded-full border border-line-strong px-3 py-1.5 text-[13px] outline-none focus:border-accent"
                      >
                        <option value="" disabled>
                          Menedzsmenthez rendel…
                        </option>
                        {orgs.map((o) => (
                          <option key={String(o._id)} value={String(o._id)}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                      <button className="rounded-full border border-accent/40 px-4 py-2 text-[13px] font-semibold text-accent transition hover:bg-accent/5">
                        Hozzárendel
                      </button>
                    </form>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
