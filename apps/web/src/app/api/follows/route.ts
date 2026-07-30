import { NextRequest, NextResponse } from "next/server";
import { Artist, User, connectDB } from "@artistlist/database";
import { getSessionUser } from "@/lib/session";

/** Előadó-követés toggle a fiókban. Body: { artistId, on } */
export async function POST(req: NextRequest) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });
  const { artistId, on } = await req.json().catch(() => ({}));
  if (!artistId || typeof artistId !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await connectDB();
  if (on && !(await Artist.exists({ _id: artistId }))) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  const res = await User.updateOne(
    { _id: u.id },
    on ? { $addToSet: { followedArtistIds: artistId } } : { $pull: { followedArtistIds: artistId } },
  );
  // valós követő-számláló az előadón (csak tényleges változáskor)
  if (res.modifiedCount > 0) {
    await Artist.updateOne({ _id: artistId }, { $inc: { "stats.followers": on ? 1 : -1 } });
  }
  return NextResponse.json({ ok: true });
}
