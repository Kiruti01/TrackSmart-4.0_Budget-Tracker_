import { Currencies } from "@/lib/currencies";

// FIXED: Properly convert local date to UTC
export function DateToUTCDate(date: Date) {
  // Get local date components
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();

  // Create UTC date (this is the key fix)
  return new Date(
    Date.UTC(year, month, day, hours, minutes, seconds, milliseconds)
  );
}

// Alternative: Convert local date to UTC start of day
export function getStartOfDayUTC(date: Date): Date {
  const localStart = new Date(date);
  localStart.setHours(0, 0, 0, 0);

  // Convert to UTC
  return new Date(
    Date.UTC(
      localStart.getFullYear(),
      localStart.getMonth(),
      localStart.getDate(),
      0,
      0,
      0,
      0
    )
  );
}

// Alternative: Convert local date to UTC end of day
export function getEndOfDayUTC(date: Date): Date {
  const localEnd = new Date(date);
  localEnd.setHours(23, 59, 59, 999);

  // Convert to UTC
  return new Date(
    Date.UTC(
      localEnd.getFullYear(),
      localEnd.getMonth(),
      localEnd.getDate(),
      23,
      59,
      59,
      999
    )
  );
}

// Simple version for date-only queries (recommended)
export function localDateToUTCMidnight(date: Date): Date {
  // Use noon UTC to avoid timezone crossing issues
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12,
      0,
      0,
      0 // Noon UTC
    )
  );
}

export function GetFormatterForCurrency(currency: string) {
  const locale = Currencies.find((c) => c.value === currency)?.locale;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
}

export const MAX_DATE_RANGE_DAYS = 90;
export type TransactionType = "income" | "expense" | "savings";
export type Timeframe = "month" | "year";
export type Period = { year: number; month: number };
