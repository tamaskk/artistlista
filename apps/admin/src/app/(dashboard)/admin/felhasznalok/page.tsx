import { User, connectDB } from "@artistlist/database";
import { approveUser, banUser, rejectUser, unbanUser } from "@/actions/admin";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  active: { text: "Aktív", cls: "text-ok" },
  pending: { text: "Jóváhagyásra vár", cls: "text-warn" },
  banned: { text: "Tiltva", cls: "text-bad" },
};

export default async function UsersPage() {
  const admin = await requireRole("SUPER_ADMIN");
  await connectDB();
  const users = await User.find().sort({ createdAt: -1 }).limit(300).lean();
  const pending = users.filter((u) => u.status === "pending");
  const rest = users.filter((u) => u.status !== "pending");

  return (
    <>
      <PageHeader crumb="Platform / Felhasználók" title="Felhasználók" />

      {pending.length > 0 && (
        <Card className="mb-5 border-warn/30 bg-warn/5 px-5 pb-5 pt-4">
          <h2 className="mb-1 text-[15px] font-bold">
            Jóváhagyásra váró regisztrációk ({pending.length})
          </h2>
          <p className="mb-3 text-[13px] text-muted">
            Előadó/menedzsment fiók csak jóváhagyás után tud belépni.
          </p>
          <div className="flex flex-col gap-2.5">
            {pending.map((u) => (
              <div
                key={String(u._id)}
                className="flex items-center gap-3 rounded-[12px] border border-line bg-white px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-semibold">{u.name}</div>
                  <div className="truncate text-[12.5px] text-muted">
                    {u.email} · {u.role === "MANAGER" ? "Menedzsment" : "Előadó"}
                  </div>
                </div>
                <form action={async () => {
                    "use server";
                    await approveUser(String(u._id));
                  }}>
                  <button className="rounded-full bg-ok px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">
                    Jóváhagyás
                  </button>
                </form>
                <form action={async () => {
                    "use server";
                    await rejectUser(String(u._id));
                  }}>
                  <button className="rounded-full border border-bad/40 px-4 py-2 text-[13px] font-semibold text-bad transition hover:bg-bad/5">
                    Elutasítás
                  </button>
                </form>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="px-5 pb-5 pt-2">
        <div className="grid grid-cols-[1fr_1.3fr_auto_auto_auto] items-center gap-3.5 px-2 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted">
          <span>Név</span>
          <span>E-mail</span>
          <span>Szerepkör</span>
          <span>Állapot</span>
          <span />
        </div>
        {rest.map((u) => {
          const st = STATUS_LABEL[u.status ?? "active"] ?? STATUS_LABEL.active;
          return (
            <div
              key={String(u._id)}
              className="grid grid-cols-[1fr_1.3fr_auto_auto_auto] items-center gap-3.5 rounded-[10px] border-t border-chip px-2 py-3 hover:bg-row"
            >
              <span className="truncate text-[13.5px] font-semibold">{u.name}</span>
              <span className="truncate text-[13px] text-muted">{u.email}</span>
              <span className="rounded-full bg-chip px-2.5 py-0.5 text-[11.5px] font-semibold text-ink-soft">
                {u.role}
              </span>
              <span className={`text-[13px] font-medium ${st.cls}`}>{st.text}</span>
              {String(u._id) !== admin.id &&
                (u.status === "banned" ? (
                  <form action={async () => {
                      "use server";
                      await unbanUser(String(u._id));
                    }}>
                    <button className="rounded-full border border-line-strong px-3.5 py-1.5 text-[12px] font-semibold transition hover:border-ok hover:text-ok">
                      Feloldás
                    </button>
                  </form>
                ) : (
                  <form action={async () => {
                      "use server";
                      await banUser(String(u._id));
                    }}>
                    <button className="rounded-full border border-line-strong px-3.5 py-1.5 text-[12px] font-semibold transition hover:border-bad hover:text-bad">
                      Tiltás
                    </button>
                  </form>
                ))}
            </div>
          );
        })}
      </Card>
    </>
  );
}
