import "server-only";

import { getProductsByIds } from "@/features/catalog/repository";
import { createAdminClient } from "@/lib/supabase/admin";

import { readBasket, readPromoCode } from "./store";
import { buildBasketView, type BasketView } from "./view";

export type ActivePromo = { code: string; percentOff: number };

/** Promo codes are not readable by anon/authenticated (RLS), so use the admin client. */
export async function findActivePromo(code: string): Promise<ActivePromo | null> {
  const { data, error } = await createAdminClient()
    .from("promo_codes")
    .select("code, percent_off, expires_at")
    .eq("code", code.trim().toUpperCase())
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Failed to look up promo code: ${error.message}`);
  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at) <= new Date()) return null;
  return { code: data.code, percentOff: data.percent_off };
}

/** The visitor's basket, priced on the server. Reads cookies (dynamic). */
export async function getBasketView(): Promise<BasketView> {
  const [lines, promoCode] = await Promise.all([readBasket(), readPromoCode()]);
  if (lines.length === 0) return buildBasketView([], [], null);

  const productIds = lines.flatMap((line) => (line.kind === "product" ? [line.productId] : []));
  const [products, promo] = await Promise.all([
    getProductsByIds(productIds),
    promoCode ? findActivePromo(promoCode) : Promise.resolve(null),
  ]);

  return buildBasketView(lines, products, promo);
}
