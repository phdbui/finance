import { type ClassValue, clsx } from "clsx";
import { eachDayOfInterval, format, isSameDay, subDays } from "date-fns";
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

export function calculatePercentage(current: number, previous: number) {
  if (previous === 0) {
    return previous === current ? 0 : 100;
  } else return (100 * (current - previous)) / previous;
}

export function fillMissingDays(
  activeDays: {
    date: Date;
    income: number;
    expenses: number;
  }[],
  startDate: Date,
  endDate: Date
) {
  if (activeDays.length === 0) {
    return [];
  }
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  const transactionByDay = allDays.map((day) => {
    const found = activeDays.find((d) => isSameDay(d.date, day));
    if (found) {
      return found;
    } else {
      return { date: day, income: 0, expenses: 0 };
    }
  });
  return transactionByDay;
}

type Period = {
  from: Date | string | undefined;
  to: Date | string | undefined;
};
export const formatDateRange = (period?: Period) => {
  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);
  if (!period?.from) {
    return `${format(defaultFrom, "LLL dd")} - ${format(
      defaultTo,
      "LLL dd, y"
    )}`;
  }

  if (period.to) {
    return `${format(period.from, "LLL dd")} - ${format(
      period.to,
      "LLL dd, y"
    )}`;
  }

  return format(period.from, "LLL dd, y");
};

export const formatPercentage = (
  value: number,
  options: { addPrefix?: boolean } = { addPrefix: false }
) => {
  const result = new Intl.NumberFormat("en-US", {
    style: "percent",
  }).format(value / 100);
  if (options.addPrefix && value > 0) {
    return `+${result}`;
  }

  return result;
};
