"use server";

import { revalidatePath } from "next/cache";
import { Event, connectDB } from "@artistlist/database";
import { promoQuote, type ActionResult } from "@artistlist/types";
import { canManageEvent, requireUser } from "@/lib/session";

/**
 * Kiemelés (hirdetés) vásárlása — MVP: szimulált fizetés, azonnal aktív.
 * Ha van aktív kiemelés, a hozzáadott időtartam a végéhez adódik.
 */
export async function purchasePromotion(
  eventId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!(await canManageEvent(user, eventId))) {
    return { ok: false, error: "Nincs jogosultságod ehhez az eseményhez." };
  }
  const tier = Number(formData.get("tier"));
  const durationKey = String(formData.get("durationKey") ?? "");
  const quote = promoQuote(tier, durationKey);
  if (!quote) return { ok: false, error: "Érvénytelen csomag." };

  await connectDB();
  const now = new Date();
  const ev = await Event.findById(eventId).select("promotion");
  const current = ev?.promotion;
  // azonos tier + aktív → hosszabbítás; egyébként most indul az új tier
  const base =
    current?.tier === tier && current?.activeUntil && new Date(current.activeUntil) > now
      ? new Date(current.activeUntil)
      : now;
  const activeUntil = new Date(base.getTime() + quote.days * 86400000);

  await Event.updateOne(
    { _id: eventId },
    {
      $set: {
        "promotion.tier": tier,
        "promotion.activeUntil": activeUntil,
        "promotion.purchasedAt": now,
      },
    },
  );
  revalidatePath("/esemenyek");
  revalidatePath(`/esemenyek/${eventId}/szerkesztes`);
  return { ok: true };
}

export async function cancelPromotion(eventId: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!(await canManageEvent(user, eventId))) {
    return { ok: false, error: "Nincs jogosultságod ehhez az eseményhez." };
  }
  await connectDB();
  await Event.updateOne(
    { _id: eventId },
    { $set: { "promotion.tier": 0 }, $unset: { "promotion.activeUntil": 1 } },
  );
  revalidatePath("/esemenyek");
  revalidatePath(`/esemenyek/${eventId}/szerkesztes`);
  return { ok: true };
}
