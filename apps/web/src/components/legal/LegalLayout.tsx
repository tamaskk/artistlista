import { PageFrame } from "@/components/PageFrame";

/**
 * Közös elrendezés a jogi oldalakhoz (ÁSZF, Adatvédelem, Cookie).
 * A prose-stílust arbitrary child-szelektorok adják (nincs typography plugin).
 */
export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <PageFrame>
      <article
        className="mx-auto mt-8 max-w-3xl pb-12 text-[15px] leading-relaxed [&_a]:font-semibold [&_a]:text-accent [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-[22px] [&_h2]:font-bold [&_h2]:tracking-tight [&_h3]:mt-6 [&_h3]:text-[16px] [&_h3]:font-semibold [&_li]:mt-1.5 [&_p]:mt-3 [&_p]:text-ink-soft [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-line [&_td]:p-2.5 [&_td]:align-top [&_th]:border [&_th]:border-line [&_th]:bg-chip [&_th]:p-2.5 [&_th]:text-left [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-ink-soft"
      >
        <h1 className="font-display text-[34px] font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-[13px] text-muted">Hatályos / utolsó frissítés: {updated}</p>

        <div className="mt-5 rounded-2xl border border-warn/30 bg-warn/5 px-5 py-4 text-[13.5px] text-ink-soft">
          <strong>Fontos:</strong> Ez a dokumentum <strong>sablon</strong>. A{" "}
          <code className="rounded bg-chip px-1">[szögletes zárójeles]</code> mezőket töltsd ki az
          üzemeltető valós adataival (cégnév, székhely, adószám, elérhetőség, tárhelyszolgáltató
          stb.), és a végleges változatot <strong>ellenőriztesd jogi szakértővel</strong>. A minta
          a hatályos magyar jogszabályok és a GDPR figyelembevételével készült, de nem helyettesíti
          az egyedi jogi tanácsadást.
        </div>

        {children}
      </article>
    </PageFrame>
  );
}
