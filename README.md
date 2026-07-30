# ArtistList

Magyar előadó- és eseménykereső platform — monorepo (pnpm + Turborepo).

| App / package | Mi ez |
|---|---|
| `apps/web` (:3000) | Publikus oldal: térkép+lista kereső, esemény-/előadó-/helyszínoldalak, SEO |
| `apps/admin` (:3001) | Előadó/menedzsment admin: auth, CRUD, moderáció |
| `packages/database` | Mongoose modellek + kapcsolat + seed (single source of truth) |
| `packages/types` | Zod sémák, közös típusok, konstansok, formázók |

## Indítás

```bash
# 1. függőségek
pnpm install

# 2. MongoDB (brew-val telepítve)
brew services start mongodb-community
# vagy előtérben: mongod --config /opt/homebrew/etc/mongod.conf

# 3. env
cp .env.example .env   # a defaultok lokálisan működnek

# 4. demó adatok
pnpm seed

# 5. futtatás (mindkét app)
pnpm dev
# külön: pnpm dev:web / pnpm dev:admin
```

## Demó belépések (seed után)

| Szerep | Email | Jelszó |
|---|---|---|
| SUPER_ADMIN | admin@artistlist.hu | admin1234 |
| MANAGER (Northline Booking) | anna@northline.hu | titok1234 |
| ARTIST (Szélcsend Zenekar) | szelcsend@example.hu | titok1234 |

## Fontos működési jegyzetek

- **Térkép:** MapLibre + OpenFreeMap (kulcs nélkül ingyenes). `NEXT_PUBLIC_MAPTILER_KEY` megadásával MapTiler stílusra vált.
- **Email:** `RESEND_API_KEY` nélkül a levelek a szerverkonzolra íródnak, és a regisztráció auto-verify.
- **Képek:** MVP-ben URL-alapú megadás (admin → előadó → Képek fül); üres képnél a design szerinti csíkozott placeholder jelenik meg. Cloudinary signed upload: v1.
- **Geo-adat denormalizálva** az eseményen (location/city/venueName/genres) — helyszín-mentéskor `syncVenueToEvents` szinkronizál.
- **Dátumok:** UTC-ben tárolva, megjelenítés Europe/Budapest szerint. Az admin `datetime-local` mezője a szerver helyi idejét használja parse-oláskor — élesben tegyél explicit TZ-konverziót a form-parse-ba.
- **Moderáció:** új előadó `pending` → SUPER_ADMIN hagyja jóvá (`/admin/moderacio`); jóváhagyott fiók eseményei azonnal publikálhatók.

## Ismert MVP-korlátok (doksi szerinti v1/v2 backlog)

Tiptap rich text (most textarea), Cloudinary upload, fan-fiók + szerveroldali kedvencek/követés,
jelszó-visszaállítás, rate limit (Upstash), Sentry, dinamikus OG-képek, helyszín-összevonás UI,
esemény-sorozatok, Atlas Search.
