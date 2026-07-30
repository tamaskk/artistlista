export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-[520px]">
        <div className="pb-6 text-center">
          <span className="font-display text-2xl font-bold tracking-tight">ArtistList</span>
          <span className="ml-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
            Admin
          </span>
        </div>
        <div className="rounded-frame bg-white p-8 shadow-frame">{children}</div>
      </div>
    </div>
  );
}
