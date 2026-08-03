/**
 * Közös UI-primitívek (web + admin). Design-tokeneket használ
 * (bg-surface, border-line, accent, ink…), amelyeket mindkét app @theme-je
 * definiál — így a web sötét módja is működik rajtuk.
 */

export const inputCls =
  "rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-[13.5px] outline-none transition focus:border-accent focus:ring-[3px] focus:ring-accent/15";

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-ink-soft">{label}</label>
      {children}
      {error?.[0] && <span className="text-xs text-bad">{error[0]}</span>}
    </div>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-full bg-ink px-[18px] py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-ink-hover disabled:opacity-50 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-full border border-line-strong bg-surface px-4 py-2 text-[13px] font-semibold transition hover:border-accent hover:text-accent disabled:opacity-50 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-card border border-line bg-surface p-5 ${className}`}>{children}</div>
  );
}

/** Monogram-avatar (kép hiányában). */
export function InitialsAvatar({
  name,
  size = 40,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-[10px] bg-accent/10 font-bold text-accent ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.3 }}
    >
      {initials}
    </div>
  );
}
