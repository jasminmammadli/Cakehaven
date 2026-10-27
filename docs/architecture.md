# Architecture — CakeHaven

## 1. Overview

A single **Next.js 16 App Router** application deployed on **Vercel**, backed by **Supabase** (PostgreSQL + Auth). There is no separate backend: reads happen in Server Components through server-only data-access modules, writes happen in Server Actions, and there is one Route Handler (the OAuth/email callback), which has to be an HTTP endpoint.

```
Browser ──► Next.js (Vercel, Node runtime)
              ├─ proxy.ts                → refreshes the Supabase auth session cookie
              ├─ Server Components       → features/*/repositories (cached public reads)
              ├─ Server Actions          → features/*/actions → services → Supabase
              └─ /auth/callback (Route)  → exchanges OAuth / email codes for a session
                                            │
                                            ▼
                                   Supabase Postgres (RLS on every table) + Auth
```

`next.config.ts` keeps `cacheComponents: true` and `partialPrefetching: true` (the Next 16.4 defaults). Consequences:
- Public catalogue reads live in `'use cache'` functions tagged with `cacheTag` (`catalog`, `product:<slug>`, `reviews:<productId>`), so pages prerender a static shell.
- Anything that reads cookies (session, basket) sits inside a `<Suspense>` boundary and streams in.
- Server Actions that change cached data call `updateTag` (read-your-own-writes).

## 2. Route organisation

```
src/app
├── layout.tsx                 root: fonts, <Toaster/>, metadata
├── (shop)/layout.tsx          header + footer
│   ├── page.tsx               /                 home
│   ├── cakes/page.tsx         /cakes            catalogue (tabs, filters, search, pagination)
│   ├── cakes/[slug]/page.tsx  /cakes/:slug      product detail + reviews
│   ├── design/page.tsx        /design           custom cake builder
│   ├── basket/page.tsx        /basket
│   └── checkout/
│       ├── page.tsx           /checkout         3-step checkout
│       └── success/page.tsx   /checkout/success
├── (auth)/layout.tsx          header only (the design shows no footer)
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── reset-password/page.tsx
├── auth/callback/route.ts     GET: OAuth + email-link code exchange
├── error.tsx, not-found.tsx, global-error.tsx
src/proxy.ts                   session refresh (Next 16 name for middleware)
```

## 3. Source layout

```
src/
├── components/ui/        shadcn/ui primitives, restyled to the Figma tokens
├── components/layout/    SiteHeader, SiteFooter, Container, Breadcrumbs
├── components/shared/    ProductCard, ProductCarousel, Price, EmptyState …
├── features/
│   ├── catalog/          repositories (products, categories, collections), filter schema, components
│   ├── basket/           cart cookie store, pricing (pure), basket service, actions, components
│   ├── designer/         option catalogue + components
│   ├── reviews/          repository, actions, components
│   ├── favorites/        repository, actions, FavoriteButton
│   ├── checkout/         schemas, order service, actions, components
│   └── auth/             session (DAL), actions, schemas, components
├── lib/
│   ├── supabase/         server.ts (cookie client), public.ts (cookie-less), admin.ts (secret key), proxy.ts
│   ├── env.ts            zod-validated environment
│   ├── format.ts         money / date formatting
│   └── utils.ts          cn()
└── types/database.ts     Supabase Database type (regenerate with `supabase gen types`)
```

Rules:
- Every module that touches Supabase or secrets starts with `import "server-only"`.
- Client components never import repositories or services. They receive data as props and call Server Actions.
- Pure logic (pricing, schemas, card validation) has no framework imports, so the server, the client and the tests all share it.

## 4. Data model

```
categories (id, slug ⋆, name, image_url, sort_order)
products   (id, slug ⋆, name, description, ingredients, category_id → categories,
            base_price_cents  -- 0.5 kg price, shape enum, flavours text[], images text[],
            is_active, created_at)
collections (id, slug ⋆, title, sort_order)                -- "Sweet Success", …
collection_products (collection_id, product_id, position)  PK(collection_id, product_id)
profiles   (id → auth.users, full_name, created_at)        -- created by trigger on sign-up
reviews    (id, product_id, user_id → profiles NULL, author_name, avatar_url, body,
            like_count, created_at)                         -- seeded reviews have no user
review_likes (review_id, user_id) PK                        -- trigger keeps reviews.like_count
favorites  (user_id, product_id) PK
promo_codes (code ⋆ citext, percent_off 1–90, is_active, expires_at)
orders     (id, reference ⋆, user_id NULL, status, customer_name, phone, email,
            address_type, city, address_line, postcode, payment_method, card_last4,
            subtotal_cents, discount_cents, total_cents, promo_code, created_at)
order_items (id, order_id, product_id NULL, kind, name, details jsonb, unit_price_cents,
             quantity, line_total_cents)
```

Constraints: positive money values and checks on quantities, enum checks (`shape`, `address_type`, `payment_method`, `status`), `card_last4 ~ '^\d{4}$'`, and length checks on free text. Indexes on `products(category_id)`, `products(base_price_cents)`, GIN on `products(flavours)`, trigram on `products(name)` for search, and `reviews(product_id, created_at)`.

## 5. Basket

The basket is an **httpOnly cookie** (`ch_basket`) holding at most 20 lines:

```ts
{ id, kind: "product", productId, weight, message?, quantity }
{ id, kind: "custom", options: { size, sponge, filling, cream, decor, text? }, quantity }
```

Why a cookie:
- It works for guests with no extra database writes and no anonymous auth.
- Server Components can read it, so the basket and checkout render on the server.
- It contains **no prices**. On every read the server parses it with Zod (a corrupt cookie resets to empty), loads product rows and computes prices with `features/basket/pricing.ts`. The client can't tamper with prices.

The promo code is a second cookie (`ch_promo`), re-validated against the database on every read.

## 6. Checkout and orders

1. The three steps are one client component (`CheckoutFlow`) using React Hook Form + Zod. Step data stays in client state.
2. Card fields are validated in the browser only (Luhn check, expiry, CVV). The server receives `payment_method` and `card_last4` and **never** receives the card number or CVV. This is a demo-payment boundary, labelled as such in the UI.
3. `placeOrder` (Server Action):
   - validates input with the same Zod schemas;
   - rebuilds the priced basket from the cookie and the database;
   - re-validates the promo code;
   - reads the optional signed-in user;
   - calls the Postgres function `create_order(jsonb)` through the **admin client**.
4. `create_order` is `SECURITY DEFINER` and executable **only by `service_role`**. It inserts the order and its items in one transaction and returns the reference. Because no anon/authenticated insert path exists, nobody can create an order with arbitrary prices through the public REST API.
5. After a successful insert the basket cookies are deleted and the user is redirected to `/checkout/success?ref=…`. On failure the action returns an error state and the basket is kept.

## 7. Authentication and authorization

- Supabase Auth with email/password plus Google OAuth (one button for sign-up and log-in; Facebook was dropped by product-owner decision). Sessions live in cookies managed by `@supabase/ssr`.
- `proxy.ts` refreshes the session on navigation. This is an optimistic layer only; authorization is enforced again in each action.
- `features/auth/session.ts` is the data access layer. `getCurrentUser()` calls `supabase.auth.getUser()` (verified against Auth, not the unverified `getSession()`) and returns `{ id, email, fullName }` or `null`.
- Each protected Server Action (favourite, review, like) calls `requireUser()` itself. RLS enforces the same rule a second time:

| Table | anon | authenticated |
| --- | --- | --- |
| categories, products, collections, collection_products | SELECT active rows | same |
| reviews | SELECT | INSERT own (`user_id = auth.uid()`; author name set by trigger), DELETE own |
| review_likes, favorites | – | SELECT/INSERT/DELETE own rows |
| profiles | – | SELECT/UPDATE own row |
| promo_codes | – | – (read only by the server with the secret key) |
| orders, order_items | – | SELECT own orders; no INSERT (only via `create_order`) |

## 8. API strategy

- **Server Actions** handle every UI mutation: basket add/update/remove, promo, favourite, like, review, place order, sign up, log in, sign out, reset password, Google sign-in start.
- **Route Handler** `GET /auth/callback` exists because Supabase redirects the browser to a URL with a `code` parameter.
- No public JSON API, because no external client is in scope. If one is needed later, it should call the same `services/*` modules.

Server Actions return a typed result `{ ok: true, … } | { ok: false, error, fieldErrors? }` and never report success when the database call failed.

## 9. Security checklist

- The secret key is used only in `lib/supabase/admin.ts` (`server-only`), only for `create_order` and promo lookup, and is never `NEXT_PUBLIC_`.
- All untrusted input is parsed with Zod on the server: action payloads, search params, cookies.
- RLS is enabled on every table, with default deny.
- Prices are always computed on the server.
- Auth redirects validate `next` as a same-origin relative path (no open redirects).
- Server Actions run under Next's built-in Origin check (CSRF protection).

## 10. Deployment

- Vercel, Node runtime (required by Cache Components).
- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or the legacy anon key)
  - `SUPABASE_SECRET_KEY` (or the legacy service-role key)
  - `NEXT_PUBLIC_SITE_URL`
- `next build` prerenders catalogue pages, so the Supabase variables must be present in the **build** environment as well as at runtime.
- Database changes are SQL migrations in `supabase/migrations`, applied with `supabase db push`. Seed data is in `supabase/seed.sql`.
- In Supabase Auth set the Site URL and these Redirect URLs: `https://<domain>/auth/callback`, `http://localhost:3000/auth/callback`.
