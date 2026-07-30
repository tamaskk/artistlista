# Koncertlista

Magyar előadó- és koncert-felfedező platform — koncertek térképen és listában,
szűrhetően városra, dátumra, műfajra és árra. Publikus feltöltés jóváhagyással,
előadó/menedzsment fiókok, fizetős kiemelés.

- **Web** (publikus): [koncertlista.hu](https://koncertlista.hu)
- **Admin**: [admin.koncertlista.hu](https://admin.koncertlista.hu)

## Tech stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Web/Admin**: Next.js 15 (App Router, RSC, Server Actions), Tailwind CSS v4 (sötét mód a weben)
- **DB**: MongoDB (Atlas prodban) + Mongoose (2dsphere/text indexek, denormalizált event-mezők)
- **Auth**: Auth.js v5 (JWT, szerep-alapú: SUPER_ADMIN / MANAGER / ARTIST / FAN)
- **Térkép**: MapLibre GL + OpenFreeMap (kulcs nélkül), Nominatim geokódolás
- **Email**: Resend · **Rate limit**: Upstash (opcionális) · **Analytics**: Vercel
- **Tesztek**: Vitest + GitHub Actions CI · **Hosting**: Vercel

## Struktúra

```
apps/
  web/     – publikus oldal (térkép+lista, koncert-beküldés, kedvencek, követés)
  admin/   – backoffice (auth, CRUD, moderáció, jóváhagyás, kiemelés)
packages/
  types/   – megosztott zod-sémák, konstansok, util-ok (+ Vitest tesztek)
  database/– Mongoose modellek, connect, seed/cleanup scriptek, helperek
  ui/      – közös UI-primitívek (Card, Field, Button…)
```

## Fejlesztői indítás

Előfeltétel: Node 20+, pnpm 10, elérhető MongoDB (lokálisan vagy Atlas).

```bash
pnpm install
cp .env.example .env          # töltsd ki: MONGODB_URI, AUTH_SECRET
npm run seed:real             # valós HU előadók/események (a .env MONGODB_URI-ja alapján)
npm run dev                   # web :3000, admin :3001 (turbo)
```

Külön indítás: `npm run web` / `npm run admin`.

### Környezeti változók (`.env`)

| Változó | Leírás |
|---|---|
| `MONGODB_URI` | Mongo connection string (pl. Atlas `mongodb+srv://…/artistlist`) |
| `AUTH_SECRET` | Auth.js titok — `openssl rand -base64 32` |
| `NEXT_PUBLIC_WEB_URL` / `NEXT_PUBLIC_ADMIN_URL` | a két app publikus URL-je |
| `RESEND_API_KEY`, `MAIL_FROM` | email (opcionális; nélküle konzolra ír) |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | rate limit (opcionális; nélküle no-op) |
| `CRON_SECRET` | a napi emlékeztető-cron védelme |

## Scriptek

| Parancs | Mit csinál |
|---|---|
| `npm run dev` | web + admin dev (turbo) |
| `npm run build` | mindkét app build |
| `npm run seed:real` | valós előadók/események (additív, upsert) |
| `npm run cleanup` | kamu/demó adatok törlése (csak a valós marad) |
| `pnpm --filter @artistlist/types test` | Vitest unit tesztek |

## Kész funkciók (kivonat)

- Térkép+lista kereső (fotó-pin köteg → modal), város-autocomplete, dátum-gyorschipek
- Publikus **koncert-beküldés** (vendég-vázlat) → jóváhagyási lánc (superadmin / menedzsment / előadó)
- **Fiókos kedvencek + előadó-követés** (eszközök közt szinkron), koncert-emlékeztető email
- **Fizetős kiemelés** (5 tier, időtartam-kedvezmény) — *fizetés-integráció még hátravan*
- Email (verifikáció, jóváhagyás, elmarad-értesítő), jelszó-reset/csere, rate limit, sötét mód, OG-képek
- Vitest + GitHub Actions CI, Vercel Analytics, biztonsági headerek

## Demó belépések (seed)

> ⚠️ Éles indítás előtt **rotáld** a jelszavakat (Admin → Beállítások → Jelszó módosítása)!

| Szerep | Email | Jelszó |
|---|---|---|
| SUPER_ADMIN | admin@artistlist.hu | admin1234 |
| MANAGER | anna@northline.hu | titok1234 |
| ARTIST | szelcsend@example.hu | titok1234 |

## Működési jegyzetek

- **Térkép:** MapLibre + OpenFreeMap (kulcs nélkül). `NEXT_PUBLIC_MAPTILER_KEY` megadásával MapTiler stílus.
- **Dátumok:** UTC-ben tárolva, megjelenítés Europe/Budapest szerint.
- **Geo-adat denormalizálva** az eseményen (location/city/venueName/genres); helyszín-/előadó-változáskor sync-helperek frissítik.
- **Seed:** a scriptek betöltik a gyökér `.env`-et, így a `MONGODB_URI` szerinti (akár Atlas) DB-re futnak.

## Deploy

Lásd a **[DEPLOY.md](./DEPLOY.md)** fájlt (Vercel + MongoDB Atlas + domain + env, lépésről lépésre).
