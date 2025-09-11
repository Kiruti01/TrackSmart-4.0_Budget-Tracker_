// Exchange rate utility functions
import { z } from "zod";

// Schema for exchange rate API response
const ExchangeRateResponseSchema = z.object({
  rates: z.record(z.number()),
  base: z.string(),
  date: z.string(),
});

const HistoricalRateResponseSchema = z.object({
  rates: z.record(z.number()),
  base: z.string(),
  date: z.string(),
});

// Cache for exchange rates to avoid excessive API calls
const rateCache = new Map<string, { rate: number; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export interface ExchangeRateResult {
  rate: number;
  fromCurrency: string;
  toCurrency: string;
  date?: string;
}

/**
 * Get current exchange rate between two currencies
 */
export async function getCurrentExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<ExchangeRateResult> {
  // If same currency, return 1
  if (fromCurrency === toCurrency) {
    return {
      rate: 1,
      fromCurrency,
      toCurrency,
    };
  }

  const cacheKey = `${fromCurrency}-${toCurrency}-current`;
  const cached = rateCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return {
      rate: cached.rate,
      fromCurrency,
      toCurrency,
    };
  }

  try {
    // Using exchangerate-api.com (free tier available)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data = await response.json();
    const parsed = ExchangeRateResponseSchema.parse(data);

    const rate = parsed.rates[toCurrency];
    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }

    // Cache the result
    rateCache.set(cacheKey, { rate, timestamp: Date.now() });

    return {
      rate,
      fromCurrency,
      toCurrency,
    };
  } catch (error) {
    console.error("Error fetching current exchange rate:", error);
    // Fallback to 1 if API fails
    return {
      rate: 1,
      fromCurrency,
      toCurrency,
    };
  }
}

/**
 * Get historical exchange rate for a specific date
 */
export async function getHistoricalExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  date: Date
): Promise<ExchangeRateResult> {
  // If same currency, return 1
  if (fromCurrency === toCurrency) {
    return {
      rate: 1,
      fromCurrency,
      toCurrency,
      date: date.toISOString().split('T')[0],
    };
  }

  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  const cacheKey = `${fromCurrency}-${toCurrency}-${dateString}`;
  const cached = rateCache.get(cacheKey);
  
  if (cached) {
    return {
      rate: cached.rate,
      fromCurrency,
      toCurrency,
      date: dateString,
    };
  }

  try {
    // Using exchangerate-api.com historical endpoint
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/history/${fromCurrency}/${dateString}`
    );

    if (!response.ok) {
      // If historical data not available, fall back to current rate
      console.warn(`Historical rate not available for ${dateString}, using current rate`);
      const currentRate = await getCurrentExchangeRate(fromCurrency, toCurrency);
      return {
        ...currentRate,
        date: dateString,
      };
    }

    const data = await response.json();
    const parsed = HistoricalRateResponseSchema.parse(data);

    const rate = parsed.rates[toCurrency];
    if (!rate) {
      throw new Error(`Historical exchange rate not found for ${toCurrency}`);
    }

    // Cache the result (historical rates don't change)
    rateCache.set(cacheKey, { rate, timestamp: Date.now() });

    return {
      rate,
      fromCurrency,
      toCurrency,
      date: dateString,
    };
  } catch (error) {
    console.error("Error fetching historical exchange rate:", error);
    // Fallback to current rate if historical fails
    const currentRate = await getCurrentExchangeRate(fromCurrency, toCurrency);
    return {
      ...currentRate,
      date: dateString,
    };
  }
}

/**
 * Convert amount from one currency to another using current rates
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  const { rate } = await getCurrentExchangeRate(fromCurrency, toCurrency);
  return Math.round((amount * rate) * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert amount using historical exchange rate
 */
export async function convertCurrencyHistorical(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  date: Date
): Promise<number> {
  const { rate } = await getHistoricalExchangeRate(fromCurrency, toCurrency, date);
  return Math.round((amount * rate) * 100) / 100; // Round to 2 decimal places
}

/**
 * Clear the exchange rate cache (useful for testing or manual refresh)
 */
export function clearExchangeRateCache(): void {
  rateCache.clear();
}