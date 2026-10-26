import { z } from "zod";

import { designerOptionsSchema } from "@/features/designer/options";

import { MAX_LINE_QUANTITY, weightSchema } from "./pricing";

export const MAX_BASKET_LINES = 20;
export const CAKE_MESSAGE_MAX = 60;

export const quantitySchema = z.coerce.number().int().min(1).max(MAX_LINE_QUANTITY);
export const cakeMessageSchema = z.string().trim().max(CAKE_MESSAGE_MAX).default("");

const productLineSchema = z.object({
  id: z.uuid(),
  kind: z.literal("product"),
  productId: z.uuid(),
  weight: weightSchema,
  message: cakeMessageSchema,
  quantity: quantitySchema,
});

const customLineSchema = z.object({
  id: z.uuid(),
  kind: z.literal("custom"),
  options: designerOptionsSchema,
  quantity: quantitySchema,
});

export const basketLineSchema = z.discriminatedUnion("kind", [productLineSchema, customLineSchema]);
export const basketSchema = z.array(basketLineSchema).max(MAX_BASKET_LINES);

export type ProductLine = z.infer<typeof productLineSchema>;
export type CustomLine = z.infer<typeof customLineSchema>;
export type BasketLine = z.infer<typeof basketLineSchema>;

/** Parses the raw cookie value. Anything invalid yields an empty basket. */
export function parseBasketCookie(raw: string | undefined): BasketLine[] {
  if (!raw) return [];
  try {
    const result = basketSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

/** Adds a product line, merging with an identical line (same weight and message). */
export function addProductLine(
  lines: BasketLine[],
  input: Omit<ProductLine, "id" | "kind">,
  newId: string,
): BasketLine[] {
  const existing = lines.find(
    (line): line is ProductLine =>
      line.kind === "product" &&
      line.productId === input.productId &&
      line.weight === input.weight &&
      line.message === input.message,
  );

  if (existing) {
    return lines.map((line) =>
      line.id === existing.id
        ? { ...existing, quantity: Math.min(existing.quantity + input.quantity, MAX_LINE_QUANTITY) }
        : line,
    );
  }

  if (lines.length >= MAX_BASKET_LINES) {
    throw new BasketFullError();
  }

  return [...lines, { id: newId, kind: "product", ...input }];
}

export class BasketFullError extends Error {
  constructor() {
    super(`Your basket can hold up to ${MAX_BASKET_LINES} different items.`);
    this.name = "BasketFullError";
  }
}
