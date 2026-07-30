import { NextRequest, NextResponse } from "next/server";
import { Venue, connectDB } from "@artistlist/database";

export async function GET(req: NextRequest) {
  await connectDB();
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json({ venues: [] });
  const rx = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  const venues = await Venue.find({ status: "active", $or: [{ name: rx }, { "address.city": rx }] })
    .limit(10)
    .lean();
  return NextResponse.json({
    venues: venues.map((v) => ({
      id: String(v._id),
      slug: v.slug,
      name: v.name,
      city: v.address.city,
      street: v.address.street,
    })),
  });
}
