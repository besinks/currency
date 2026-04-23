import { useEffect, useCallback } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchRangeSeries } from "@/services/frankfurter";
import { getCurrencyCountryCode } from "@/lib/currency-flags";
import { useChartStore } from "@/stores/chart-store";
import { type RatesChartProps, type ExchangeRate, type Period, type ChartConfig, PERIOD_DAYS } from "@/types/currency";

const chartConfig: ChartConfig = {
  rate: { label: "Rate", color: "var(--chart-1)" },
} satisfies ChartConfig;

function getFromDate(period: Period): string {
  const d = new Date();
  d.setDate(d.getDate() - PERIOD_DAYS[period]);
  return d.toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function CurrencyFlag({ code }: { code: string }) {
  const cc = getCurrencyCountryCode(code);
  if (!cc) return null;
  return (
    <ReactCountryFlag
      countryCode={cc}
      svg
      style={{ width: "1em", height: "1em", borderRadius: "2px" }}
      aria-hidden
    />
  );
}

export function RatesChart({ currencies }: RatesChartProps) {
  const { base, quote, period, data, loading, error,
          setBase, setQuote, setPeriod, setData, setLoading, setError } = useChartStore();

  const load = useCallback(async (b: string, q: string, p: Period) => {
    if (b === q) return;
    setLoading(true);
    setError(null);
    try {
      const raw: ExchangeRate[] = await fetchRangeSeries(b, [q], getFromDate(p));
      setData(
        raw
          .filter((r) => r.quote === q)
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((r) => ({ date: r.date, rate: r.rate }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(base, quote, period); }, [base, quote, period, load]);

  const latest = data.at(-1)?.rate ?? 0;
  
  const tickEvery = Math.max(1, Math.floor(data.length / 6));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="text-base font-semibold">
              Exchange Rate History
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-md border divide-x overflow-hidden text-xs">
                {(["7D", "30D", "90D",] as Period[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-2.5 py-1 transition-colors ${
                      period === p ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => load(base, quote, period)}
                disabled={loading}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap mt-1">

            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Select value={base} onValueChange={setBase}>
                <SelectTrigger className="h-8 min-w-[6.5rem] text-sm gap-1.5">
                  <CurrencyFlag code={base} />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {currencies.filter((c) => c.iso_code !== quote).map((c) => (
                    <SelectItem key={c.iso_code} value={c.iso_code} className="text-sm">
                      <span className="flex items-center gap-1.5">
                        <span className="font-mono">{c.iso_code}</span>
                        <span className="text-muted-foreground text-xs truncate">{c.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-muted-foreground text-sm shrink-0">→</span>

              <Select value={quote} onValueChange={setQuote}>
                <SelectTrigger className="h-8 min-w-[6.5rem] text-sm gap-1.5">
                  <CurrencyFlag code={quote} />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {currencies.filter((c) => c.iso_code !== base).map((c) => (
                    <SelectItem key={c.iso_code} value={c.iso_code} className="text-sm">
                      <span className="flex items-center gap-1.5">
                        <span className="font-mono">{c.iso_code}</span>
                        <span className="text-muted-foreground text-xs truncate">{c.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="text-lg font-mono font-semibold tabular-nums">
                {data.length > 0
                  ? `1 ${base} = ${latest.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })} ${quote}`
                  : `${base} / ${quote}`}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        {loading && data.length === 0 && <Skeleton className="h-48 w-full rounded-lg" />}

        {data.length > 0 && (
          <div className={`transition-opacity ${loading ? "opacity-50 pointer-events-none" : ""}`}>
            <ChartContainer config={chartConfig} className="h-[160px] w-full">
              <LineChart
                accessibilityLayer
                data={data}
                margin={{ top: 16, left: 16, right: 16 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  interval={tickEvery}
                  tickFormatter={formatDate}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(v) => formatDate(String(v))}
                      formatter={(value) => [
                        typeof value === "number"
                          ? value.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })
                          : value,
                        `${base}/${quote}`,
                      ]}
                    />
                  }
                />
                <Line
                  dataKey="rate"
                  type="natural"
                  stroke="var(--color-rate)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
