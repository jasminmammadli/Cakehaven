# Figma analysis — CakeHaven

Source: Figma file `AM9qiZGn6NbJjLnwv9XPJT` ("CakeHaven (Copy)"), inspected through the Figma MCP server on 2026-10-26.

Everything in this document is marked as either **[Figma]** (read from the file: metadata, design context, variables or rendered screenshots) or **[Assumption]** (inferred by us because the design does not specify it).

## 1. File structure

| Page | Node | Used for implementation |
| --- | --- | --- |
| Thumbnail | `4:181` | No (cover image) |
| Task flow | `0:1` | No (UX exploration) |
| User flow | `1:79` | No (UX exploration) |
| Moodboard | `1:362` | No |
| Ui kit | `2:208` | **Yes**: typography, colour scales, icons, component variants |
| Low fidelity wireframe | `1:359` | No (superseded) |
| High fidelity wireframe | `1:363` | No (superseded by "UI") |
| UI | `29:181` | **Yes**: 13 desktop screens (1440 px) |
| Adaptive | `125:1471` | **Yes**: mobile home + mobile category (393 px), adaptive desktop variants |

## 2. Product understanding

**Purpose [Figma].** An online cake shop. Customers browse cakes by category and curated collections, open a product to choose a weight and add a cake message, design a custom cake from options, manage a basket with a promo code, and check out in three steps (personal → card → address).

**User groups.**
- *Guest shopper* — browses, searches, filters, builds a basket and checks out. **[Decision, confirmed with product owner]** Guest checkout is allowed.
- *Registered customer* — everything a guest can do, plus favourites (heart) and posting/liking reviews. Orders placed while signed in are linked to the account.
- There is no admin/staff UI in the design. Catalogue management happens in Supabase directly. **[Assumption]**

**Main journeys.**
1. Home → category carousel / collection → product → *Add basket* → basket → checkout → success.
2. Home → *Design the cake* → choose size / ingredients / filling / cream / decor / text → *Order* → basket → checkout.
3. Category page → tab or *Filter* dialog (price, form, flavour) → product.
4. Header search → results.
5. Sign up / Log in (email + password, Google, Facebook) → favourite cakes, write reviews.

## 3. Page inventory

| Figma frame (node) | Route | Purpose | Main sections | Data | Interactive elements | Auth |
| --- | --- | --- | --- | --- | --- | --- |
| home page (`36:306`) | `/` | Landing | Header, hero (`Discover us`), *Category of cakes* carousel, *How it works*, *Sweet Success* and *Designer Cakes* carousels, *About us* list, footer | categories, collections + products | carousel arrows, heart, category cards, About-us rows | none |
| category page (`36:532`) | `/cakes` | Catalogue | breadcrumbs, title, category tabs + scroll arrow, *Filter* button, collection rows (*Sweet Success*, *Designer Cakes*, *Surprise Your Loved One*, *Trending Cakes*) | categories, collections, products | tabs, filter, arrows, hearts | none |
| pop up (`57:686` / `98:1252`) | `/cakes` (dialog) | Filter | Price slider + min/max, Forms (Round/Square/Heart-shaped/Cupcake/Muffin), Flavour checkboxes (10), *Reset all*, *Apply*, close ✕ | filter enums | all | none |
| inside cake page (`98:1716`) | `/cakes/[slug]` | Product detail | breadcrumbs, 3 thumbnails + main image, heart, name, price, *Select Weight* (4 chips), description, *Cake message*, *Add basket*, *Buy*, reviews (avatar, name, text, like count), *Add a comment*, *Surprise Your Loved One* carousel | product, reviews, related | thumbnails, weight chips, message, buttons, likes, comment | reviews/likes/favourites need login |
| basket (`102:1911`) | `/basket` | Cart | title + item count, line items (image, name, ingredients, price, qty stepper, Edit, Remove), *Order Summary*, *Promocode* + hint "20% off discount", *Order basket* | basket lines, promo | stepper, edit, remove, promo, order | none |
| order page (`36:247`) | `/design` | Custom cake builder | breadcrumbs, title, large image + *Flip the cake*, option tabs (size, ingridients, filling, cream, decor, text), option chips, *Total*, *Order* | option catalogue | tabs, chips, flip, order | none |
| personal info (`91:894`) | `/checkout` step 1 | Checkout | stepper (1 active), Full name, Phone number, Email, *Continue*, order summary card with Edit/Remove and Total | basket | inputs, stepper, edit/remove | none |
| checkout (`77:975`) | `/checkout` step 2 | Payment | tabs Credit card / Apple pay / Pay pal, Name on card, Card number (floating label), Date, Cvv, *Continue* | — | inputs, tabs | none |
| adress (`95:958`) | `/checkout` step 3 | Delivery address | radio Home / Office / Other, City, Billing address, Email, *Order* | — | radios, inputs | none |
| success (`97:1072`) | `/checkout/success` | Confirmation | check icon, PAYMENT SUCCESS, *Back to home*, *You will like it* carousel | products | link, carousel | none |
| Profile (`98:1720`) | `/signup` | Sign up | image, card with Sign up / Log in tabs, Full name, Email, Password, *Forgot password?*, *I accept the privacy*, *Create account*, "or", Google, Facebook | — | all | public |
| Profile (`98:1787`) | `/login` | Log in | same card, Email, Password, *Forgot password?*, *Log in*, Google, Facebook | — | all | public |
| mobil home page (`126:1875`) | `/` < 768 px | Mobile layout | compact header (logo, search, cart, menu), hero image with text below, 2×2 category grid, *How it works* list, horizontal card scrollers, *About us* rows, mobile footer | same as desktop | same | none |
| mobile category page (`126:2521`) | `/cakes` < 768 px | Mobile layout | title + sliders icon (filter), horizontal card scrollers | same as desktop | same | none |

**Implementation status (2026-10-26).** Every frame above is implemented and covered by the Playwright journeys or screenshots in `tests/e2e`. The Adaptive mobile layouts are implemented responsively below 768 px. The "pop up" frame is the filter dialog on `/cakes`, and the "personal info / checkout / adress" frames are the three steps of `/checkout`.

Screens added by us because a working flow requires them **[Assumption]**: `/reset-password` (target of the *Forgot password?* email, reuses the auth card), `not-found` and `error` pages.

## 4. Design system

### 4.1 Colour palette [Figma variables + Ui kit swatches]

| Token | Hex | Usage |
| --- | --- | --- |
| `black` | `#151515` | product card text |
| `black/500` | `#1E1E1E` | primary text, outlines of secondary buttons and inputs |
| `black/400` | `#3B3B3B` | secondary body text (How it works, success copy) |
| `black/300` | `#595959` | input borders on product/basket/checkout |
| `Black` (Roboto set) | `#282828` | review text |
| `grey/300` | `#DFDFDF` | header and footer dividers, tab separators |
| `grey/400` | `#CECECE` | light dividers |
| `grey/500` | `#BEBEBE` | placeholder of card number |
| `grey/600` | `#AEAEAE` | unselected chip border/text, list dividers |
| `grey/700` | `#909090` | card borders, captions ("Forgot password?", "20% off discount") |
| `grey/800` | `#737373` | breadcrumbs, inactive tabs, Edit/Remove |
| `lilac/400` | `#E7D8E6` | soft dividers in order summary |
| `lilac/700` | `#C29DC1` | **brand / primary**: filled CTA, selected chip, stepper, focus |
| `lilac/800` | `#A282A1` | primary CTA variant (Apply, Order, Continue), link buttons (Reset all) |
| `lilac/900` | `#826781` | heart icon stroke |
| `white` | `#FFFFFF` | backgrounds, text on photos |
| search field bg | `rgba(118,118,128,0.12)` | header search |

Full lilac scale from the Ui kit (`41:1344`): `#F9F5F9 #F3EBF3 #EDE2EC #E7D8E6 #DAC4DA #CEB1CD #C29DC1 #A282A1 #826781 #624B62 #523E52 #423042 #322332 #221522`.

The design has no error or success colours. **[Assumption]** We add `destructive #B42318` for validation errors (≥ 4.5:1 on white) and reuse `lilac/700` for success.

### 4.2 Typography [Figma]

Primary typeface **PP Telegraf** (Pangram Pangram, commercial). Styles defined in the Ui kit:

| Style | Size / line height | Weight |
| --- | --- | --- |
| H1 Bold / Regular / Light | 28 / 36 | 800 / 400 / 200 |
| Page title (used on category, basket, order) | 36 / 36 | 800 |
| H2 Bold / Regular | 24 / 32 | 800 / 400 |
| H3 Bold / Regular / Light | 20 / 28 | 800 / 400 / 200 |
| Body1 Bold / Regular / Light | 16 / 24 | 800 / 400 / 200 |
| Body2 Regular | 14 / 22 | 400 |
| Caption Regular | 12 / 20 | 400 |

Hero only: **OPTIDiode** (40 px, uppercase, display serif) and **WindSong** (50 px script). Reviews: **Roboto** 14/22 Medium + Regular.

**[Decision]** PP Telegraf and OPTIDiode are paid fonts we have no licence for, so they are not bundled. The closest free substitutes, all loaded through `next/font/google`:
- PP Telegraf → **Urbanist**. A geometric grotesque that has the same 200/400/800 weights the design uses.
- OPTIDiode → **Bodoni Moda**. A high-contrast display serif.
- WindSong → **WindSong**. The same font, which is on Google Fonts.
- Roboto → **Roboto**.

A licensed Telegraf can be added later by changing one CSS variable (`--font-sans`) in `src/app/fonts.ts`.

### 4.3 Spacing, layout, grid [Figma]

- Desktop frame 1440 px. Content container **1180 px** with 130 px side margins.
- Product cards: 4 columns of **280 × 460**, gap 20. Card image 280 × 373, text area with 1 px `#909090` border on three sides, text inset 30 px.
- Category cards: 4 × **295 × 419** with no gap.
- Section rhythm: title (28/36 bold) → 33 px → content. About 140–150 px between sections.
- Carousel arrow buttons: two 54 px outlined circles, 40 px apart, aligned to the right of the section title.
- Header: 60 px tall, 32 px from top in the frame, 1 px `#DFDFDF` bottom border; logo 112 × 27 at x = 130; search field from x = 330 to 910 (580 wide, 40 tall, radius 5); "Design the cake" link + 3 icons (24 px, gap 40) right-aligned to x = 1310.
- Footer: 535 px tall; nav row (24 px text) between two 1 px dividers; 3 link columns separated by vertical dividers; bottom row with email, ® 2022, social icons.
- Mobile frame 393 px with 20 px side gutters. Cards shrink to **246 × 386** and scroll horizontally (gap 20). Category grid is 2 × 2 (167 px squares, gap 20).

### 4.4 Radii, borders, shadows [Figma]

- Pills: radius **100 px** for buttons, inputs and chips.
- Cards/panels: radius **32 px** for order summary, auth card and product card frame. Images use **24 px** (product main image, basket thumbnails) or **8 px** (gallery thumbnails, checkout summary thumbnails).
- Dialog: radius **24 px**, overlay `rgba(0,0,0,0.3)`.
- Borders are 1 px. Selected chips, the auth card and stepper circles use 2 px `lilac/700`.
- **No drop shadows** anywhere in the design.

### 4.5 Components and states [Figma Ui kit `2:208`]

| Component | Variants in Figma | States we implement |
| --- | --- | --- |
| Button "Frame 55" (`52:252`) | Default (filled lilac), Secondary (outlined black/lilac), Link (text lilac) | hover (darken one lilac step), focus-visible ring `lilac/700`, active, disabled (50% opacity), pending (spinner + `aria-busy`) |
| Arrow icon button (`48:562`) | left / right (54 px circle) | hover fill `lilac/400`, disabled (40% opacity) at scroll edges |
| Category arrow (`48:514`) | disabled (outline) / hover (filled white) | hover reveals filled variant |
| Heart (`48:597`) | off / on | toggled, pending, needs login (toast + link) |
| Checkbox (`57:1096`) | on / off | + focus ring |
| Radio (`149:2285`, `149:2296`) | on / off | + focus ring |
| Input "Component 6" (`59:1637`) | default, with trailing arrow icon, with helper text | + focus, invalid (red border + message), disabled |
| Chip (weight / cream / form) | unselected (`#AEAEAE`), selected (2 px `#C29DC1`) | + hover, focus |
| Stepper circle | active (filled lilac, white digit), inactive (outline lilac) | + completed (clickable to go back) |
| Tabs (category, payment, auth, designer) | active = bold + 2 px underline | + hover, focus |
| Qty stepper | − / value / + | min 1, max 20, pending |

## 5. Component inventory

- **Layout:** `SiteHeader` (desktop and mobile variants, search, account menu, cart badge, hamburger sheet), `SiteFooter` (desktop and mobile), `Breadcrumbs`, `PageTitle`, `Container`.
- **Catalogue:** `ProductCard`, `ProductCarousel` (section title + arrows + horizontal snap scroller), `CategoryCard`, `CategoryCarousel`, `CategoryTabs`, `FilterDialog`, `ProductGrid` + pagination.
- **Product:** `ProductGallery`, `WeightPicker`, `AddToBasketForm`, `FavoriteButton`, `ReviewList`, `ReviewItem` (like button), `ReviewForm`.
- **Basket:** `BasketLine` (qty stepper, edit, remove), `OrderSummary`, `PromoCodeForm`, empty state.
- **Designer:** `CakeDesigner` (preview + flip, option tabs, chips, text input, live total).
- **Checkout:** `CheckoutStepper`, `PersonalStep`, `PaymentStep` (method tabs, card fields), `AddressStep`, `CheckoutSummary`.
- **Auth:** `AuthCard` (tabs), `SignUpForm`, `LoginForm`, `ResetPasswordForm`, `OAuthButtons`.
- **Feedback:** toasts (sonner), inline field errors, `loading.tsx` skeletons, `error.tsx`, `not-found.tsx`, empty states (no results, empty basket, no reviews).

## 6. Interaction requirements

| Element | Behaviour |
| --- | --- |
| Header search | Submit → `/cakes?q=<term>`; results grid with count; empty state. **[Assumption]** |
| Header user icon | Signed out → `/login`. Signed in → menu with email + *Sign out*. **[Assumption]** |
| Header cart | → `/basket`; badge shows the number of items. **[Assumption]** (badge not in design) |
| Hamburger | Opens a sheet with the site navigation (the same links as the footer). **[Assumption]** |
| *Discover us* | → `/cakes`. |
| Category card | → `/cakes?category=<slug>`. Arrow circle fills on hover **[Figma variant]**. |
| Carousel arrows | Scroll the row by one card page. Disabled at the edges. |
| Heart | Toggle favourite (signed in) or show a toast with a *Log in* action. |
| Category tabs | Filter by category via `?category=`. *All Cakes* shows the collection rows. The chevron scrolls the tab strip. |
| Filter dialog | Price (0–1000+, slider + min/max inputs, both kept in sync), forms (multi-select chips), flavours (checkboxes). *Apply* writes the URL params and closes; *Reset all* clears them; ✕ / Esc / overlay closes without applying. |
| Weight chips | Single select (0.5 / 1 / 2 / 3 kg). Price updates live. **[Assumption]** The design shows "0.5 kq" twice, which we read as a typo for 1 kg. |
| Cake message | Optional, ≤ 60 characters. |
| *Add basket* | Server Action → toast "Added to basket". *Buy* adds the item and goes to `/checkout`. |
| Reviews | Like toggles (signed in). *Add a comment* posts a review (signed in, 3–1000 chars); guests see a log-in prompt. |
| Basket qty | − / + update the line (1–20). *Remove* deletes it. *Edit* opens the product (or the designer) prefilled, and saving updates the line. |
| Promo code | Validated on the server; shows the discount or an error. Hint text "20% off discount" **[Figma]**. |
| Checkout stepper | Steps validate before *Continue*. Completed steps can be revisited by clicking their circle. |
| Payment tabs | Credit card shows the card fields. Apple Pay / PayPal show a demo notice and need no fields. **[Decision: demo payment]** |
| Card fields | Validated in the browser only (Luhn check, expiry MM/YY in the future, CVV 3–4 digits). **They are never sent to the server**; only the method and last 4 digits are. |
| *Order* (step 3) | Server Action places the order (prices recalculated on the server), clears the basket and redirects to the success page. |
| Auth tabs | Links between `/signup` and `/login`. |
| *Create account* | Requires accepting the privacy terms; Supabase sign-up; may require email confirmation (message shown). |
| *Forgot password?* | Sends a reset email to the address typed in the Email field (validated first). |
| Google / Facebook | Supabase OAuth redirect. |
| *Flip the cake* | Mirrors the preview image with a 3D flip animation. **[Assumption]** There is only one preview image. |
| About-us rows | Expand to show a short answer (accordion). **[Assumption]** The ↗ arrow implies a destination that does not exist. |

Prototype connections: the MCP server does not expose prototype links, so none were retrieved. Navigation above is inferred from labels and screen order.

## 7. Assumptions, unknowns and deviations

1. **Brand.** The design's logo reads "bakerdays" and the About copy names "Bakingo", both real companies. **[Decision, confirmed]** We use **CakeHaven** with a text wordmark in `lilac` and rewrite those copy lines. The bakerdays logo asset is not used.
2. **Payment** is a demo. No payment provider is involved and card data never leaves the browser. **[Decision, confirmed]**
3. **Social sign-in** is wired through Supabase OAuth and needs provider credentials before it works. **[Decision, confirmed]**
4. **Prices.** Cards show `$70.00` while the detail page shows `80$` for a different product, and the basket shows `Sub Total 210$ / Total 260$`. These are inconsistent placeholders. We use one currency format (`$80.00`). The card price is the 0.5 kg price, and the detail page price follows the selected weight. Weight multipliers: 0.5 kg ×1, 1 kg ×1.8, 2 kg ×3.4, 3 kg ×4.8 **[Assumption]**.
5. **Designer options** and prices are only partly shown (cream options only). The other tabs' options and prices are **[Assumption]** and live in one typed config module.
6. **Address step** repeats an "Email" field already collected in step 1. **[Deviation]** We replace it with **Postcode**, which a delivery address needs.
7. **Spelling fixes** in UI copy: "Adress" → "Address", "Ocassion" → "Occasion", "ingridients" → "ingredients", "Design yor own" → "Design your own", "kq" → "kg", "Snikers" → "Snickers".
8. **Favourites** have no screen. Hearts toggle state only. A favourites page is listed as a follow-up.
9. **Orders history / profile** has no screen, so we don't build one. The user menu offers only *Sign out*.
10. **Category tab "All Cakes"** shows the four curated collections (as designed). Any other tab, search or filter shows a paginated grid. **[Assumption]**
11. **Fonts** are substituted as described in §4.2.
12. **Footer** says "© 2022". We render the current year.
