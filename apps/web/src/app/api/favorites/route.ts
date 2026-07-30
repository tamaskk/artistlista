import { NextRequest, NextResponse } from "next/server";
import { User, connectDB } from "@artistlist/database";
import { getSessionUser } from "@/lib/session";

/**
 * Kedvenc esemény toggle-je a fiókban.
 * Body: { slug, on } egyedi váltáshoz, VAGY { merge: string[] } a vendég-
 * (localStorage) kedvencek fiókba olvasztásához belépéskor.
 */
export async function POST(req: NextRequest) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  await connectDB();

  if (Array.isArray(body.merge)) {
    const slugs = body.merge.map(String).filter(Boolean).slice(0, 500);
    if (slugs.length) {
      await User.updateOne({ _id: u.id }, { $addToSet: { savedEventSlugs: { $each: slugs } } });
    }
    return NextResponse.json({ ok: true });
  }

  const slug = String(body.slug ?? "");
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });
  await User.updateOne(
    { _id: u.id },
    body.on ? { $addToSet: { savedEventSlugs: slug } } : { $pull: { savedEventSlugs: slug } },
  );
  return NextResponse.json({ ok: true });
}
