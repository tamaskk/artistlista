import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-[420px]">
        <Link
          href="/"
          className="mb-6 block text-center font-display text-[26px] font-extrabold tracking-tight"
        >
          ArtistList
        </Link>
        <div className="rounded-[28px] bg-surface p-8 shadow-frame">{children}</div>
        <p className="mt-5 text-center text-xs text-muted">
          Előadó vagy menedzsment vagy?{" "}
          <a
            href={`${process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001"}/register`}
            className="font-semibold text-accent hover:text-accent-deep"
          >
            Itt regisztrálj →
          </a>
        </p>
      </div>
    </div>
  );
}
