import { describe, expect, it } from "vitest";

import {
  addProductLine,
  BasketFullError,
  MAX_BASKET_LINES,
  parseBasketCookie,
  type BasketLine,
} from "@/features/basket/schema";
import { buildBasketView } from "@/features/basket/view";
import { DEFAULT_DESIGN } from "@/features/designer/options";

const PRODUCT_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_PRODUCT_ID = "22222222-2222-4222-8222-222222222222";
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const product = {
  id: PRODUCT_ID,
  slug: "very-berry",
  name: "Very Berry",
  ingredients: "Strawberry, cream",
  basePriceCents: 4500,
  imageUrl: "/images/x.jpg",
};

describe("parseBasketCookie", () => {
  it("returns an empty basket for missing, malformed or invalid cookies", () => {
    expect(parseBasketCookie(undefined)).toEqual([]);
    expect(parseBasketCookie("not json")).toEqual([]);
    expect(parseBasketCookie(JSON.stringify([{ kind: "product", productId: "nope" }]))).toEqual([]);
  });

  it("rejects tampered quantities and weights", () => {
    const line = { id: uuid(1), kind: "product", productId: PRODUCT_ID, weight: "1", message: "", quantity: 999 };
    expect(parseBasketCookie(JSON.stringify([line]))).toEqual([]);
    expect(parseBasketCookie(JSON.stringify([{ ...line, quantity: 1, weight: "5" }]))).toEqual([]);
  });

  it("ignores any price smuggled into the cookie", () => {
    const line = { id: uuid(1), kind: "product", productId: PRODUCT_ID, weight: "1", message: "", quantity: 1, priceCents: 1 };
    const [parsed] = parseBasketCookie(JSON.stringify([line]));
    expect(parsed).not.toHaveProperty("priceCents");
  });
});

describe("addProductLine", () => {
  it("merges identical lines and caps the quantity at 20", () => {
    const start = addProductLine([], { productId: PRODUCT_ID, weight: "1", message: "", quantity: 15 }, uuid(1));
    const merged = addProductLine(start, { productId: PRODUCT_ID, weight: "1", message: "", quantity: 10 }, uuid(2));
    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(20);
  });

  it("keeps different weights or messages as separate lines", () => {
    let lines: BasketLine[] = [];
    lines = addProductLine(lines, { productId: PRODUCT_ID, weight: "1", message: "", quantity: 1 }, uuid(1));
    lines = addProductLine(lines, { productId: PRODUCT_ID, weight: "2", message: "", quantity: 1 }, uuid(2));
    lines = addProductLine(lines, { productId: PRODUCT_ID, weight: "2", message: "Happy birthday", quantity: 1 }, uuid(3));
    expect(lines).toHaveLength(3);
  });

  it("refuses to exceed the line limit", () => {
    const full: BasketLine[] = Array.from({ length: MAX_BASKET_LINES }, (_, i) => ({
      id: uuid(i + 1),
      kind: "custom",
      options: DEFAULT_DESIGN,
      quantity: 1,
    }));
    expect(() =>
      addProductLine(full, { productId: PRODUCT_ID, weight: "1", message: "", quantity: 1 }, uuid(99)),
    ).toThrow(BasketFullError);
  });
});

describe("buildBasketView", () => {
  it("prices lines from product data and the designer catalogue", () => {
    const lines: BasketLine[] = [
      { id: uuid(1), kind: "product", productId: PRODUCT_ID, weight: "1", message: "Hi", quantity: 2 },
      { id: uuid(2), kind: "custom", options: DEFAULT_DESIGN, quantity: 1 },
    ];
    const view = buildBasketView(lines, [product], { code: "SWEET20", percentOff: 20 });

    expect(view.lines.map((l) => l.lineTotalCents)).toEqual([16200, 8000]);
    expect(view.itemCount).toBe(3);
    expect(view.totals).toEqual({ subtotalCents: 24200, discountCents: 4840, totalCents: 19360 });
    expect(view.lines[0].editHref).toBe(`/cakes/very-berry?edit=${uuid(1)}`);
    expect(view.lines[0].details).toEqual({ weight: "1 kg", message: "Hi" });
  });

  it("drops lines whose product no longer exists", () => {
    const lines: BasketLine[] = [
      { id: uuid(1), kind: "product", productId: OTHER_PRODUCT_ID, weight: "1", message: "", quantity: 1 },
    ];
    const view = buildBasketView(lines, [product], null);
    expect(view.lines).toEqual([]);
    expect(view.totals.totalCents).toBe(0);
  });
});
