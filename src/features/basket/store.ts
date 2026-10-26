import "server-only";

import { cookies } from "next/headers";

import { parseBasketCookie, type BasketLine } from "./schema";

// The basket lives in an httpOnly cookie and stores no prices; see
// docs/architecture.md §5. Writes are only possible in Server Actions.

const BASKET_COOKIE = "ch_basket";
const PROMO_COOKIE = "ch_promo";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
} as const;

export async function readBasket(): Promise<BasketLine[]> {
  return parseBasketCookie((await cookies()).get(BASKET_COOKIE)?.value);
}

export async function writeBasket(lines: BasketLine[]): Promise<void> {
  const store = await cookies();
  if (lines.length === 0) {
    store.delete(BASKET_COOKIE);
    return;
  }
  store.set(BASKET_COOKIE, JSON.stringify(lines), cookieOptions);
}

export async function readPromoCode(): Promise<string | null> {
  const value = (await cookies()).get(PROMO_COOKIE)?.value;
  return value && /^[A-Z0-9]{3,30}$/.test(value) ? value : null;
}

export async function writePromoCode(code: string | null): Promise<void> {
  const store = await cookies();
  if (code) store.set(PROMO_COOKIE, code, cookieOptions);
  else store.delete(PROMO_COOKIE);
}

export async function clearBasket(): Promise<void> {
  const store = await cookies();
  store.delete(BASKET_COOKIE);
  store.delete(PROMO_COOKIE);
}
