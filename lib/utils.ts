import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts an amount from miliunits to the corresponding value by dividing it by 1000.
 *
 * @param {number} amount - The amount in miliunits to be converted.
 * @return {number} The converted amount.
 */
export function convertAmountFromMiliunits(amount: number) {
  return amount / 1000;
}

/**
 * Converts an amount to miliunits by multiplying it by 1000 and rounding it to the nearest integer.
 *
 * @param {number} amount - The amount to convert.
 * @return {number} The converted amount in miliunits.
 */
export function convertAmountToMiliunits(amount: number) {
  return Math.round(amount * 1000);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}
