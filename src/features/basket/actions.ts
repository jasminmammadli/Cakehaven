"use server";

import { z } from "zod";

import { getProductsByIds } from "@/features/catalog/repository";
import { designerOptionsSchema } from "@/features/designer/options";
import { invalidInput, type ActionResult } from "@/lib/action-result";

import { weightSchema } from "./pricing";
import {
  addProductLine,
  BasketFullError,
  cakeMessageSchema,
  MAX_BASKET_LINES,
  quantitySchema,
  type BasketLine,
} from "./schema";
import { findActivePromo } from "./service";
import { readBasket, writeBasket, writePromoCode } from "./store";

type BasketCount = { itemCount: number };

function countItems(lines: BasketLine[]): BasketCount {
  return { itemCount: lines.reduce((sum, line) => sum + line.quantity, 0) };
}

const addProductSchema = z.object({
  productId: z.uuid(),
  weight: weightSchema,
  message: cakeMessageSchema,
  quantity: quantitySchema.default(1),
  /** When set, replaces this line instead of adding (basket "Edit"). */
  editLineId: z.uuid().optional(),
});

export async function addProductToBasket(
  input: z.input<typeof addProductSchema>,
): Promise<ActionResult<BasketCount>> {
  const parsed = addProductSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);
  const { productId, weight, message, quantity, editLineId } = parsed.data;

  const [product] = await getProductsByIds([productId]);
  if (!product) return { ok: false, error: "This cake is no longer available." };

  const lines = await readBasket();
  let next: BasketLine[];

  if (editLineId && lines.some((line) => line.id === editLineId)) {
    next = lines.map((line) =>
      line.id === editLineId
        ? { id: line.id, kind: "product", productId, weight, message, quantity: line.quantity }
        : line,
    );
  } else {
    try {
      next = addProductLine(lines, { productId, weight, message, quantity }, crypto.randomUUID());
    } catch (error) {
      if (error instanceof BasketFullError) return { ok: false, error: error.message };
      throw error;
    }
  }

  await writeBasket(next);
  return { ok: true, data: countItems(next) };
}

const addCustomSchema = z.object({
  options: designerOptionsSchema,
  editLineId: z.uuid().optional(),
});

export async function addCustomCakeToBasket(
  input: z.input<typeof addCustomSchema>,
): Promise<ActionResult<BasketCount>> {
  const parsed = addCustomSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);
  const { options, editLineId } = parsed.data;

  const lines = await readBasket();
  let next: BasketLine[];

  if (editLineId && lines.some((line) => line.id === editLineId)) {
    next = lines.map((line) =>
      line.id === editLineId ? { id: line.id, kind: "custom", options, quantity: line.quantity } : line,
    );
  } else {
    if (lines.length >= MAX_BASKET_LINES) return { ok: false, error: new BasketFullError().message };
    next = [...lines, { id: crypto.randomUUID(), kind: "custom", options, quantity: 1 }];
  }

  await writeBasket(next);
  return { ok: true, data: countItems(next) };
}

const updateQuantitySchema = z.object({ lineId: z.uuid(), quantity: quantitySchema });

export async function updateBasketQuantity(
  input: z.input<typeof updateQuantitySchema>,
): Promise<ActionResult<BasketCount>> {
  const parsed = updateQuantitySchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error, "Quantity must be between 1 and 20.");

  const lines = await readBasket();
  if (!lines.some((line) => line.id === parsed.data.lineId)) {
    return { ok: false, error: "That item is no longer in your basket." };
  }

  const next = lines.map((line) =>
    line.id === parsed.data.lineId ? { ...line, quantity: parsed.data.quantity } : line,
  );
  await writeBasket(next);
  return { ok: true, data: countItems(next) };
}

export async function removeBasketLine(lineId: string): Promise<ActionResult<BasketCount>> {
  const parsed = z.uuid().safeParse(lineId);
  if (!parsed.success) return { ok: false, error: "Unknown basket item." };

  const next = (await readBasket()).filter((line) => line.id !== parsed.data);
  await writeBasket(next);
  return { ok: true, data: countItems(next) };
}

const promoSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{3,30}$/, "Promo codes are 3–30 letters or digits."),
});

export async function applyPromoCode(
  _prev: ActionResult<{ code: string; percentOff: number }> | null,
  formData: FormData,
): Promise<ActionResult<{ code: string; percentOff: number }>> {
  const parsed = promoSchema.safeParse({ code: formData.get("code") ?? "" });
  if (!parsed.success) return invalidInput(parsed.error, parsed.error.issues[0]?.message);

  const promo = await findActivePromo(parsed.data.code);
  if (!promo) return { ok: false, error: "This promo code is not valid." };

  await writePromoCode(promo.code);
  return { ok: true, data: promo };
}

export async function removePromoCode(): Promise<ActionResult> {
  await writePromoCode(null);
  return { ok: true };
}
