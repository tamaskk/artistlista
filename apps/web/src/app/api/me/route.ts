import { NextResponse } from "next/server";
import { User, connectDB } from "@artistlist/database";
import { getSessionUser } from "@/lib/session";

/** A bejelentkezett user kedvencei + követései (a kliens-provider ezt tölti be). */
export async function GET() {
  const u = await getSessionUser();
  if (!u) return NextResponse.json({ loggedIn: false, favorites: [], follows: [] });
  await connectDB();
  const doc = await User.findById(u.id)
    .select("savedEventSlugs followedArtistIds followedCities followedGenres")
    .lean();
  return NextResponse.json({
    loggedIn: true,
    name: u.name,
    favorites: doc?.savedEventSlugs ?? [],
    follows: (doc?.followedArtistIds ?? []).map(String),
    cities: doc?.followedCities ?? [],
    genres: doc?.followedGenres ?? [],
  });
}
