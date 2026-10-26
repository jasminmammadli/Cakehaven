"use server";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/session";
import { getBasketView } from "@/features/basket/service";
import { clearBasket } from "@/features/basket/store";
import { invalidInput, type ActionResult } from "@/lib/action-result";
import { createAdminClient } from "@/lib/supabase/admin";

import { placeOrderSchema, type PlaceOrderInput } from "./schemas";

/**
 * Creates the order from the server-side basket. The client only sends
 * contact, address and payment-method details; all prices are recomputed here.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<ActionResult> {
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) return invalidInput(parsed.error);
  const { personal, address, payment } = parsed.data;

  const [basket, user] = await Promise.all([getBasketView(), getCurrentUser()]);
  if (basket.lines.length === 0) {
    return { ok: false, error: "Your basket is empty." };
  }

  const { data, error } = await createAdminClient()
    .rpc("create_order", {
      p_order: {
        user_id: user?.id ?? "",
        customer_name: personal.fullName,
        phone: personal.phone,
        email: personal.email,
        address_type: address.addressType,
        city: address.city,
        address_line: address.addressLine,
        postcode: address.postcode,
        payment_method: payment.method,
        card_last4: payment.method === "card" ? payment.cardLast4 : "",
        subtotal_cents: basket.totals.subtotalCents,
        discount_cents: basket.totals.discountCents,
        total_cents: basket.totals.totalCents,
        promo_code: basket.promo?.code ?? "",
      },
      p_items: basket.lines.map((line) => ({
        product_id: line.productId,
        kind: line.kind,
        name: line.name,
        details: line.details,
        unit_price_cents: line.unitPriceCents,
        quantity: line.quantity,
      })),
    })
    .single();

  if (error || !data) {
    console.error("create_order failed", error?.message);
    return { ok: false, error: "We couldn't place your order. You have not been charged; please try again." };
  }

  await clearBasket();
  redirect(`/checkout/success?ref=${encodeURIComponent(data.reference)}`);
}
