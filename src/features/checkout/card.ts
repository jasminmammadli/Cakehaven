/**
 * Client-side card checks for the demo payment step. Card numbers and CVVs
 * are validated in the browser and never sent to the server.
 */

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Groups digits in fours: "4242424242424242" -> "4242 4242 4242 4242". */
export function formatCardNumber(value: string): string {
  return digitsOnly(value)
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function isValidLuhn(value: string): boolean {
  const digits = digitsOnly(value);
  if (digits.length < 12 || digits.length > 19) return false;

  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Formats raw input as MM/YY while typing. */
export function formatExpiry(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

/** True when MM/YY is a real month that has not ended yet. */
export function isValidExpiry(value: string, now: Date = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;

  // The card is valid through the last day of its expiry month.
  const firstDayAfterExpiry = new Date(year, month, 1);
  return firstDayAfterExpiry > now;
}

export function isValidCvv(value: string): boolean {
  return /^\d{3,4}$/.test(value);
}

export function lastFour(cardNumber: string): string {
  return digitsOnly(cardNumber).slice(-4);
}
