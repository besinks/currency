import type { Currency, ExchangeRate, Provider } from "@/types/currency";

const API_BASE = "https://api.frankfurter.dev/v2";

export const PROVIDERS: Provider[] = [
  { id: "wise", name: "Wise", feePercent: 0.45, transferTime: "1–2 days" },
  { id: "xe", name: "XE Money Transfer", feePercent: 0.6, transferTime: "1–3 days" },
  { id: "remitly", name: "Remitly", feePercent: 1.2, transferTime: "Same day" },
  { id: "western-union", name: "Western Union", feePercent: 1.9, transferTime: "Minutes" },
  { id: "paypal", name: "PayPal", feePercent: 3.5, transferTime: "Instant" },
];

/** Fetch the full list of available currencies. */
export async function fetchCurrencies(): Promise<Currency[]> {
  const response = await fetch(`${API_BASE}/currencies`);
  if (!response.ok) throw new Error("Failed to load currency list. Please try again.");
  return response.json();
}

/** Fetch the mid-market exchange rate for a single currency pair. */
export async function fetchRate(base: string, quote: string): Promise<ExchangeRate> {
  const response = await fetch(`${API_BASE}/rate/${base}/${quote}`);
  console.log("Fetching rate", response);
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `Rate unavailable for ${base} → ${quote}.`);
  }
  return response.json();
}


export async function fetchMultipleRates(
  base: string,
  quotes: string[]
): Promise<ExchangeRate[]> {
  const params = new URLSearchParams({ base, quotes: quotes.join(",") });
  const response = await fetch(`${API_BASE}/rates?${params}`);
  console.log("Fetching multiple rates", response);
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? "Failed to fetch rates");
  }
  return response.json();
}

export async function fetchRangeSeries(
  base: string,
  quotes: string[],
  from: string,
  to?: string
): Promise<ExchangeRate[]> {
  const params = new URLSearchParams({ base, quotes: quotes.join(","), from });
  if (to) params.set("to", to);
  const response = await fetch(`${API_BASE}/rates?${params}`);
  console.log("Fetching range series", response);
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? "Failed to fetch time series");
  }
  return response.json();
}

/**
 * Apply a percentage fee to a converted amount.
 * Fee is deducted from the gross converted result — mathematically equivalent
 * to deducting from the source amount before converting.
 */
export function applyFee(grossResult: number, feePercent: number): number {
  return grossResult * (1 - feePercent / 100);
}
