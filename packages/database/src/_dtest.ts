import { submitEventSchema } from "@artistlist/types";

const base = {
  title: "Teszt koncert",
  existingArtistId: "6500000000000000000000aa",
  existingVenueId: "6500000000000000000000bb",
  priceKind: "unknown",
};
const past = submitEventSchema.safeParse({ ...base, startsAt: "2020-01-01T20:00" });
const future = submitEventSchema.safeParse({ ...base, startsAt: "2027-01-01T20:00" });
console.log("múlt elutasítva:", !past.success, past.success ? "" : past.error.issues.map((i) => i.message).join("|"));
console.log("jövő elfogadva:", future.success);
if (past.success || !future.success) {
  console.error("FAIL");
  process.exit(1);
}
console.log("OK");
process.exit(0);
