import { describe, expect, it } from "vitest";

import { computeTotals, priceForWeight } from "@/features/basket/pricing";
import { DEFAULT_DESIGN, describeDesign, designerOptionsSchema, designerPrice } from "@/features/designer/options";

describe("priceForWeight", () => {
  it("uses the base price for 0.5 kg", () => {
    expect(priceForWeight(4500, "0.5")).toBe(4500);
  });

  it("scales larger weights and rounds to whole cents", () => {
    expect(priceForWeight(4500, "1")).toBe(8100);
    expect(priceForWeight(4500, "2")).toBe(15300);
    expect(priceForWeight(3333, "1")).toBe(5999);
  });
});

describe("computeTotals", () => {
  it("sums lines without a promo", () => {
    expect(computeTotals([8000, 6000, 7000], null)).toEqual({
      subtotalCents: 21000,
      discountCents: 0,
      totalCents: 21000,
    });
  });

  it("applies a percentage discount and keeps total = subtotal - discount", () => {
    const totals = computeTotals([8000, 6000, 7000], 20);
    expect(totals).toEqual({ subtotalCents: 21000, discountCents: 4200, totalCents: 16800 });
  });

  it("rounds discounts to whole cents", () => {
    const totals = computeTotals([999], 15);
    expect(totals.discountCents).toBe(150);
    expect(totals.totalCents).toBe(849);
  });

  it("handles an empty basket", () => {
    expect(computeTotals([], 20)).toEqual({ subtotalCents: 0, discountCents: 0, totalCents: 0 });
  });
});

describe("designer", () => {
  it("prices the default design at $80, matching the Figma total", () => {
    expect(designerPrice(DEFAULT_DESIGN)).toBe(8000);
  });

  it("rejects options that are not in the catalogue", () => {
    const result = designerOptionsSchema.safeParse({ ...DEFAULT_DESIGN, cream: "mustard" });
    expect(result.success).toBe(false);
  });

  it("limits the cake text length", () => {
    expect(designerOptionsSchema.safeParse({ ...DEFAULT_DESIGN, text: "x".repeat(41) }).success).toBe(false);
  });

  it("describes a design and omits 'none' choices", () => {
    expect(describeDesign({ ...DEFAULT_DESIGN, filling: "none", decor: "none", text: "Hi Sam" })).toBe(
      "1 kg, chocolate sponge, chocolate cream, “Hi Sam”",
    );
  });
});
