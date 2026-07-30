import type { Metadata } from "next";
import { randomUUID } from "crypto";
import { User, connectDB } from "@artistlist/database";
import { PageFrame } from "@/components/PageFrame";
import { getSessionUser } from "@/lib/session";
import { FavoritesList } from "./FavoritesList";
import { CalendarFeed } from "./CalendarFeed";

export const metadata: Metadata = { title: "Kedvencek" };

const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || "https://koncertlista.hu";

/** Belépett usernek egyszer generál egy titkos naptár-token-t (feed-hez). */
async function ensureCalendarUrl(userId: string): Promise<string | null> {
  await connectDB();
  const u = await User.findById(userId).select("calendarToken").lean();
  if (!u) return null;
  let token = u.calendarToken;
  if (!token) {
    token = (randomUUID() + randomUUID()).replace(/-/g, "");
    await User.updateOne({ _id: userId }, { $set: { calendarToken: token } });
  }
  return `${WEB_URL}/api/calendar/${token}`;
}

export default async function FavoritesPage() {
  const u = await getSessionUser();
  const feedUrl = u ? await ensureCalendarUrl(u.id) : null;

  return (
    <PageFrame active="/kedvencek">
      <div className="mt-8">
        <h1 className="font-display text-[32px] font-bold tracking-tight">Kedvencek</h1>
        <p className="mt-2 text-[15px] text-muted">
          {u
            ? "A mentett események a fiókodhoz kötve, minden eszközön elérhetők."
            : "A mentett események ezen az eszközön tárolódnak. Jelentkezz be a szinkronhoz."}
        </p>
        {feedUrl && <CalendarFeed url={feedUrl} />}
        <FavoritesList />
      </div>
    </PageFrame>
  );
}
