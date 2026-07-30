import { NextRequest, NextResponse } from "next/server";
import { Event, connectDB } from "@artistlist/database";

/** Megtekintés-számláló (kliens-beacon; ISR miatt nem szerver-oldalon számoljuk). */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  await connectDB();
  await Event.updateOne(
    { slug, status: { $in: ["published", "soldout"] } },
    { $inc: { "stats.views": 1 } },
  );
  return NextResponse.json({ ok: true });
}
