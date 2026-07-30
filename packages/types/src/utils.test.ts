import { describe, expect, it } from "vitest";
import { formatHuf, formatPrice, slugify } from "./utils";

describe("slugify", () => {
  it("ékezetmentesít, kisbetűsít, kötőjelez", () => {
    expect(slugify("Azahriah")).toBe("azahriah");
    expect(slugify("Dzsúdló")).toBe("dzsudlo");
    expect(slugify("Beton.Hofi")).toBe("beton-hofi");
    expect(slugify("STRAND Fesztivál")).toBe("strand-fesztival");
    expect(slugify("Bruno x Spacc")).toBe("bruno-x-spacc");
  });
  it("levágja a szél-kötőjeleket és összevonja a jeleket", () => {
    expect(slugify("  --Teszt!!!--  ")).toBe("teszt");
  });
});

describe("formatHuf / formatPrice", () => {
  it("HUF formázás", () => {
    const s = formatHuf(6900);
    expect(s).toContain("6");
    expect(s).toContain("Ft");
  });
  it("ingyenes / ismeretlen / fizetős", () => {
    expect(formatPrice({ kind: "free" })).toBe("Ingyenes");
    expect(formatPrice({ kind: "unknown" })).toBe("");
    expect(formatPrice({ kind: "paid", min: null })).toBe("");
    expect(formatPrice({ kind: "paid", min: 5000 })).toContain("5");
  });
});
