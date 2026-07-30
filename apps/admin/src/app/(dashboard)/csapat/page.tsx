import { Invite, User, connectDB } from "@artistlist/database";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui";
import { requireRole } from "@/lib/session";
import { InviteForm } from "./InviteForm";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const user = await requireRole("MANAGER", "SUPER_ADMIN");
  await connectDB();
  const [members, invites] = await Promise.all([
    user.organizationId
      ? User.find({ organizationId: user.organizationId }).sort({ createdAt: 1 }).lean()
      : [],
    user.organizationId
      ? Invite.find({
          organizationId: user.organizationId,
          acceptedAt: null,
          expiresAt: { $gte: new Date() },
        }).lean()
      : [],
  ]);

  return (
    <>
      <PageHeader crumb="Csapat" title="Csapat" action={<InviteForm />} />
      <Card className="px-5 pb-5 pt-2">
        <div className="grid grid-cols-[36px_1fr_1.3fr_auto_auto] items-center gap-3.5 px-2 py-3 text-[11.5px] font-semibold uppercase tracking-wider text-muted">
          <span />
          <span>Név</span>
          <span>E-mail</span>
          <span>Szerepkör</span>
          <span>Állapot</span>
        </div>
        {members.map((m) => (
          <div
            key={String(m._id)}
            className="grid grid-cols-[36px_1fr_1.3fr_auto_auto] items-center gap-3.5 rounded-[10px] border-t border-chip px-2 py-3 hover:bg-row"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
              {m.name
                .split(/\s+/)
                .map((w: string) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <span className="text-[13.5px] font-semibold">{m.name}</span>
            <span className="text-[13px] text-muted">{m.email}</span>
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11.5px] font-semibold text-accent">
              {m.role === "MANAGER" ? "Szerkesztő" : m.role}
            </span>
            <span className="text-[13px] text-ink-soft">
              {m.status === "active" ? "Aktív" : m.status}
            </span>
          </div>
        ))}
        {invites.map((i) => (
          <div
            key={String(i._id)}
            className="grid grid-cols-[36px_1fr_1.3fr_auto_auto] items-center gap-3.5 rounded-[10px] border-t border-chip px-2 py-3 opacity-60"
          >
            <div className="h-9 w-9 rounded-full border border-dashed border-line-strong" />
            <span className="text-[13.5px] italic text-muted">Meghívó elküldve</span>
            <span className="text-[13px] text-muted">{i.email}</span>
            <span className="rounded-full bg-chip px-2.5 py-0.5 text-[11.5px] font-semibold text-ink-soft">
              Függőben
            </span>
            <span className="text-[13px] text-muted">
              lejár: {new Intl.DateTimeFormat("hu-HU", { month: "short", day: "numeric" }).format(i.expiresAt)}
            </span>
          </div>
        ))}
      </Card>
    </>
  );
}
