# CakeHaven

An online cake shop built from the CakeHaven Figma design. Customers can:
- browse cakes by category and curated collection;
- filter by price, shape and flavour, and search by name;
- choose a weight and add a message to a cake;
- design a custom cake;
- manage a basket with promo codes;
- check out in three steps;
- create an account to save favourites and write reviews.

**Stack:** Next.js 16 (App Router, Cache Components), React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui (Base UI), Lucide, Supabase (Postgres + Auth), Zod, React Hook Form. There is no separate backend: reads are Server Components, writes are Server Actions, and one Route Handler serves the auth callback.

| Doc | Contents |
| --- | --- |
| [docs/figma-analysis.md](docs/figma-analysis.md) | Screens, design tokens, components, interactions, assumptions |
| [docs/architecture.md](docs/architecture.md) | Routes, data model, RLS, basket and order design, security |
| [docs/implementation-plan.md](docs/implementation-plan.md) | Phases, scope, risks |

> **Payment is a demo.** The card step validates input in the browser and only the payment method and the card's last four digits reach the server. No payment provider is connected.

## Requirements

- Node.js **22+** (`nvm use` reads `.nvmrc`). supabase-js needs Node 22's native WebSocket.
- Docker, for the local Supabase stack. The Supabase CLI is installed as a dev dependency.

## Local setup

```bash
npm install
npm run db:start              # starts Supabase locally, applies migrations and the seed
cp .env.example .env.local    # fill in values from the next command
npx supabase status           # prints API URL, publishable and secret keys
npm run dev                   # http://localhost:3000
```

Local Supabase Studio is at http://127.0.0.1:54323. Locally, email confirmation is off, so sign-up logs you in straight away.

Try promo code **`SWEET20`** (20% off) and test card **4242 4242 4242 4242** with any future expiry and any CVV.

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client + server | Publishable key (`sb_publishable_…`) or legacy anon key |
| `SUPABASE_SECRET_KEY` | **server only** | Secret key (`sb_secret_…`) or legacy service-role key. Used only to create orders and read promo codes |
| `NEXT_PUBLIC_SITE_URL` | server | Public origin, used for auth email links (fallback when there is no `Origin` header) |

`.env*` files are git-ignored except `.env.example`. Never prefix the secret key with `NEXT_PUBLIC_`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` | ESLint |
| `npm run typecheck` | Route type generation + `tsc --noEmit` |
| `npm test` | Unit tests (pricing, basket, checkout boundary, filters, redirects) |
| `npm run test:integration` | RLS, triggers and `create_order` against the running Supabase |
| `npm run test:e2e` | Playwright journeys against `npm run start` (run `npm run build` first; uses the installed Chrome) |
| `npm run check` | lint + typecheck + unit tests |
| `npm run db:start` / `db:reset` | Start local Supabase / re-apply migrations and seed |
| `npm run db:types` | Regenerate `src/types/database.ts` from the local schema |

## Database

- The schema lives in `supabase/migrations/`, and the catalogue seed (taken from the Figma content) in `supabase/seed.sql`.
- Every table has RLS:
  - the catalogue is public-read;
  - favourites, likes and profiles are visible to their owner only;
  - orders can only be inserted through the `create_order()` function, which only the server's secret key can execute.
- After changing the schema, add a new migration (`npx supabase migration new <name>`), then run `npm run db:reset` and `npm run db:types`.

### Supabase (hosted) setup

1. Create a project and link it: `npx supabase link --project-ref <ref>`.
2. Apply the schema with `npx supabase db push`.
3. Load the seed: run `supabase/seed.sql` in the SQL editor, or `psql "$DB_URL" -f supabase/seed.sql`.
4. Under **Authentication → URL Configuration**:
   - set **Site URL** to your production URL;
   - add these Redirect URLs: `https://<your-domain>/auth/callback`, `https://*-<team>.vercel.app/auth/callback` (previews) and `http://localhost:3000/auth/callback`.
5. Under **Authentication → Providers**, enable Email, and optionally **Google** and **Facebook**:
   - create an OAuth app with each provider;
   - use `https://<project-ref>.supabase.co/auth/v1/callback` as the authorized redirect URI;
   - paste the client ID and secret into Supabase.

   Until a provider is enabled, its button shows "Sign-in with … isn't available right now."

## Deploying to Vercel

1. Push the repository to GitHub and import it in Vercel. The framework preset is Next.js, and the Node version comes from `engines` (≥ 22).
2. Add the four environment variables above to **Production** and **Preview**. `next build` prerenders catalogue pages from Supabase, so the build needs them too.
3. Deploy, then add the deployment URL to the Supabase redirect URLs (step 4 above).
4. Before going live, replace the placeholder `CONTACT_EMAIL` and the social links in `src/lib/constants.ts`.

The code is deployment-ready, but it **has not been deployed** to Vercel or connected to a hosted Supabase project. Everything above was verified against the local Supabase stack.

## Project structure

```
src/
  app/               routes: (shop), (auth), auth/callback, error and not-found pages
  components/        ui/ (shadcn, restyled), layout/ (header, footer), shared/ (cards, carousel…)
  features/          catalog, basket, designer, checkout, reviews, favorites, auth
                     (each with its repository/service, actions, schemas, components)
  lib/               supabase clients, env validation, formatting
  types/database.ts  generated Supabase types
supabase/            config, migrations, seed
tests/               unit/, integration/, e2e/
docs/                design analysis, architecture, plan
```

## Design notes

- **Fonts.** The design's PP Telegraf and OPTIDiode are commercial fonts and are not bundled. Urbanist and Bodoni Moda stand in for them; WindSong and Roboto are the originals. To use a licensed Telegraf, load it with `next/font/local` in `src/app/fonts.ts` under `--font-urbanist`.
- **Brand.** The Figma mock-up used another company's logo and name. This app uses a CakeHaven wordmark instead.
- Further deviations and assumptions are listed in `docs/figma-analysis.md` §7.
