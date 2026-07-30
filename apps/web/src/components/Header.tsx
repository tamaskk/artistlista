import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

const nav = [
  { href: "/", label: "Főoldal" },
  { href: "/esemenyek", label: "Események" },
  { href: "/eloadok", label: "Előadók", isNew: true },
  { href: "/helyszinek", label: "Helyszínek" },
  { href: "/kedvencek", label: "Kedvencek" },
];

export function Header({ active }: { active?: string }) {
  return (
    <header className="flex items-center justify-between gap-6 border-b border-line pb-6">
      <Link href="/" className="font-display text-[26px] font-extrabold tracking-tight">
        ArtistList
      </Link>
      <nav className="hidden items-center gap-7 text-[15px] font-medium text-ink-soft md:flex">
        {nav.map((item) => (
          <span key={item.href} className="flex items-center gap-1.5">
            <Link
              href={item.href}
              className={
                active === item.href
                  ? "border-b-2 border-ink pb-0.5 font-semibold text-fg"
                  : "hover:text-fg"
              }
            >
              {item.label}
            </Link>
            {item.isNew && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">
                Új
              </span>
            )}
          </span>
        ))}
      </nav>
      <div className="flex items-center gap-3.5">
        <ThemeToggle />
        <a
          href={`${ADMIN_URL}/register`}
          className="hidden text-sm font-medium text-ink-soft transition hover:text-fg sm:block"
        >
          Előadóknak
        </a>
        <Link
          href="/koncert-bekuldese"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#26262e]"
        >
          Koncert beküldése
        </Link>
      </div>
    </header>
  );
}
