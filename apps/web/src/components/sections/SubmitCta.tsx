import Link from "next/link";

const STEPS = [
  { n: "1", t: "Regisztrálj", d: "Nem kell előadónak lenned — elég egy sima fiók pár másodperc alatt." },
  { n: "2", t: "Válaszd ki az előadót", d: "Már fenn van? Válaszd ki. Ha nincs, hozd létre — ilyenkor jóváhagyásra kerül." },
  { n: "3", t: "Küldd be", d: "Moderálás után a koncert megjelenik a térképen és a listában." },
];

/** Landing-szekció: bárki (bejelentkezett külsős user) beküldhet koncertet. */
export function SubmitCta() {
  return (
    <section className="my-14">
      <div className="overflow-hidden rounded-frame bg-ink px-7 py-10 text-white md:px-12 md:py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white/80">
              Közösségi feltöltés
            </span>
            <h2 className="mt-3 font-display text-[30px] font-bold leading-tight tracking-tight md:text-[36px]">
              Lemaradt egy koncert? Töltsd fel te!
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/70">
              Ismersz egy fellépést, ami nincs fenn? Bárki beküldheti — nem kell hozzá előadónak vagy
              menedzsmentnek lenned, csak egy ingyenes fiók. A moderálás után kikerül az oldalra.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/koncert-bekuldese"
                className="rounded-full bg-surface px-6 py-3 text-sm font-semibold text-fg transition hover:bg-white/90"
              >
                Koncert beküldése →
              </Link>
              <Link
                href="/regisztracio"
                className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Regisztráció
              </Link>
            </div>
          </div>
          <ol className="grid shrink-0 gap-4 md:w-[340px]">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/12 text-[14px] font-bold text-white">
                  {s.n}
                </span>
                <div>
                  <div className="text-[14.5px] font-semibold">{s.t}</div>
                  <div className="text-[13px] leading-snug text-white/60">{s.d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
