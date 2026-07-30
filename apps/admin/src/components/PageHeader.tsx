import Link from "next/link";

export function PageHeader({
  crumb,
  title,
  action,
}: {
  crumb?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-5 pb-6">
      <div className="flex flex-col gap-0.5">
        {crumb && <span className="text-xs text-muted">{crumb}</span>}
        <h1 className="font-display text-[26px] font-bold tracking-tight">{title}</h1>
      </div>
      <div className="ml-auto flex items-center gap-3.5">{action}</div>
    </div>
  );
}

export function NewButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full bg-ink px-[18px] py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[#26262E]"
    >
      ＋ {label}
    </Link>
  );
}
