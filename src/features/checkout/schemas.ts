import { z } from "zod";

import { isValidCvv, isValidExpiry, isValidLuhn, lastFour } from "./card";

// Shared by the checkout form (client) and placeOrder (server).

export const personalSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{6,30}$/, "Enter a valid phone number"),
  email: z.email("Enter a valid email address").trim().max(254),
});

export const ADDRESS_TYPES = ["home", "office", "other"] as const;

export const addressSchema = z.object({
  addressType: z.enum(ADDRESS_TYPES),
  city: z.string().trim().min(2, "Enter your city").max(100),
  addressLine: z.string().trim().min(3, "Enter the delivery address").max(200),
  postcode: z.string().trim().min(2, "Enter your postcode").max(20),
});

export const PAYMENT_METHODS = ["card", "apple_pay", "paypal"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Card fields as typed in the browser. Never sent to the server. */
export const cardFormSchema = z.object({
  method: z.enum(PAYMENT_METHODS),
  nameOnCard: z.string().trim(),
  cardNumber: z.string(),
  expiry: z.string(),
  cvv: z.string(),
}).superRefine((value, ctx) => {
  if (value.method !== "card") return;
  if (value.nameOnCard.length < 2) {
    ctx.addIssue({ code: "custom", path: ["nameOnCard"], message: "Enter the name on the card" });
  }
  if (!isValidLuhn(value.cardNumber)) {
    ctx.addIssue({ code: "custom", path: ["cardNumber"], message: "Enter a valid card number" });
  }
  if (!isValidExpiry(value.expiry)) {
    ctx.addIssue({ code: "custom", path: ["expiry"], message: "Use MM/YY and a future date" });
  }
  if (!isValidCvv(value.cvv)) {
    ctx.addIssue({ code: "custom", path: ["cvv"], message: "3 or 4 digits" });
  }
});

export type CardForm = z.infer<typeof cardFormSchema>;

/** What the server receives about payment. */
export const paymentSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("card"), cardLast4: z.string().regex(/^\d{4}$/) }),
  z.object({ method: z.literal("apple_pay") }),
  z.object({ method: z.literal("paypal") }),
]);

export function toPaymentPayload(card: CardForm): z.infer<typeof paymentSchema> {
  return card.method === "card"
    ? { method: "card", cardLast4: lastFour(card.cardNumber) }
    : { method: card.method };
}

export const placeOrderSchema = z.object({
  personal: personalSchema,
  address: addressSchema,
  payment: paymentSchema,
});

export type PersonalInput = z.infer<typeof personalSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
