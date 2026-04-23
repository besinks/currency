import { useState, useEffect, useCallback } from "react";
import { RefreshCw, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMultipleRates } from "@/services/frankfurter";
import type { Currency, ExchangeRate } from "@/types/currency";

// Currencies available as a base in the rates panel.
const BASE_OPTIONS = ["USD", "EUR", "GBP", "JPY", "PHP", "AUD", "CAD", "CHF", "SGD", "HKD"];

// The fixed set of currencies shown in the rates list.
// The base currency is automatically removed before fetching.
const TRACKED_QUOTES = [
  "USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD",
  "NZD", "SGD", "HKD", "PHP", "CNY", "INR", "KRW",
  "MXN", "BRL", "ZAR", "THB", "SEK", "NOK",
];

interface LiveRatesProps {
  currencies: Currency[];
}

export function LiveRates({ currencies }: LiveRatesProps) {
  const [base, setBase]               = useState("USD");
  const [rates, setRates]             = useState<ExchangeRate[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [rateDate, setRateDate]       = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const getCurrencyName = (code: string) =>
    currencies.find((c) => c.iso_code === code)?.name ?? code;

  const load = useCallback(async (selectedBase: string) => {
    setLoading(true);
    setError(null);
    try {
      const quotes = TRACKED_QUOTES.filter((q) => q !== selectedBase);
      const data   = await fetchMultipleRates(selectedBase, quotes);
      setRates(data);
      if (data.length > 0) setRateDate(data[0].date);
      setLastFetched(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch rates");
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload whenever the base currency changes.
  useEffect(() => {
    load(base);
  }, [base, load]);

  const handleBaseChange = (value: string) => {
    setBase(value);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Live Rates
            </CardTitle>
            {rateDate && (
              <p className="text-xs text-muted-foreground mt-0.5">
                As of {rateDate}
                {lastFetched && (
                  <> · fetched {lastFetched.toLocaleTimeString()}</>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Base currency selector */}
            <Select value={base} onValueChange={handleBaseChange}>
              <SelectTrigger className="h-8 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BASE_OPTIONS.map((b) => (
                  <SelectItem key={b} value={b} className="text-xs">
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Refresh button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => load(base)}
              disabled={loading}
              title="Refresh rates"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Column labels */}
        {rates.length > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
            <span>Currency</span>
            <span>1 {base} =</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto pt-0 pb-3">
        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs p-2 rounded-md bg-destructive/10 border border-destructive/20 mb-3">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Skeleton while loading with no previous data */}
        {loading && rates.length === 0 && (
          <div className="space-y-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        )}

        {/* Rates list */}
        {rates.length > 0 && (
          <div className={`divide-y transition-opacity ${loading ? "opacity-50" : "opacity-100"}`}>
            {rates.map((r) => (
              <div
                key={r.quote}
                className="flex items-center justify-between py-2 gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-semibold text-sm w-10 shrink-0">
                    {r.quote}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {getCurrencyName(r.quote)}
                  </span>
                </div>
                <span className="font-mono text-sm shrink-0 tabular-nums">
                  {r.rate >= 1000
                    ? r.rate.toLocaleString(undefined, { maximumFractionDigits: 2 })
                    : r.rate.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
