import { test } from "@playwright/test";

// Captures full-page screenshots for side-by-side comparison with the Figma
// frames (1440px desktop, 393px mobile). Not an assertion-based test.

const PAGES = [
  { name: "home", path: "/" },
  { name: "category", path: "/cakes" },
  { name: "product", path: "/cakes/very-berry-strawberry-cake" },
  { name: "design", path: "/design" },
  { name: "login", path: "/login" },
  { name: "signup", path: "/signup" },
  { name: "basket-empty", path: "/basket" },
];

for (const { name, path } of PAGES) {
  test(`screenshot ${name}`, async ({ page }) => {
    for (const [label, width] of [["desktop", 1440], ["mobile", 393]] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      // Scroll through the page so lazy-loaded images are fetched before capture.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 60));
        }
        window.scrollTo(0, 0);
      });
      // Off-screen carousel cards stay lazy by design, so cap the wait.
      await page
        .waitForFunction(() => [...document.images].every((img) => img.complete), undefined, { timeout: 5_000 })
        .catch(() => undefined);
      await page.screenshot({ path: `tests/e2e/__screenshots__/${name}-${label}.png`, fullPage: true });
    }
  });
}
