import Link from "next/link";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line pt-11">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-[1.2fr_1fr_1fr_1fr_1.6fr]">
        <div>
          <div className="font-display text-[22px] font-extrabold tracking-tight">ArtistList</div>
          <p className="mt-3 max-w-[220px] text-[13px] text-muted">
            Magyar előadók és fellépések egy helyen — térképen, szűrhetően.
          </p>
        </div>
        <FooterCol
          title="Felfedezés"
          links={[
            ["/esemenyek", "Események"],
            ["/eloadok", "Előadók"],
            ["/helyszinek", "Helyszínek"],
            ["/varosok/budapest", "Városok"],
          ]}
        />
        <FooterCol
          title="Előadóknak"
          links={[
            [`${ADMIN_URL}/register`, "Regisztráció"],
            ["/gyik", "GYIK"],
            ["/kapcsolat", "Kapcsolat"],
          ]}
        />
        <FooterCol
          title="Jogi"
          links={[
            ["/aszf", "ÁSZF"],
            ["/adatkezeles", "Adatvédelem"],
            ["/cookie-tajekoztato", "Cookie tájékoztató"],
            ["/impresszum", "Impresszum"],
          ]}
        />
        <div>
          <div className="mb-3 text-sm font-semibold">Heti programajánló a postaládádba</div>
          <form className="flex gap-2" action="/api/newsletter" method="post">
            <input
              type="email"
              name="email"
              required
              placeholder="E-mail címed"
              className="min-w-0 flex-1 rounded-full border-[1.5px] border-line-strong px-4 py-2.5 text-sm outline-none focus:border-accent"
            />
            <button className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#26262e]">
              Feliratkozom
            </button>
          </form>
        </div>
      </div>
      <div className="mt-10 border-t border-line pt-5 text-[13px] text-faint">
        © {new Date().getFullYear()} ArtistList
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="mb-3.5 text-[13px] font-bold uppercase tracking-wider text-faint">
        {title}
      </div>
      <div className="flex flex-col gap-2.5 text-sm">
        {links.map(([href, label]) =>
          href.startsWith("http") ? (
            <a key={href} href={href} className="text-ink-soft hover:text-ink">
              {label}
            </a>
          ) : (
            <Link key={href} href={href} className="text-ink-soft hover:text-ink">
              {label}
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
