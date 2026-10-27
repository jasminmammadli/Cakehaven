# Implementation plan — CakeHaven

Ordered so that each phase leaves the app buildable and the riskiest decisions (data model, pricing authority, auth boundaries) are made early.

| # | Phase | Scope | Done when |
| --- | --- | --- | --- |
| 1 | Figma inspection | Pages, frames, tokens, components, assets | ✅ `docs/figma-analysis.md` |
| 2 | Analysis and architecture | Three docs, product-owner decisions (brand, payment, guest checkout, OAuth) | ✅ These docs |
| 3 | Foundation | Next 16 scaffold, Tailwind v4 tokens, fonts, shadcn/ui, Supabase clients, env validation, proxy, Vitest | lint + typecheck pass |
| 4a | Database | Migration (schema, RLS, triggers, `create_order`), seed from the Figma catalogue, generated `Database` types, integration tests against local Supabase | migration applies; tests pass |
| 4b | Layout | Header (desktop/mobile, search, cart badge, account menu, sheet), footer (desktop/mobile), breadcrumbs, error/404 | matches Figma header/footer |
| 4c | Catalogue | Home (hero, category carousel, how-it-works, collection carousels, about accordion); `/cakes` (tabs, filter dialog, search, grid + pagination, collection rows) | routes render seeded data |
| 4d | Product | Gallery, weight picker with live price, message, add/buy, favourites, reviews (list, like, post), related carousel | add-to-basket works |
| 4e | Basket | Cookie store, pricing, lines with qty/edit/remove, promo, summary, empty state | totals computed on the server |
| 4f | Designer | Option tabs, chips, text, flip preview, live total, add/edit custom line | custom cake lands in the basket |
| 4g | Checkout | Stepper, 3 validated steps, demo payment, `placeOrder` → `create_order`, success page | order row created; basket cleared |
| 5 | Auth | Sign up, log in, reset password, OAuth start + callback, sign out, protected actions | session round trip works |
| 6 | Verification | Unit tests, lint, typecheck, production build, live run against local Supabase, screenshots vs Figma at 1440/393 | all checks observed passing |
| 7 | Docs and deploy readiness | README, `.env.example`, Supabase and Vercel setup, remaining gaps | handover |

**Status (2026-10-26):** phases 1–7 are complete against a local Supabase stack. Production deployment has not been done (see the README).

## Out of scope (not in the design)

- Order history, profile editing and a favourites list page.
- Admin/catalogue management UI (manage the catalogue in Supabase Studio).
- A real payment provider. The payment step is a demo by product-owner decision; integrating Stripe is the obvious next step and would replace the card step and add a webhook Route Handler.
- Email notifications for orders.

## Risks

| Risk | Mitigation |
| --- | --- |
| Paid fonts (PP Telegraf, OPTIDiode) unavailable | Google substitutes behind one CSS variable each |
| Build needs a live database (prerendering) | Documented; Vercel env must include Supabase variables for builds |
| Google OAuth needs a provider app | The button checks the auth settings and shows a clear error until Google is enabled; setup in the README |
| Cookie basket size | Capped at 20 lines; no prices stored |
