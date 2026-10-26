import { expect, test, type Page } from "@playwright/test";

import { admin, deleteUserByEmail } from "./helpers";

// Cache Components keeps recently visited routes mounted but hidden (React <Activity>),
// so text lookups must ignore hidden copies.
const seen = (page: Page, text: string | RegExp, exact?: boolean) =>
  page.getByText(text, { exact }).filter({ visible: true });

test.describe("browsing", () => {
  test("home page shows the hero, categories and collections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: /Indulge in Sweet Delights/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Category of cakes" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sweet Success" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Designer Cakes" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Chocolate Truffle Cake/ }).first()).toBeVisible();

    await page.getByRole("button", { name: "Why choose CakeHaven for online cakes" }).click();
    await expect(seen(page, "Every cake is baked to order")).toBeVisible();
  });

  test("category tabs, filters and search narrow the catalogue", async ({ page }) => {
    await page.goto("/cakes");
    await expect(page.getByRole("heading", { name: "Trending Cakes" })).toBeVisible();

    await page.getByRole("link", { name: /Wedding\s*Cakes/ }).click();
    await expect(page).toHaveURL(/category=wedding/);
    await expect(page.getByRole("heading", { name: "Wedding cakes" })).toBeVisible();
    await expect(seen(page, "2 cakes")).toBeVisible();

    await page.getByRole("button", { name: /Filter/ }).click();
    const dialog = page.getByRole("dialog", { name: "Type of cakes" });
    await dialog.getByRole("checkbox", { name: "Caramel" }).click();
    await dialog.getByRole("button", { name: "Apply" }).click();
    await expect(page).toHaveURL(/category=wedding.*flavour=caramel/);
    await expect(seen(page, "1 cake", true)).toBeVisible();
    await expect(page.getByRole("link", { name: /Butterscotch Cherry Topped Cake/ })).toBeVisible();

    await page.getByRole("searchbox", { name: "Search cakes" }).fill("velvet");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Results for “velvet”" })).toBeVisible();
    await expect(seen(page, "2 cakes")).toBeVisible();

    await page.goto("/cakes?category=cupcakes");
    await expect(page.getByRole("heading", { name: "No cakes match" })).toBeVisible();
  });

  test("unknown products show a not-found page that search engines skip", async ({ page }) => {
    // The product is resolved inside a streamed <Suspense> boundary, so the HTTP
    // status is already 200 when notFound() runs; Next marks the page noindex instead.
    await page.goto("/cakes/does-not-exist");
    await expect(page.getByRole("heading", { name: "Cake not found" })).toBeVisible();
    await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();

    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });
});

test.describe("buying a cake as a guest", () => {
  test("product → basket → promo → checkout → success", async ({ page }) => {
    await page.goto("/cakes/very-berry-strawberry-cake");
    await expect(page.getByRole("heading", { level: 1, name: "Very Berry Strawberry Cake" })).toBeVisible();
    await expect(seen(page, "$81.00")).toBeVisible();

    await page.getByRole("radio", { name: "2 kg" }).click();
    await expect(seen(page, "$153.00")).toBeVisible();
    await page.getByLabel("Cake message").fill("Happy birthday, Sam!");
    await page.getByRole("button", { name: "Add basket" }).click();
    await expect(seen(page, "Very Berry Strawberry Cake added to your basket")).toBeVisible();
    await expect(page.getByRole("link", { name: "Basket, 1 item" })).toBeVisible();

    await page.goto("/basket");
    await expect(seen(page, "( 1 item )")).toBeVisible();
    await page.getByRole("button", { name: "Increase quantity" }).click();
    await expect(seen(page, "( 2 items )")).toBeVisible();
    await expect(seen(page, "Total: $306.00")).toBeVisible();

    await page.getByPlaceholder("Promocode").fill("NOPE");
    await page.getByRole("button", { name: "Apply promo code" }).click();
    await expect(seen(page, "This promo code is not valid.")).toBeVisible();

    await page.getByPlaceholder("Promocode").fill("sweet20");
    await page.getByRole("button", { name: "Apply promo code" }).click();
    await expect(seen(page, "20% off discount")).toBeVisible();
    await expect(seen(page, "Total: $244.80")).toBeVisible();

    await page.getByRole("link", { name: "Order basket" }).click();
    await expect(page).toHaveURL(/\/checkout$/);

    // Step 1 validation
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(seen(page, "Enter your full name")).toBeVisible();
    await page.getByLabel("Full name").fill("Sam Baker");
    await page.getByLabel("Phone number").fill("+44 20 1234 5678");
    const email = `guest-${Date.now()}@cakehaven.test`;
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 2: card checks happen in the browser
    await page.getByLabel("Name on card").fill("Sam Baker");
    await page.getByLabel("Card number").fill("4242424242424241");
    await page.getByLabel("Date (MM/YY)").fill("1235");
    await page.getByLabel("Cvv").fill("123");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(seen(page, "Enter a valid card number")).toBeVisible();
    await page.getByLabel("Card number").fill("4242424242424242");
    await expect(page.getByLabel("Card number")).toHaveValue("4242 4242 4242 4242");
    await page.getByRole("button", { name: "Continue" }).click();

    // Step 3
    await seen(page, "Office", true).click();
    await page.getByLabel("City").fill("London");
    await page.getByLabel("Delivery address").fill("1 Cake Lane");
    await page.getByLabel("Postcode").fill("N1 1AA");
    await page.getByRole("button", { name: "Order", exact: true }).click();

    await expect(page).toHaveURL(/\/checkout\/success\?ref=/);
    await expect(page.getByRole("heading", { name: "Payment success" })).toBeVisible();
    const reference = new URL(page.url()).searchParams.get("ref")!;

    const { data: order } = await admin
      .from("orders")
      .select("id, total_cents, discount_cents, card_last4, address_type, promo_code, order_items(quantity, unit_price_cents, details)")
      .eq("reference", reference)
      .single();
    expect(order).toMatchObject({
      total_cents: 24480,
      discount_cents: 6120,
      card_last4: "4242",
      address_type: "office",
      promo_code: "SWEET20",
      order_items: [{ quantity: 2, unit_price_cents: 15300, details: { weight: "2 kg", message: "Happy birthday, Sam!" } }],
    });

    await page.goto("/basket");
    await expect(page.getByRole("heading", { name: "Your basket is empty" })).toBeVisible();

    await admin.from("orders").delete().eq("id", order!.id);
  });

  test("custom cake from the designer can be edited from the basket", async ({ page }) => {
    await page.goto("/design");
    await expect(seen(page, "Total: $80.00")).toBeVisible();
    await page.getByRole("tab", { name: "size" }).click();
    await page.getByRole("radio", { name: "2 kg" }).click();
    await page.getByRole("tab", { name: "text" }).click();
    await page.getByLabel("Text on the cake").fill("Congrats!");
    await expect(seen(page, "Total: $115.00")).toBeVisible();
    await page.getByRole("button", { name: "Flip the cake" }).click();
    await page.getByRole("button", { name: "Order", exact: true }).click();

    await expect(page).toHaveURL(/\/basket$/);
    await expect(page.getByRole("heading", { name: "Custom cake" })).toBeVisible();
    await expect(seen(page, "2 kg, chocolate sponge")).toBeVisible();

    await page.getByRole("link", { name: "Edit Custom cake" }).click();
    await expect(seen(page, "Total: $115.00")).toBeVisible();
    await page.getByRole("tab", { name: "cream" }).click();
    await page.getByRole("radio", { name: /vanilla/ }).click();
    await page.getByRole("button", { name: "Update" }).click();
    await expect(page).toHaveURL(/\/basket$/);
    await expect(seen(page, "Total: $110.00")).toBeVisible();

    await page.getByRole("button", { name: "Remove Custom cake from basket" }).click();
    await expect(page.getByRole("heading", { name: "Your basket is empty" })).toBeVisible();
  });

  test("guests are asked to log in before saving favourites", async ({ page }) => {
    await page.goto("/cakes/very-berry-strawberry-cake");
    await page.getByRole("button", { name: "Add Very Berry Strawberry Cake to favourites" }).click();
    await expect(seen(page, "Log in to save your favourite cakes")).toBeVisible();
    await expect(seen(page, "to add a comment.")).toBeVisible();
  });
});

test.describe("accounts", () => {
  const email = `e2e-${Date.now()}@cakehaven.test`;
  const password = "correct-horse-battery";

  test.afterAll(async () => {
    await deleteUserByEmail(email);
  });

  test("sign up, favourite, review, like, sign out and log back in", async ({ page }) => {
    await page.goto("/signup?next=/cakes/very-berry-strawberry-cake");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(seen(page, "Enter your full name")).toBeVisible();
    await expect(seen(page, "Please accept the privacy policy")).toBeVisible();

    await page.getByLabel("Full name").fill("Robin Tester");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("checkbox", { name: "I accept the privacy policy" }).click();
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/cakes\/very-berry-strawberry-cake$/);
    await expect(page.getByRole("button", { name: "Account menu" })).toBeVisible();

    const heart = page.getByRole("button", { name: /Very Berry Strawberry Cake (to|from) favourites/ });
    await heart.click();
    await expect(page.getByRole("button", { name: "Remove Very Berry Strawberry Cake from favourites" })).toHaveAttribute("aria-pressed", "true");

    await page.getByLabel("Add a comment").fill("Fresh, light and not too sweet.");
    await page.getByRole("button", { name: "Post comment" }).click();
    await expect(seen(page, "Thanks! Your review is live.")).toBeVisible();
    const review = page.getByRole("listitem").filter({ hasText: "Fresh, light and not too sweet." });
    await expect(review.getByRole("heading", { name: "Robin Tester" })).toBeVisible();

    const like = page.getByRole("button", { name: "Like review by Christopher Nguyen" });
    await expect(like).toHaveText("21");
    await like.click();
    await expect(page.getByRole("button", { name: "Unlike review by Christopher Nguyen" })).toHaveText("22");
    await page.getByRole("button", { name: "Unlike review by Christopher Nguyen" }).click();
    await expect(page.getByRole("button", { name: "Like review by Christopher Nguyen" })).toHaveText("21");

    await page.reload();
    await expect(page.getByRole("button", { name: "Remove Very Berry Strawberry Cake from favourites" })).toBeVisible();

    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();

    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(seen(page, "Incorrect email or password.")).toBeVisible();
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("button", { name: "Account menu" })).toBeVisible();

    // Clean up the review written by this test user.
    await admin.from("reviews").delete().eq("body", "Fresh, light and not too sweet.");
  });
});
