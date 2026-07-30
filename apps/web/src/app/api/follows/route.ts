import { NextRequest, NextResponse } from "next/server";
import { Artist, User, connectDB } from "@artistlist/database";
import { getSessionUser } from "@/lib/session";

/**
 * Követés toggle a fiókban. Body:
 *   előadó:  { artistId, on }            (visszafelé kompatibilis)
 *   város:   { kind:"city",  value, on }
 *   műfaj:   { kind:"genre", value, on } (value = műfaj-slug)
 */
export async function POST(req: NextRequest) {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const on = !!body.on;
  await connectDB();

  const kind: string = body.kind ?? (body.artistId ? "artist" : "");

  if (kind === "artist") {
    const artistId = body.artistId;
    if (!artistId || typeof artistId !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    if (on && !(await Artist.exists({ _id: artistId }))) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }
    const res = await User.updateOne(
      { _id: u.id },
      on
        ? { $addToSet: { followedArtistIds: artistId } }
        : { $pull: { followedArtistIds: artistId } },
    );
    if (res.modifiedCount > 0) {
      await Artist.updateOne({ _id: artistId }, { $inc: { "stats.followers": on ? 1 : -1 } });
    }
    return NextResponse.json({ ok: true });
  }

  if (kind === "city" || kind === "genre") {
    const value = typeof body.value === "string" ? body.value.trim() : "";
    if (!value) return NextResponse.json({ ok: false }, { status: 400 });
    const field = kind === "city" ? "followedCities" : "followedGenres";
    await User.updateOne(
      { _id: u.id },
      on ? { $addToSet: { [field]: value } } : { $pull: { [field]: value } },
    );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "bad_kind" }, { status: 400 });
}
