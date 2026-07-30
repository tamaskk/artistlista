import Link from "next/link";
import { verifyEmailToken } from "@/actions/auth";

export default async function VerifyEmailPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await props.searchParams;
  const ok = token ? await verifyEmailToken(token) : false;

  return (
    <div className="text-center">
      {ok ? (
        <>
          <h1 className="pb-3 font-display text-2xl font-bold">E-mail megerősítve ✓</h1>
          <p className="pb-5 text-sm text-muted">A fiókod aktív — jelentkezz be!</p>
        </>
      ) : (
        <>
          <h1 className="pb-3 font-display text-2xl font-bold">Érvénytelen link</h1>
          <p className="pb-5 text-sm text-muted">
            A megerősítő link lejárt vagy hibás. Jelentkezz be, és kérj újat.
          </p>
        </>
      )}
      <Link
        href="/login"
        className="inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white"
      >
        Bejelentkezés
      </Link>
    </div>
  );
}
