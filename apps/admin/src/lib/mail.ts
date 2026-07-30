/** Email küldés — Resend, ha van kulcs; különben szerverkonzol-napló. */
export async function sendMail(to: string, subject: string, text: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`\n[mail → ${to}] ${subject}\n${text}\n`);
    return;
  }
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "ArtistList <no-reply@artistlist.hu>",
      to,
      subject,
      text,
    }),
  }).catch((e) => console.error("[mail] küldési hiba:", e));
}

export const mailEnabled = () => !!process.env.RESEND_API_KEY;
