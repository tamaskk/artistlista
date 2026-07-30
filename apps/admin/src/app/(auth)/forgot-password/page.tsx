import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="text-center">
      <h1 className="pb-3 font-display text-2xl font-bold">Elfelejtett jelszó</h1>
      <p className="pb-5 text-sm text-muted">
        Az önkiszolgáló jelszó-visszaállítás a v1-ben érkezik — addig írj a hello@artistlist.hu
        címre, és segítünk.
      </p>
      <Link
        href="/login"
        className="inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white"
      >
        Vissza a belépéshez
      </Link>
    </div>
  );
}
