import type { Currency, ExchangeRate, Provider } from "@/types/currency";

const API_BASE = "https://api.frankfurter.dev/v2";

export const PROVIDERS: Provider[] = [
  {
    id: "wise",
    name: "Wise",
    feePercent: 0.45,
    transferTime: "1–2 days",
  },
  {
    id: "xe",
    name: "XE Money Transfer",
    feePercent: 0.6,
    transferTime: "1–3 days",
  },
  {
    id: "remitly",
    name: "Remitly",
    feePercent: 1.2,
    transferTime: "Same day",
  },
  {
    id: "western-union",
    name: "Western Union",
    feePercent: 1.9,
    transferTime: "Minutes",
  },
  {
    id: "paypal",
    name: "PayPal",
    feePercent: 3.5,
    transferTime: "Instant",
  },
];

export async function fetchCurrencies(): Promise<Currency[]> {
  const res = await fetch(`${API_BASE}/currencies`);
  if (!res.ok) throw new Error("Failed to load currency list.");
  return res.json();
}

export async function fetchRate(base: string, quote: string): Promise<ExchangeRate> {
  const res = await fetch(`${API_BASE}/rate/${base}/${quote}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `Rate unavailable for ${base} → ${quote}.`);
  }
  return res.json();
}

export async function fetchRangeSeries(
  base: string,
  quotes: string[],
  from: string,
  to?: string
): Promise<ExchangeRate[]> {
  const params = new URLSearchParams({ base, quotes: quotes.join(","), from });
  if (to) params.set("to", to);
  const res = await fetch(`${API_BASE}/rates?${params}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? "Failed to fetch rate history.");
  }
  return res.json();
}

export function applyFee(grossResult: number, feePercent: number): number {
  return grossResult * (1 - feePercent / 100);
}
