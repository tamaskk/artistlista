import { NextRequest, NextResponse } from "next/server";
import { Event, connectDB } from "@artistlist/database";

/**
 * Jegylink-kattintás számláló → átirányít a valódi jegylinkre.
 * A ticketUrl-t a DB-ből olvassuk (nem query-ből), így nem lehet open-redirect.
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  await connectDB();
  const ev = await Event.findOneAndUpdate(
    { slug, status: { $in: ["published", "soldout"] } },
    { $inc: { "stats.ticketClicks": 1 } },
    { new: true, projection: { ticketUrl: 1 } },
  ).lean();
  if (!ev?.ticketUrl) {
    return NextResponse.redirect(new URL(`/esemenyek/${slug}`, _req.url));
  }
  return NextResponse.redirect(ev.ticketUrl);
}
