export interface PublicEventCard {
  id: string;
  slug: string;
  title: string;
  artistNames: string[];
  venueName: string;
  city: string;
  startsAt: string; // ISO
  price: { kind: "free" | "paid" | "unknown"; min?: number | null; max?: number | null };
  status: "published" | "cancelled" | "soldout";
  image: string;
  genres: string[];
  lng: number;
  lat: number;
  venueType?: string;
  promoTier?: number; // 0 = nincs kiemelés, 1..5 aktív tier
  saves?: number; // kedvenc-számláló
}

export interface EventsApiResponse {
  events: PublicEventCard[];
  promoted?: PublicEventCard[];
  pins: { id: string; slug: string; lng: number; lat: number }[];
  total: number;
  nextCursor: string | null;
  tooMany: boolean;
}
