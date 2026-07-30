import { NextRequest, NextResponse } from "next/server";
import { searchAll } from "@/lib/data";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json({ artists: [], events: [], venues: [] });
  const results = await searchAll(q.slice(0, 120));
  return NextResponse.json(results, {
    headers: { "Cache-Control": "public, s-maxage=30" },
  });
}
