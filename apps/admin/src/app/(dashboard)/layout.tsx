import { Organization, connectDB } from "@artistlist/database";
import { Sidebar } from "@/components/Sidebar";
import { requireUser } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  let orgName: string | null = null;
  if (user.organizationId) {
    await connectDB();
    const org = await Organization.findById(user.organizationId).select("name").lean();
    orgName = org?.name ?? null;
  }

  return (
    <div className="min-h-screen min-w-[1100px] bg-canvas p-5">
      <div className="flex min-h-[920px] overflow-hidden rounded-frame bg-white shadow-frame">
        <Sidebar user={{ name: user.name, role: user.role, orgName }} />
        <main className="min-w-0 flex-1 px-8 pb-8 pt-6">{children}</main>
      </div>
    </div>
  );
}
