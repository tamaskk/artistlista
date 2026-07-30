import { Invite, Organization, connectDB } from "@artistlist/database";
import { InviteAcceptForm } from "./InviteAcceptForm";

export default async function InvitePage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  await connectDB();
  const invite = await Invite.findOne({
    token,
    acceptedAt: null,
    expiresAt: { $gte: new Date() },
  }).lean();
  const org = invite ? await Organization.findById(invite.organizationId).lean() : null;

  if (!invite || !org) {
    return (
      <div className="text-center">
        <h1 className="pb-3 font-display text-2xl font-bold">Érvénytelen meghívó</h1>
        <p className="text-sm text-muted">A link lejárt vagy már felhasználták.</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="pb-2 font-display text-2xl font-bold tracking-tight">Csatlakozás</h1>
      <p className="pb-5 text-sm text-muted">
        Meghívást kaptál a(z) <strong>{org.name}</strong> csapatába ({invite.email}).
      </p>
      <InviteAcceptForm token={token} />
    </>
  );
}
