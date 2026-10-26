import { describe, expect, it } from "vitest";

import { formatCardNumber, formatExpiry, isValidExpiry, isValidLuhn, lastFour } from "@/features/checkout/card";
import { cardFormSchema, placeOrderSchema, toPaymentPayload } from "@/features/checkout/schemas";

describe("card helpers", () => {
  it("validates card numbers with the Luhn check", () => {
    expect(isValidLuhn("4242 4242 4242 4242")).toBe(true);
    expect(isValidLuhn("4242 4242 4242 4241")).toBe(false);
    expect(isValidLuhn("1234")).toBe(false);
  });

  it("formats input as the user types", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
    expect(formatExpiry("1229")).toBe("12/29");
    expect(formatExpiry("1")).toBe("1");
  });

  it("accepts an expiry until the end of its month", () => {
    const now = new Date(2026, 9, 26); // 26 Oct 2026
    expect(isValidExpiry("10/26", now)).toBe(true);
    expect(isValidExpiry("09/26", now)).toBe(false);
    expect(isValidExpiry("13/30", now)).toBe(false);
    expect(isValidExpiry("1/30", now)).toBe(false);
  });

  it("extracts the last four digits", () => {
    expect(lastFour("4242 4242 4242 1234")).toBe("1234");
  });
});

describe("payment boundary", () => {
  const card = {
    method: "card" as const,
    nameOnCard: "Sam Baker",
    cardNumber: "4242 4242 4242 4242",
    expiry: "12/35",
    cvv: "123",
  };

  it("validates the card form only for the card method", () => {
    expect(cardFormSchema.safeParse(card).success).toBe(true);
    expect(cardFormSchema.safeParse({ ...card, cvv: "1" }).success).toBe(false);
    expect(cardFormSchema.safeParse({ ...card, method: "paypal", cardNumber: "", cvv: "" }).success).toBe(true);
  });

  it("sends only the method and last four digits to the server", () => {
    const payload = toPaymentPayload(card);
    expect(payload).toEqual({ method: "card", cardLast4: "4242" });
    expect(JSON.stringify(payload)).not.toContain("4242 4242");
    expect(JSON.stringify(payload)).not.toContain("123");
  });

  it("rejects an order payload that tries to include card data", () => {
    const parsed = placeOrderSchema.parse({
      personal: { fullName: "Sam Baker", phone: "+44 20 1234 5678", email: "sam@example.com" },
      address: { addressType: "home", city: "London", addressLine: "1 Cake Lane", postcode: "N1 1AA" },
      payment: { method: "card", cardLast4: "4242", cardNumber: "4242424242424242", cvv: "123" },
    });
    expect(parsed.payment).toEqual({ method: "card", cardLast4: "4242" });
  });
});
