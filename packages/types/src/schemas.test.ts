import { describe, expect, it } from "vitest";
import {
  eventSchema,
  registerFanSchema,
  startOfToday,
  submitEventSchema,
} from "./schemas";

const future = new Date(Date.now() + 30 * 864e5).toISOString();
const past = "2020-01-01T20:00";

describe("startOfToday", () => {
  it("ma 00:00-t ad", () => {
    const d = startOfToday();
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
  });
});

describe("submitEventSchema (publikus beküldés)", () => {
  const base = { title: "Teszt koncert", existingArtistId: "aid", existingVenueId: "vid" };

  it("múltbéli dátumot elutasít", () => {
    expect(submitEventSchema.safeParse({ ...base, startsAt: past }).success).toBe(false);
  });
  it("jövőbeli dátumot elfogad", () => {
    expect(submitEventSchema.safeParse({ ...base, startsAt: future }).success).toBe(true);
  });
  it("előadó nélkül elutasít", () => {
    const r = submitEventSchema.safeParse({ title: "X", startsAt: future, existingVenueId: "vid" });
    expect(r.success).toBe(false);
  });
  it("helyszín nélkül elutasít", () => {
    const r = submitEventSchema.safeParse({ ...base, existingVenueId: "", startsAt: future });
    expect(r.success).toBe(false);
  });
});

describe("registerFanSchema", () => {
  it("rövid jelszót elutasít (<8)", () => {
    const r = registerFanSchema.safeParse({ name: "Tesztelő", email: "a@b.hu", password: "rovid" });
    expect(r.success).toBe(false);
  });
  it("érvényes adatot elfogad", () => {
    const r = registerFanSchema.safeParse({
      name: "Tesztelő",
      email: "a@b.hu",
      password: "legalabb8",
    });
    expect(r.success).toBe(true);
  });
});

describe("eventSchema (admin)", () => {
  const ev = { title: "Koncert", artistIds: ["aid"], venueId: "vid" };
  it("fizetős esemény min-ár nélkül elutasít", () => {
    const r = eventSchema.safeParse({ ...ev, startsAt: future, priceKind: "paid" });
    expect(r.success).toBe(false);
  });
  it("fizetős esemény min-árral elfogad", () => {
    const r = eventSchema.safeParse({ ...ev, startsAt: future, priceKind: "paid", priceMin: 4900 });
    expect(r.success).toBe(true);
  });
  // Megjegyzés: az eventSchema SZÁNDÉKOSAN engedi a múltbéli dátumot (meglévő
  // esemény szerkesztéséhez); a múlt-tiltás a createEvent actionben van.
});
