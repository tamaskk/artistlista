import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Egyszerű .env-betöltő a monorepo gyökérből — CSAK a CLI-scriptekhez
 * (seed/cleanup). tsx nem tölti a .env-et, ezért enélkül a scriptek a lokális
 * mongóra defaultolnának. A futó appok a saját env-jüket kapják (Next/Vercel).
 */
export function loadRootEnv(): void {
  for (const rel of ["../../.env", ".env"]) {
    try {
      const txt = readFileSync(resolve(process.cwd(), rel), "utf8");
      for (const line of txt.split("\n")) {
        const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
        if (!m || line.trim().startsWith("#")) continue;
        const key = m[1];
        const val = m[2].replace(/^["']|["']$/g, "");
        if (!(key in process.env)) process.env[key] = val;
      }
      return; // első megtalált .env elég
    } catch {
      /* nincs ott .env — próbáljuk a következő helyet */
    }
  }
}
