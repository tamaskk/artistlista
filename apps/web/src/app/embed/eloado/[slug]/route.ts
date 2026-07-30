import { NextRequest, NextResponse } from "next/server";
import { Artist, Event, connectDB } from "@artistlist/database";
import { formatEventDate } from "@artistlist/types";

const WEB_URL = () => process.env.NEXT_PUBLIC_WEB_URL || "https://koncertlista.hu";

function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Beágyazható widget: „Következő koncertjeim" — az előadó saját weboldalára.
 * Önálló HTML dokumentum (nincs nav/app-shell), bárhonnan iframe-elhető.
 * Használat: <iframe src="https://koncertlista.hu/embed/eloado/<slug>" ...>
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  await connectDB();
  const a = await Artist.findOne({ slug, status: "published" }).select("name slug").lean();

  const rows: string[] = [];
  if (a) {
    const events = await Event.find({
      artistIds: a._id,
      status: { $in: ["published", "soldout"] },
      startsAt: { $gte: new Date() },
    })
      .sort({ startsAt: 1 })
      .limit(6)
      .lean();
    for (const e of events) {
      const href = `${WEB_URL()}/esemenyek/${e.slug}`;
      rows.push(
        `<a class="ev" href="${href}" target="_blank" rel="noopener">
          <span class="date">${esc(formatEventDate(e.startsAt))}</span>
          <span class="body"><span class="t">${esc(e.title)}</span>
          <span class="v">${esc(e.venueName)} · ${esc(e.city)}</span></span>
          <span class="go">→</span>
        </a>`,
      );
    }
  }

  const inner = !a
    ? `<p class="empty">Előadó nem található.</p>`
    : rows.length
      ? rows.join("")
      : `<p class="empty">Jelenleg nincs meghirdetett fellépés.</p>`;

  const title = a ? `${esc(a.name)} — következő koncertek` : "Koncertlista";
  const html = `<!doctype html><html lang="hu"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  *{box-sizing:border-box;margin:0}
  body{font:14px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:#1a1a22;background:#fff;padding:12px}
  .hd{font-weight:700;font-size:15px;margin:2px 4px 10px}
  .ev{display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid #ececf2;border-radius:12px;margin-bottom:8px;text-decoration:none;color:inherit;transition:background .15s}
  .ev:hover{background:#f7f7fb}
  .date{flex:0 0 auto;font-weight:700;font-size:12px;color:#6c47ff;min-width:82px}
  .body{display:flex;flex-direction:column;min-width:0;flex:1}
  .t{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .v{font-size:12px;color:#6b6b76;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .go{color:#b7b7c2}
  .empty{color:#6b6b76;padding:16px 4px}
  .ft{margin:8px 4px 2px;font-size:11px;color:#9a9aa6}
  .ft a{color:#6c47ff;text-decoration:none;font-weight:600}
  @media(prefers-color-scheme:dark){
    body{background:#12131a;color:#f1f2f8}
    .ev{border-color:#262832}.ev:hover{background:#1b1d27}
    .v,.empty{color:#9a9aa6}
  }
</style></head><body>
  ${a ? `<div class="hd">${esc(a.name)} — következő koncertek</div>` : ""}
  ${inner}
  <div class="ft">Powered by <a href="${WEB_URL()}${a ? `/eloadok/${esc(a.slug)}` : ""}" target="_blank" rel="noopener">Koncertlista</a></div>
</body></html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}
