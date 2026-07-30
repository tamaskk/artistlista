import { NextRequest, NextResponse } from "next/server";
import { Event, connectDB } from "@artistlist/database";

/**
 * Kedvenc-számláló (event.stats.saves). A kliens localStorage tartja a saját
 * állapotát; ez a szerver-oldali aggregát a "legtöbben bejelölték" szekcióhoz.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const liked = !!body?.liked;
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

  await connectDB();
  await Event.updateOne({ slug }, { $inc: { "stats.saves": liked ? 1 : -1 } });
  // ne mehessen negatívba
  await Event.updateOne({ slug, "stats.saves": { $lt: 0 } }, { $set: { "stats.saves": 0 } });
  return NextResponse.json({ ok: true });
}
