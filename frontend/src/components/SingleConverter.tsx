import { useState } from "react";
import { ArrowLeftRight, Star, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencySelect } from "@/components/CurrencySelect";
import { ProviderFees } from "@/components/ProviderFees";
import { fetchRate } from "@/services/frankfurter";
import type { Currency, FavoritePair } from "@/types/currency";

interface Props {
  currencies: Currency[];
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  favorites: FavoritePair[];
  onSaveFavorite: (from: string, to: string) => void;
}

export function SingleConverter({ currencies, from, to, onFromChange, onToChange, favorites, onSaveFavorite }: Props) {
  const [amount, setAmount]     = useState("1");
  const [rate, setRate]         = useState<number | null>(null);
  const [rateDate, setRateDate] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const numericAmount  = parseFloat(amount);
  const grossResult    = rate !== null && !isNaN(numericAmount) ? rate * numericAmount : null;
  const isAlreadySaved = favorites.some((f) => f.from === from && f.to === to);

  const clearResult = () => { setRate(null); setRateDate(null); setError(null); };

  const handleSwap = () => { onFromChange(to); onToChange(from); clearResult(); };
  const handleFromChange = (v: string) => { onFromChange(v); clearResult(); };
  const handleToChange   = (v: string) => { onToChange(v);   clearResult(); };

  const handleConvert = async () => {
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    if (from === to) {
      setError("Please choose two different currencies.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRate(from, to);
      setRate(data.rate);
      setRateDate(data.date);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch exchange rate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Single Conversion</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); clearResult(); }}
              placeholder="1.00"
              className="font-mono"
            />
          </div>
          <div className="sm:col-span-3 space-y-1.5">
            <Label>From</Label>
            <CurrencySelect currencies={currencies} value={from} onChange={handleFromChange} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <Button variant="outline" size="icon" onClick={handleSwap} title="Swap currencies" className="shrink-0">
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="space-y-1.5">
          <Label>To</Label>
          <CurrencySelect currencies={currencies} value={to} onChange={handleToChange} />
        </div>

        {error && (
          <div className="flex items-start gap-2 text-destructive text-sm p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {grossResult !== null && !error && (
          <div className="rounded-lg border bg-card p-4 space-y-1">
            <p className="text-sm text-muted-foreground">{numericAmount.toLocaleString()} {from} =</p>
            <p className="text-3xl font-semibold font-mono leading-tight">
              {grossResult.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}{" "}
              <span className="text-xl font-normal text-muted-foreground">{to}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              1 {from} = {rate?.toFixed(6)} {to} · mid-market · as of {rateDate}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleConvert} disabled={loading} className="flex-1">
            {loading ? (
              <><RefreshCw className="h-4 w-4 animate-spin mr-2" />Fetching rate…</>
            ) : rate !== null ? (
              <><RefreshCw className="h-4 w-4 mr-2" />Refresh Rate</>
            ) : "Convert"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSaveFavorite(from, to)}
            title={isAlreadySaved ? "Already saved" : "Save to favorites"}
            disabled={isAlreadySaved}
            className="shrink-0"
          >
            <Star className={`h-4 w-4 transition-colors ${isAlreadySaved ? "fill-yellow-400 text-yellow-400" : ""}`} />
          </Button>
        </div>

        {grossResult !== null && !error && (
          <ProviderFees amount={numericAmount} grossResult={grossResult} from={from} to={to} />
        )}
      </CardContent>
    </Card>
  );
}
