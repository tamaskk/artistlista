import { NextRequest, NextResponse } from "next/server";
import { Event, connectDB } from "@artistlist/database";

const PUBLIC_STATUSES = ["published", "soldout", "cancelled"];

/** Városnevek (autocomplete-hez) — a látható események városaiból, ábécésorrendben. */
export async function GET(req: NextRequest) {
  await connectDB();
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase();
  const cities = (await Event.distinct("city", {
    status: { $in: PUBLIC_STATUSES },
  })) as string[];
  let list = cities.map((c) => String(c).trim()).filter(Boolean);
  if (q) list = list.filter((c) => c.toLowerCase().includes(q));
  list.sort((a, b) => a.localeCompare(b, "hu"));
  return NextResponse.json(
    { cities: list.slice(0, 12) },
    { headers: { "Cache-Control": "public, s-maxage=120" } },
  );
}
