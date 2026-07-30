"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";

const NAV = [
  { href: "/vezerlopult", label: "Vezérlőpult" },
  { href: "/jovahagyas", label: "Jóváhagyás" },
  { href: "/esemenyek", label: "Eseményeim" },
  { href: "/kiemeles", label: "★ Kiemelés" },
  { href: "/eloadok", label: "Előadóim" },
  { href: "/helyszinek", label: "Helyszínek" },
  { href: "/media", label: "Média" },
  { href: "/statisztikak", label: "Statisztikák" },
  { href: "/csapat", label: "Csapat", roles: ["MANAGER", "SUPER_ADMIN"] },
  { href: "/beallitasok", label: "Beállítások" },
];

const ADMIN_NAV = [
  { href: "/admin/moderacio", label: "Moderáció" },
  { href: "/admin/felhasznalok", label: "Felhasználók" },
  { href: "/admin/kiemelesek", label: "Kiemelések" },
];

export function Sidebar({
  user,
}: {
  user: { name: string; role: string; orgName?: string | null };
}) {
  const pathname = usePathname();
  const initials = user.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const item = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-2.5 rounded-full px-3 py-[9px] text-sm transition ${
          active
            ? "bg-accent/10 font-semibold text-accent"
            : "font-medium text-ink-soft hover:bg-chip"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line px-4 pb-5 pt-6">
      <div className="flex items-baseline gap-2 px-3 pb-6">
        <span className="font-display text-xl font-bold tracking-tight">ArtistList</span>
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted">
          Admin
        </span>
      </div>
      <nav className="flex flex-col gap-0.5">
        {NAV.filter((n) => !n.roles || n.roles.includes(user.role)).map((n) =>
          item(n.href, n.label),
        )}
        {user.role === "SUPER_ADMIN" && (
          <>
            <div className="mt-4 px-3 pb-1 text-[11px] font-bold uppercase tracking-widest text-muted">
              Platform
            </div>
            {ADMIN_NAV.map((n) => item(n.href, n.label))}
          </>
        )}
      </nav>
      <div className="mt-auto flex flex-col gap-3">
        <div className="flex items-center gap-2.5 rounded-[14px] border border-line px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[13px] font-semibold">{user.name}</span>
            <span className="truncate text-[11.5px] text-muted">
              {user.orgName ?? user.role}
            </span>
          </div>
        </div>
        <form action={logoutAction}>
          <button className="px-3 text-[13px] text-muted transition hover:text-ink">
            Kijelentkezés
          </button>
        </form>
      </div>
    </aside>
  );
}
