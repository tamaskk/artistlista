import Link from "next/link";

export default function RegisterChooserPage() {
  return (
    <>
      <h1 className="pb-2 font-display text-2xl font-bold tracking-tight">Regisztráció</h1>
      <p className="pb-6 text-sm text-muted">
        Válaszd ki, hogyan használnád az ArtistListet — mindkettő ingyenes.
      </p>
      <div className="flex flex-col gap-4">
        <Link
          href="/register/eloado"
          className="group rounded-2xl border-[1.5px] border-line-strong p-6 transition hover:border-accent"
        >
          <div className="text-lg font-bold group-hover:text-accent">Előadó vagyok 🎤</div>
          <p className="mt-1.5 text-[13.5px] text-muted">
            Saját profil és eseménynaptár — töltsd fel a fellépéseidet, érd el a közönséged.
          </p>
        </Link>
        <Link
          href="/register/menedzsment"
          className="group rounded-2xl border-[1.5px] border-line-strong p-6 transition hover:border-accent"
        >
          <div className="text-lg font-bold group-hover:text-accent">Menedzsment vagyunk 🏢</div>
          <p className="mt-1.5 text-[13.5px] text-muted">
            Több előadó kezelése egy fiókból, csapattagok meghívásával.
          </p>
        </Link>
      </div>
      <div className="pt-5 text-center text-[13px] text-muted">
        Van már fiókod?{" "}
        <Link href="/login" className="font-semibold text-accent">
          Bejelentkezés
        </Link>
      </div>
    </>
  );
}
