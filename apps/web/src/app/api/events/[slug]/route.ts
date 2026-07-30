import { NextRequest, NextResponse } from "next/server";
import { getEventBySlug } from "@/lib/data";
import { toEventCard } from "@/lib/serialize";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const data = await getEventBySlug(slug);
  if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(
    {
      event: {
        ...toEventCard(data.event),
        description: data.event.description,
        ticketUrl: data.event.ticketUrl ?? null,
        doorsAt: data.event.doorsAt ? new Date(data.event.doorsAt).toISOString() : null,
      },
      lineup: data.lineup,
      venue: data.venue
        ? {
            slug: data.venue.slug,
            name: data.venue.name,
            city: data.venue.address.city,
            street: data.venue.address.street,
            lng: data.venue.location.coordinates[0],
            lat: data.venue.location.coordinates[1],
          }
        : null,
    },
    { headers: { "Cache-Control": "public, s-maxage=60" } },
  );
}
