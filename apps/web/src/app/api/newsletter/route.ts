import { NextRequest, NextResponse } from "next/server";
import { Subscriber, connectDB } from "@artistlist/database";
import { allow, ipFrom } from "@/lib/ratelimit";

/** Hírlevél-feliratkozás — feliratkozók DB-be (idempotens upsert). */
export async function POST(req: NextRequest) {
  if (!(await allow("newsletter", ipFrom(req.headers)))) {
    return NextResponse.json({ ok: false, error: "Túl sok kérés — próbáld később." }, { status: 429 });
  }
  const form = await req.formData().catch(() => null);
  const raw = form?.get("email");
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (!email.includes("@") || email.length > 200) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    await connectDB();
    await Subscriber.updateOne(
      { email },
      { $set: { email, source: "footer" }, $unset: { unsubscribedAt: 1 } },
      { upsert: true },
    );
  } catch (e) {
    console.error("[newsletter] mentési hiba:", e);
  }
  return NextResponse.redirect(new URL("/?feliratkozva=1", req.url), 303);
}
