import { z } from "zod";

/**
 * Weight options shown on the product page. The design shows four chips; the
 * second reads "0.5 kq" (a typo), interpreted as 1 kg.
 * Multipliers are a product assumption documented in docs/figma-analysis.md.
 */
export const WEIGHTS = ["0.5", "1", "2", "3"] as const;
export const weightSchema = z.enum(WEIGHTS);
export type Weight = z.infer<typeof weightSchema>;

export const DEFAULT_WEIGHT: Weight = "1";

const WEIGHT_MULTIPLIER: Record<Weight, number> = {
  "0.5": 1,
  "1": 1.8,
  "2": 3.4,
  "3": 4.8,
};

export function weightLabel(weight: Weight): string {
  return `${weight} kg`;
}

/** Price for one cake of the given weight, from the 0.5 kg base price. */
export function priceForWeight(basePriceCents: number, weight: Weight): number {
  return Math.round(basePriceCents * WEIGHT_MULTIPLIER[weight]);
}

export const MAX_LINE_QUANTITY = 20;

export function lineTotal(unitPriceCents: number, quantity: number): number {
  return unitPriceCents * quantity;
}

export type Totals = {
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
};

export function computeTotals(lineTotalsCents: number[], percentOff: number | null): Totals {
  const subtotalCents = lineTotalsCents.reduce((sum, value) => sum + value, 0);
  const discountCents = percentOff ? Math.round((subtotalCents * percentOff) / 100) : 0;
  return { subtotalCents, discountCents, totalCents: subtotalCents - discountCents };
}
