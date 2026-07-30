import { NextRequest, NextResponse } from "next/server";
import { allow, ipFrom } from "@/lib/ratelimit";

/** Hírlevél-feliratkozás — Resend audience v1-ben; MVP: naplózás. */
export async function POST(req: NextRequest) {
  if (!(await allow("newsletter", ipFrom(req.headers)))) {
    return NextResponse.json({ ok: false, error: "Túl sok kérés — próbáld később." }, { status: 429 });
  }
  const form = await req.formData().catch(() => null);
  const email = form?.get("email");
  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  console.log("[newsletter] feliratkozás:", email);
  return NextResponse.redirect(new URL("/?feliratkozva=1", req.url), 303);
}
