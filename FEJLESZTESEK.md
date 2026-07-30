# Koncertlista — Fejlesztési és javítási terv

> CEO/founder-review, **EXPANSION** módban. Cél: a jelenlegi működő MVP-ből
> igazi platform. UX + UI + technikai + termékötletek, priorizálva.
> Készült: 2026-07-30. Aktuális állapot: web (`koncertlista.hu`) + admin
> (`admin.koncertlista.hu`), Next.js 15, MongoDB Atlas, Auth.js v5, MapLibre,
> Vercel. Commit-bázis: `9272551`.

---

## 0. Vezetői összefoglaló

**Hol tartunk:** működő aggregátor — térképes + listás koncertkereső, publikus
koncert-beküldés jóváhagyással, előadó/menedzsment fiókok, fizetős kiemelés,
jogi oldalak, éles domain + Atlas. Ez már self-serve termék.

**A 3 legnagyobb hiányzó láb (ezek nélkül nem skálázódik):**
1. **Valós fizetés** a kiemeléshez (most csak "megvásárolva" státusz, pénzmozgás nincs).


**A legnagyobb termék-lehetőség (EXPANSION):** a "passzív katalógus" →
**"személyes koncertasszisztens"**: kövess előadót → értesítést kapsz, ha
bejelent koncertet a városodban; "ma este a közeledben"; naptár-szinkron;
AI-alapú természetes nyelvű keresés.

---

## 1. Jelenlegi architektúra (kiindulás)

```
                         ┌──────────────────────────┐
                         │      MongoDB Atlas        │  (közös prod DB)
                         │  artists/events/venues/   │
                         │  users/orgs/genres        │
                         └────────────▲──────────────┘
                                      │ Mongoose
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
     ┌────────┴─────────┐    ┌────────┴─────────┐    packages/ (workspace)
     │  apps/web        │    │  apps/admin      │    ├─ @artistlist/database
     │  koncertlista.hu │    │  admin.konc…hu   │    ├─ @artistlist/types (zod)
     │  RSC + MapLibre  │    │  Auth.js + CRUD  │    └─ (közös séma/util)
     │  publikus, FAN   │    │  moderáció/       │
     │  auth (submit)   │    │  jóváhagyás/      │
     └──────────────────┘    │  kiemelés         │
                             └───────────────────┘
   Külső: OpenFreeMap (tile), Nominatim (geokód), Wikimedia/user URL (kép)
   Bekötve, de INAKTÍV: Cloudinary, Resend, Upstash, Google OAuth
```

**Erősségek:** tiszta monorepo, megosztott zod-séma (`packages/types`),
denormalizált event-mezők a gyors térkép-lekérdezéshez, RSC-first, szerver-action
alapú mutációk, EXIF-mentes publikus adat.

**Gyenge pontok (részletek lent):** nincs teszt/CI/observability, localStorage-
kedvencek, mock-fizetés, URL-only képfeltöltés, regex-keresés, egynyelvű.

---

## 2. UX fejlesztések

| # | Terület | Jelenlegi | Javaslat | Prioritás | Effort |
|---|---------|-----------|----------|-----------|--------|
| U1 | Kedvencek | localStorage, eszközhöz kötött | Fiókos kedvencek (a FAN loginhoz kötve) — eszközök közt szinkron, "értesíts ha közeleg" | **P1** | M |
| U2 | Előadó-követés | nincs | "Követem" gomb az előadó-oldalon → értesítés új koncertnél | **P1** | M |
| U3 | Onboarding a beküldéshez | login→regisztráció ugrás | Inline "vendég-vázlat": kitöltöd az űrlapot, csak beküldéskor kér regisztrációt (ne vessz el az adat) | P2 | M |
| U4 | Üres állapotok | általános "nincs találat" | Kontextuális ajánlás ("nincs techno a hétvégén — nézd a pop-ot / tágíts városra") + gyors-szűrő gombok | P2 | S |
| U5 | Térkép ↔ lista szinkron | van hover-highlight | Kattintás a listakártyán → térkép odaugrik/kinyit; térkép-pin → lista-scroll | P2 | M |
| U6 | "Ma este a közelben" | nincs | Geolokáció-alapú gyorsnézet: mai + holnapi koncertek X km-en belül | **P1** | M |
| U7 | Dátum-szűrő | preset chip-ek | Naptár-range választó + "épp most/ma este/hétvége" gyorsgombok | P3 | S |
| U8 | Kiemelés-vásárlás felfedezés | külön menü + panel | Rendben, de: "előnézet" (hogy néz ki kiemelten) + tier-összehasonlító tábla checkout előtt | P3 | S |
| U9 | Megosztás | nincs | "Megosztom" gomb event/előadó oldalon (Web Share API + OG-kép, lásd T-SEO) | P2 | S |
| U10 | Beküldés-visszajelzés | siker-oldal | "Kövesd a beküldésed státuszát" — a beküldő lássa: jóváhagyásra vár / élesítve / elutasítva (indokkal) | P2 | M |
| U11 | Akadálymentesség | részleges | Fókusz-állapotok, aria-label a térkép-markereken, kontraszt-audit, billentyűzet-navigáció a modálokban | P2 | M |
| U12 | Elmaradt/telt ház | badge kész | Emlékeztető: ha kedvenced elmarad → értesítés (indokkal, már tároljuk) | P2 | S |

---

## 3. UI fejlesztések

| # | Elem | Javaslat | Prioritás | Effort |
|---|------|----------|-----------|--------|
| I1 | Sötét mód | Rendszer-preferencia + kapcsoló; a design-tokenek (`@theme`) már készen állnak rá | P2 | M |
| I2 | Skeleton-ök | Egységes skeleton a térkép/lista/kártyák töltésekor (most helyenként "Keresés…") | P2 | S |
| I3 | Térkép-marker polish | Kiválasztott pin kiemelése, klaszter-buborék nagyobb sűrűségnél, smooth zoom a stack-modálból | P3 | M |
| I4 | Event-kártya hierarchia | Ár/idő/műfaj tipográfiai rendezése; kiemelt (promo) kártya vizuális megkülönböztetése (arany szegély már van — finomítás) | P3 | S |
| I5 | Előadó-oldal gazdagítás | Spotify/YouTube embed (a mezők már léteznek a sémában!), galéria, közelgő+múlt koncertek tabok | **P1** | M |
| I6 | Helyszín-oldal | Beágyazott mini-térkép, közelgő koncertek, kapacitás/típus badge, útvonaltervezés (részben megvan) | P2 | S |
| I7 | Mobil-first revízió | Térkép/lista váltó megvan; de a hero, szűrők, modálok mobil-finomhangolása | **P1** | M |
| I8 | Micro-interakciók | Kedvenc-szív animáció, "hozzáadva a naptárhoz" toast, gomb-loading állapotok | P3 | S |
| I9 | Konzisztens design-rendszer | A web és admin külön token-készlet — közös `packages/ui` kiemelése (Button/Card/Input) | P2 | L |
| I10 | OG-képek | Dinamikus Open Graph kép event/előadó oldalhoz (`@vercel/og`) — szép megosztás | P2 | M |

---

## 4. Technikai fejlesztések

### 4.1 Tesztelés és CI — **P1, jelenleg NULLA**
- **Vitest** unit: zod-sémák (`packages/types`), helperek (`slugify`, `formatPrice`, `computeEventDenorm`, `cityCentroid`), routing-logika (jóváhagyás-útvonal).
- **Playwright** e2e: kritikus folyamok — koncert-beküldés (új+meglévő előadó), jóváhagyás (superadmin/menedzsment/előadó), szűrés/térkép, kiemelés-vásárlás.
- **GitHub Actions CI**: `pnpm i` → `tsc --noEmit` (mindkét app) → `vitest` → `playwright` → `turbo build`. Push-blokkoló a main-re.
- *Miért P1:* most minden deploy vakrepülés; a session során többször tört el a build/adat.

### 4.2 Observability — **P1, jelenleg NULLA**
- **Sentry** (web + admin): hibakövetés, source map, alert.
- **Vercel Analytics / Speed Insights**: forgalom + Core Web Vitals.
- **Strukturált logok** a szerver-actionökben (beküldés, jóváhagyás, kiemelés) — request-id, user-id, entity-id.
- Egyszerű **admin "esemény-napló"** (audit log): ki mit hagyott jóvá/törölt/kiemelt.
- *Miért P1:* ha prodban eltörik, jelenleg nincs jel.

### 4.3 Biztonság — **P1**
- **Rate limiting** (Upstash Redis már env-placeholder): `/api/newsletter`, koncert-beküldés, geokód-keresés, login (brute-force ellen).
- **Jelszó-reset UI** + **admin jelszó-csere** oldal (most csak seed-jelszó; a demó `admin1234` publikus GitHubon volt — rotálni kell!).
- **CSP + biztonsági headerek** (`next.config` headers): CSP, HSTS, X-Frame-Options.
- **2FA** a SUPER_ADMIN fiókra (TOTP).
- **Input-hardening**: a zod már jó; de a kép-URL-eknél SSRF-védelem (csak https, allowlist-domainek vagy proxy).
- **Audit trail** érzékeny műveletekre (ban, approve, delete, kiemelés).

### 4.4 Fizetés — **P1 (üzleti kritikus)**
- **Barion** (HU-barát) vagy **Stripe** a kiemeléshez: valós fizetés, számla (Számlázz.hu/Billingo), webhook → kiemelés aktiválás fizetés után (most azonnal aktivál pénz nélkül).
- Elállás/ÁSZF már kész a digitális szolgáltatásra — a checkout kösse hozzá.

### 4.5 Email — **P1**
- **Resend** bekötése (env kész): email-verifikáció (most auto-verify), jóváhagyás/elutasítás-értesítő (részben megvan `sendMail`), **koncert-emlékeztető** (kedvenc T-1 nap), heti programajánló (a footer newsletter most stub).

### 4.6 Média/kép — **P2**
- **Cloudinary signed upload** (env kész, `ArtistForm` is utal rá "v1"): fájlfeltöltés URL-beillesztés helyett, automatikus átméretezés/optimalizálás, `next/image` + `remotePatterns`.
- SSRF/hotlink gond megszűnik (a session során volt fbcdn-hotlink probléma).

### 4.7 Teljesítmény — **P2**
- **Térkép-marker diffing**: most `rebuildMarkers` minden adatváltozásnál teljesen újraépít; kulcsolt diff (add/update/remove) simább és gyorsabb sok pinnél.
- **Events API cache**: rövid `s-maxage` a bbox-lekérdezésekre + stale-while-revalidate.
- **Index-audit**: 2dsphere/text megvan; a `startsAt+status`, `city+startsAt` compound indexek ellenőrzése Atlason.
- **Kép-lazy-load** + méret-hint a kártyákon.
- **A publikus lekérdezés** `pins` (max 500) + lapozott `events` — nagy adatnál klaszterezés szerver-oldalon.

### 4.8 Keresés — **P2**
- Most **regex** (`$regex`) — lassú és pontatlan nagyban.
- Rövid táv: **Mongo Atlas Search** (full-text, fuzzy, ékezet-insensitív, súlyozás).
- Nagy táv: **AI/NL keresés** ("techno Budapesten hétvégén 5000 alatt") → strukturált szűrőre fordítás (Claude tool-use).

### 4.9 Adatminőség — **P2**
- **Helyszín-dedup**: a publikus beküldés város-középpont koordinátát ad; superadmin-finomítás megvan, de kell dedup-figyelmeztetés + geokód-pontosítás batch.
- **Előadó-claim** teljes folyamat: "ez az én profilom" → moderált átvétel a menedzsmenthez/előadóhoz.
- **Duplikátum-események** összevonása.

### 4.10 DevEx / infra — **P3**
- **README + DEPLOY.md** (setup, env, seed, deploy lépések — a session-ből összeáll).
- **Seed Atlas-ra**: a seed-scriptek most a lokális mongóra defaultolnak (nem töltik a `.env`-et) — adj `--env` betöltést vagy dokumentáld.
- **Backup**: Atlas automatikus backup (M0-n korlátos) → ütemezett `mongodump` külső tárba.
- **Staging környezet** (Vercel preview + külön Atlas DB) — most minden main→prod.
- **Feature flag**-ek (pl. fizetés, sötét mód) fokozatos kiadáshoz.

---

## 5. Termékötletek (EXPANSION / delight)

### 5.1 Nagy fogadások (platform-építő)
1. **Követés + értesítés motor** — kövess előadót/várost/műfajt → email/push, ha új koncert. Ez teszi visszatérővé a usert. *(P1 alap, aztán bővül.)*
2. **Személyes feed / ajánló** — a kedvencek + követések + város alapján "neked ajánljuk". Spotify-import (top előadók) → passzoló koncertek.
3. **Naptár-integráció** — nemcsak per-event ICS (megvan), hanem "az összes kedvencem" feed-URL (Google/Apple Calendar előfizetés).
4. **PWA + push** — telepíthető app, web-push emlékeztetők, offline kedvenclista.
5. **Promoter/előadó analytics** — a kiemelés mellé: megtekintés, kedvencelés, jegylink-kattintás statisztika (a `stats` mezők már léteznek).
6. **Jegy-ár figyelő / értesítő** — ha egy esemény ára változik vagy "utolsó jegyek".

### 5.2 Delight (kis meló, nagy "óó, erre is gondoltak")
1. **"Ma este a közeledben"** — geolokáció, egy kattintás, mai koncertek térkép + lista. *(<1 nap)*
2. **Web Share + OG-kép** — szép megosztókártya event/előadó oldalról. *(fél nap)*
3. **"Add az összeset a naptáramhoz"** — kedvencek egyben ICS-be. *(fél nap)*
4. **Spotify "előnézet"** — az előadó-oldalon a már meglévő `spotifyArtistId` embed lejátszó. *(fél nap, a mező kész)*
5. **"Hasonló koncertek"** — az event-oldalon már van kapcsolódó; bővítsd "ugyanaz az előadó máshol / ugyanaz a helyszín legközelebb".
6. **Sötét mód kapcsoló** — a tokenek készek, gyors nyerő. *(fél nap)*
7. **Kedvenc-szív mikroanimáció + toast** — apró öröm. *(1-2 óra)*
8. **"Elmarad" proaktív értesítés** — a lemondás-indok már tárolva; küldj emailt a kedvencelőknek. *(fél nap Resenttel)*

### 5.3 Közösség / növekedés
- **Előadó-verifikáció badge** (kék pipa) + hivatalos profil.
- **Fesztivál-lineup oldalak** (egy helyszín/nap több előadóval — a stack-modál már megvan, építs rá dedikált fesztivál-nézetet).
- **Barátok / social** — lásd, mit mentettek az ismerőseid (később).
- **Beágyazható widget** ("Következő koncertjeim" az előadó saját weboldalára).
- **Nyilvános API** partnereknek (jegyértékesítők, média).

---

## 6. Priorizált roadmap (javaslat)

### Fázis 1 — "Éles-biztos" (2-3 hét) — a prod ne álljon meg
- [P1] Jelszó-rotálás + jelszó-reset/csere UI (biztonsági, azonnali)
- [P1] Rate limiting (Upstash) a publikus végpontokon
- [P1] Sentry + Vercel Analytics (observability)
- [P1] Alap teszt-készlet + GitHub Actions CI (tsc+vitest+build blokkoló)
- [P1] Resend bekötés: verifikáció + jóváhagyás/elmarad-értesítő

### Fázis 2 — "Visszatérő user" (3-4 hét) — retenció
- [P1] Fiókos kedvencek + előadó-követés (DB-be, localStorage helyett)
- [P1] Koncert-emlékeztető emailek (kedvenc T-1)
- [P1] "Ma este a közeledben" (geolokáció)
- [P1] Előadó-oldal gazdagítás (Spotify/YouTube embed — mezők készek)
- [P2] OG-képek + Web Share

### Fázis 3 — "Bevétel + méret" (4-6 hét)
- [P1] Valós fizetés (Barion/Stripe) + számla a kiemeléshez
- [P2] Promoter analytics dashboard
- [P2] Cloudinary képfeltöltés
- [P2] Atlas Search (full-text) a regex helyett
- [P2] Sötét mód, közös `packages/ui`

### Fázis 4 — "Platform" (folyamatos)
- Ajánló-feed, Spotify-import, PWA+push, naptár-előfizetés, AI-keresés, nyilvános API, fesztivál-oldalak.

---

## 7. Gyors nyerők (quick wins, <1 nap/db)
1. Sötét mód kapcsoló (tokenek készek).
2. "Ma este a közeledben" gomb.
3. Spotify embed az előadó-oldalon (mező kész).
4. OG-kép + megosztás gomb.
5. "Elmarad" értesítő a kedvencelőknek (indok már tárolva).
6. Jelszó-rotálás (biztonsági — azonnal).
7. README + DEPLOY.md.
8. Térkép: kiválasztott pin kiemelés + smooth zoom a modálból.

---

## 8. Ismert technikai adósság (a session-ből)
- Seed-scriptek a lokális mongóra defaultolnak (nem töltik a `.env`-et) — Atlas-seedhez env-átadás kell.
- Kép-URL-ek hotlink-védettek lehetnek (fbcdn) → Cloudinary megoldja.
- Nincs staging — main→prod közvetlen.
- A demó fiókok (`admin1234` stb.) a publikus repóban — jelszó-rotálás kötelező.
- Térkép-marker teljes újraépítés minden adatváltozásnál (diffing kellene).
- `packages/types` és a két app közti típus-megosztás jó; de a UI-komponensek duplikálódnak (web vs admin).

---

## 9. Kockázati mátrix (top)

| Kockázat | Valószínűség | Hatás | Mitigáció |
|----------|-------------|-------|-----------|
| Prod hiba láthatatlan (nincs monitoring) | Magas | Magas | Sentry + Analytics (Fázis 1) |
| Spam/abuse a publikus beküldésen | Közepes | Közepes | Rate limit + moderáció (megvan) |
| Kiemelés pénz nélkül aktiválódik | Biztos (most) | Magas (bevétel) | Fizetés-integráció (Fázis 3) |
| Regresszió deploykor (nincs teszt) | Magas | Közepes | CI + e2e (Fázis 1) |
| Adatvesztés (Atlas M0 backup korlátos) | Alacsony | Magas | Ütemezett külső dump |
| Publikus demó-jelszó | Biztos | Magas | Rotálás + reset UI (azonnal) |

---

*Ez a dokumentum élő — a Fázis-checklistek pipálhatók, a roadmap
negyedévente újrarangsorolható. Következő lépés javaslat: Fázis 1 első három
tétele (jelszó-rotálás, rate limit, Sentry) — ezek a legkisebb meló / legnagyobb
kockázatcsökkentés.*
