# Carpool

School carpool coordination for a small family group.

## What’s in this branch

- **Week + Agenda** hybrid schedule (main product surface)
- **Auth.js** email/password family accounts
- **Postgres + Prisma** for families, kids, addresses, trips
- Sample sheet (**2027** tab) seeded into the DB
- Explore C/D concepts still under `/explore` (local mock)

SMS (Twilio) is **not** in this PR.

## Environment

Copy `.env.example` → `.env` (and/or `.env.local`):

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Postgres URL (Neon/Supabase/Prisma cloud, or local Postgres) |
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `AUTH_URL` | Yes | e.g. `http://localhost:3000` or the Vercel URL |
| `AUTH_TRUST_HOST` | On Vercel | `true` |
| `NEXT_PUBLIC_APP_URL` | On Vercel | Same as public site URL |

### Hosted (Vercel)

Production: **https://carpool-carpool4.vercel.app/login**  
GitHub `lforschler/Carpool` is linked to Vercel project `carpool` (team `carpool4`) — pushes/PRs deploy automatically.

### Cloud Postgres (recommended)

1. Create a Neon or Supabase project.
2. Paste the connection string into `DATABASE_URL` (include `?sslmode=require` for Neon).
3. Run migrations + seed (below).

Early Neon claimable project notes: see project store `internal/neon-provision.md` (may be expired — create a fresh DB if so).

### Local Postgres (dev)

```bash
# example role/db used in this agent environment
postgresql://carpool:carpool@127.0.0.1:5432/carpool?schema=public
```

## Setup

```bash
npm install
npx prisma migrate deploy   # or: npm run db:migrate
npm run db:seed             # loads 2027-tab schedule + demo users
npm run dev
```

Regenerate `src/lib/mock-schedule.json` from the Google Sheet **2027** tab (not the spring **2026** tab):

```bash
npm run db:import-sheet     # downloads xlsx, or: python3 scripts/import-sheet-2027.py --xlsx scripts/carpool-schedule.xlsx
npm run db:seed
```


Open http://localhost:3000/week → redirects to sign-in if needed.

### Demo logins (after seed)

Password for all: `carpool123`

- `lucas@carpool.local`
- `jill@carpool.local`
- `dee@carpool.local`

## Routes

| Route | Role |
|-------|------|
| `/login`, `/signup` | Family accounts |
| `/week`, `/agenda` | Schedule hybrid (DB-backed when signed in) |
| `/family` | Kids + home address for signed-in family |
| `/explore` | Archive / C–D reference concepts |

## Migrations

```bash
# apply existing migrations (CI / prod / fresh DB)
npx prisma migrate deploy

# create a new migration while developing
npx prisma migrate dev --name describe_change

# regenerate client
npx prisma generate
```
