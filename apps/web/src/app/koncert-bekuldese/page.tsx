import Link from "next/link";
import { PageFrame } from "@/components/PageFrame";
import { ClearSubmitDraft } from "@/components/submit/ClearSubmitDraft";
import { SubmitEventForm } from "@/components/submit/SubmitEventForm";
import { logoutFan } from "@/actions/auth";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Koncert beküldése" };

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ bekuldve?: string; uj?: string }>;
}) {
  const user = await getSessionUser();
  const { bekuldve, uj } = await searchParams;

  return (
    <PageFrame>
      <div className="mx-auto max-w-[640px] py-6">
        {bekuldve === "1" ? (
          <div className="rounded-[24px] border border-ok/30 bg-ok/5 p-8 text-center">
            <ClearSubmitDraft />
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ok text-white">
              ✓
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Köszönjük a beküldést!</h1>
            <p className="mx-auto mt-2 max-w-md text-[14px] text-muted">
              A koncert <strong>jóváhagyásra vár</strong>.{" "}
              {uj === "1"
                ? "Mivel új előadót hoztál létre, a csapatunk (superadmin) ellenőrzi és élesíti."
                : "Az előadó menedzsmentje vagy maga az előadó hagyja jóvá — utána megjelenik a térképen."}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/koncert-bekuldese"
                className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-hover"
              >
                Új koncert beküldése
              </Link>
              <Link
                href="/bekuldeseim"
                className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold hover:bg-chip"
              >
                Beküldéseim státusza →
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-[28px] font-bold tracking-tight">Koncert beküldése</h1>
                <p className="mt-1 text-[14px] text-muted">
                  Lemaradt egy fellépés? Töltsd fel — moderálás után megjelenik a térképen és a listában.
                </p>
              </div>
              {user ? (
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Link
                    href="/bekuldeseim"
                    className="whitespace-nowrap text-[13px] font-semibold text-accent hover:text-accent-deep"
                  >
                    Beküldéseim →
                  </Link>
                  <form action={logoutFan}>
                    <button className="whitespace-nowrap text-[13px] font-semibold text-muted hover:text-fg">
                      {user.name} · Kilépés
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/belepes?from=/koncert-bekuldese"
                  className="shrink-0 whitespace-nowrap text-[13px] font-semibold text-accent hover:text-accent-deep"
                >
                  Belépés →
                </Link>
              )}
            </div>
            {!user && (
              <div className="mb-5 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-[13.5px] text-ink-soft">
                Töltsd ki nyugodtan — a <strong>beküldéshez ingyenes fiók</strong> kell (kb. 30 mp).
                A kitöltött adataidat megőrizzük a regisztráció idejére.
              </div>
            )}
            <SubmitEventForm loggedIn={!!user} />
          </>
        )}
      </div>
    </PageFrame>
  );
}
