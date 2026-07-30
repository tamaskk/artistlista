# Deploy — Koncertlista

Két Next.js app egy monorepóból → **két külön Vercel projekt** + **MongoDB Atlas** + domain.

## 1. MongoDB Atlas

1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register) → **M0 (Free)** cluster (AWS, Frankfurt).
2. **Database Access** → új user (pl. `artistlist`), autogenerált jelszó, *Read and write to any database*.
3. **Network Access** → `0.0.0.0/0` (vagy Vercel IP-k).
4. **Connect → Drivers → Node.js** → connection string; a `.net/` **után** írd be az adatbázisnevet:
   `mongodb+srv://artistlist:JELSZO@cluster0.xxxx.mongodb.net/artistlist?retryWrites=true&w=majority`
5. Seed az Atlas-ra (lokálból, a `.env` MONGODB_URI-ját Atlas-ra állítva):
   `npm run seed && npm run seed:real && npm run cleanup`

## 2. Vercel — két projekt

Importáld a GitHub repót **kétszer**:

| Projekt | Root Directory | Domain |
|---|---|---|
| web | `apps/web` | `koncertlista.hu` (+ `www` redirect) |
| admin | `apps/admin` | `admin.koncertlista.hu` |

Framework: **Next.js** (auto). Build/Install: alap. (A `vercel.json` a web-ben a napi cron.)

### Environment Variables (Production)

**web + admin (mindkettő):**
```
MONGODB_URI            = <Atlas connection string>
AUTH_SECRET            = <openssl rand -base64 32>
NEXT_PUBLIC_WEB_URL    = https://koncertlista.hu
NEXT_PUBLIC_ADMIN_URL  = https://admin.koncertlista.hu
```
**opcionális (email/rate limit/cron):**
```
RESEND_API_KEY         = <resend kulcs>
MAIL_FROM              = Koncertlista <no-reply@koncertlista.hu>   # domain-verifikáció után
UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN                  # rate limit aktiválása
CRON_SECRET            = <random>   # csak a web projektben (emlékeztető-cron védelme)
```

## 3. Domain (DNS a regisztrátornál)

A Vercel a **Domains** fülön kiírja a pontos rekordokat. Tipikusan:

| Név | Típus | Érték |
|---|---|---|
| `@` (apex) | A | `216.198.79.1` (a Vercel által mutatott) |
| `www` | CNAME | a Vercel által megadott `…vercel-dns…` cél |
| `admin` | CNAME | a Vercel által megadott `…vercel-dns…` cél |

`.hu` domainnél az aktiváció (delegáció) eltarthat pár óráig — amíg `dig koncertlista.hu +short`
üres, a domain még nem él. Utána a Vercel automatikusan kiadja az SSL-t.

## 4. Email (Resend, valódi kézbesítéshez)

Resend → **Domains** → add `koncertlista.hu` → a kiírt SPF/DKIM DNS-rekordokat vedd fel a
regisztrátornál. Amíg nincs verifikálva, a Resend csak a fiók-tulajdonos címére küld
(`onboarding@resend.dev`). Verifikáció után állítsd a `MAIL_FROM`-ot `@koncertlista.hu`-ra.

## 5. Éles indítás előtt

- **Rotáld** a demó admin jelszót: Admin → Beállítások → Jelszó módosítása.
- Vercel Analytics/Speed Insights bekapcsolása a projekt fülén.
- (Opcionális) Upstash rate limit env-ek, Resend domain-verifikáció.

## Hátralévő nagy tételek

Valós **fizetés** (Barion/Stripe) a kiemeléshez, **Cloudinary** képfeltöltés,
**Sentry** hibakövetés (DSN), **Atlas Search** (regex helyett), **staging** környezet.
