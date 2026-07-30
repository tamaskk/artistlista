export interface HeroFilters {
  city: string;
  date: "ma" | "holnap" | "hetvege" | "het" | "honap" | "mind";
  genres: string[];
  priceMax: number | null;
  free: boolean;
  q: string;
  sort: "date" | "price" | "popular";
}

export const DEFAULT_FILTERS: HeroFilters = {
  city: "",
  date: "honap",
  genres: [],
  priceMax: null,
  free: false,
  q: "",
  sort: "date",
};

export const DATE_OPTIONS: { value: HeroFilters["date"]; label: string }[] = [
  { value: "ma", label: "Ma" },
  { value: "holnap", label: "Holnap" },
  { value: "hetvege", label: "Hétvégén" },
  { value: "het", label: "Ezen a héten" },
  { value: "honap", label: "30 napon belül" },
  { value: "mind", label: "Bármikor" },
];

/** Dátumszűrő → from/to (budapesti napokkal közelítve). */
export function dateRange(date: HeroFilters["date"]): { from: Date; to: Date | null } {
  const now = new Date();
  const startOfDay = (d: Date) => {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c;
  };
  const addDays = (d: Date, n: number) => {
    const c = new Date(d);
    c.setDate(c.getDate() + n);
    return c;
  };
  switch (date) {
    case "ma":
      return { from: now, to: addDays(startOfDay(now), 1) };
    case "holnap":
      return { from: addDays(startOfDay(now), 1), to: addDays(startOfDay(now), 2) };
    case "hetvege": {
      const day = now.getDay(); // 0=vasárnap
      const daysToFriday = day === 0 ? -2 : 5 - day;
      const friday = addDays(startOfDay(now), Math.max(daysToFriday, 0));
      const monday = addDays(friday, day === 0 ? 3 : 3);
      return { from: day >= 5 || day === 0 ? now : friday, to: monday };
    }
    case "het":
      return { from: now, to: addDays(startOfDay(now), 7) };
    case "honap":
      return { from: now, to: addDays(startOfDay(now), 30) };
    default:
      return { from: now, to: null };
  }
}

export function filtersToParams(f: HeroFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.city) p.set("varos", f.city);
  if (f.date !== "honap") p.set("datum", f.date);
  if (f.genres.length) p.set("mufaj", f.genres.join(","));
  if (f.priceMax) p.set("maxar", String(f.priceMax));
  if (f.free) p.set("ingyenes", "1");
  if (f.q) p.set("q", f.q);
  if (f.sort !== "date") p.set("rendezes", f.sort);
  return p;
}

export function paramsToFilters(sp: URLSearchParams): HeroFilters {
  return {
    city: sp.get("varos") ?? "",
    date: (sp.get("datum") as HeroFilters["date"]) || "honap",
    genres: sp.get("mufaj")?.split(",").filter(Boolean) ?? [],
    priceMax: sp.get("maxar") ? Number(sp.get("maxar")) : null,
    free: sp.get("ingyenes") === "1",
    q: sp.get("q") ?? "",
    sort: (sp.get("rendezes") as HeroFilters["sort"]) || "date",
  };
}
