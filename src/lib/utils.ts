import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBigIntString(bigInt: string, decimalPlaces: number) {
  const padded = bigInt.padStart(decimalPlaces + 1, "0");
  const integerPart = padded.slice(0, -decimalPlaces);
  const fractionalPart = padded.slice(-decimalPlaces);
  return `${integerPart}.${fractionalPart}`;
}

export function toBigIntFixed6(value: string): string {
  const [whole, fraction = ""] = value.split(".");

  // Pad or trim the decimal part to exactly 6 digits
  const fractionPadded = (fraction + "000000").slice(0, 6);

  return whole + fractionPadded;
}
