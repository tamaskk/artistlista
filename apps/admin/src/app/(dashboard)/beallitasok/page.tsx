import { Organization, connectDB } from "@artistlist/database";
import { PageHeader } from "@/components/PageHeader";
import { PasswordChangeForm } from "@/components/PasswordChangeForm";
import { Card, inputCls } from "@/components/ui";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  let org = null;
  if (user.organizationId) {
    await connectDB();
    org = await Organization.findById(user.organizationId).lean();
  }

  return (
    <>
      <PageHeader crumb="Beállítások" title="Beállítások" />
      <div className="grid max-w-4xl grid-cols-2 items-start gap-4">
        <Card className="flex flex-col gap-4 p-6">
          <span className="text-[15px] font-semibold">Fiók</span>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink-soft">Név</label>
            <input defaultValue={user.name} disabled className={`${inputCls} opacity-70`} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink-soft">E-mail</label>
            <input defaultValue={user.email} disabled className={`${inputCls} opacity-70`} />
          </div>
          <PasswordChangeForm />
        </Card>
        {org && (
          <Card className="flex flex-col gap-4 p-6">
            <span className="text-[15px] font-semibold">Ügynökség adatai</span>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-soft">Ügynökség neve</label>
              <input defaultValue={org.name} disabled className={`${inputCls} opacity-70`} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-soft">Kapcsolattartó e-mail</label>
              <input defaultValue={org.contactEmail} disabled className={`${inputCls} opacity-70`} />
            </div>
            {org.website && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink-soft">Weboldal</label>
                <input defaultValue={org.website} disabled className={`${inputCls} opacity-70`} />
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
