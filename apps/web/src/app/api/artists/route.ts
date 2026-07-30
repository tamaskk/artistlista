import { NextRequest, NextResponse } from "next/server";
import { getArtistCatalog } from "@/lib/data";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const artists = await getArtistCatalog({
    q: sp.get("q") ?? undefined,
    genre: sp.get("genre") ?? undefined,
    letter: sp.get("letter") ?? undefined,
  });
  return NextResponse.json(
    { artists },
    { headers: { "Cache-Control": "public, s-maxage=60" } },
  );
}
