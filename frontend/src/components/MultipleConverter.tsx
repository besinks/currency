import { useState } from "react";
import { Plus, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CurrencySelect } from "@/components/CurrencySelect";
import { fetchRate } from "@/services/frankfurter";
import type { Currency, MultiRow } from "@/types/currency";

/** Seed data so the tab isn't empty on first open. */
const INITIAL_PAIRS = [
  { from: "USD", to: "EUR",  amount: "100" },
  { from: "USD", to: "JPY",  amount: "100" },
  { from: "GBP", to: "PHP",  amount: "50"  },
];

function makeRow(from: string, to: string, amount: string): MultiRow {
  return {
    id: crypto.randomUUID(),
    from,
    to,
    amount,
    rate: null,
    result: null,
    error: null,
    loading: false,
  };
}

export function MultipleConverter({ currencies }: { currencies: Currency[] }) {
  const [rows, setRows]               = useState<MultiRow[]>(
    INITIAL_PAIRS.map((p) => makeRow(p.from, p.to, p.amount))
  );
  const [convertingAll, setConvertingAll] = useState(false);

  /** Patch a single row by id. */
  const patchRow = (id: string, patch: Partial<MultiRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addRow = () =>
    setRows((prev) => [...prev, makeRow("USD", "EUR", "1")]);

  const removeRow = (id: string) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  /** Reset a row's fields when the user edits inputs (so stale results disappear). */
  const resetRowResult = (id: string, patch: Partial<MultiRow>) =>
    patchRow(id, { ...patch, rate: null, result: null, error: null });

  const convertAll = async () => {
    if (rows.length === 0) return;

    setConvertingAll(true);
    // Mark every row as loading before any requests fire.
    setRows((prev) =>
      prev.map((r) => ({ ...r, loading: true, rate: null, result: null, error: null }))
    );

    // Fire all requests in parallel; allSettled means one failure won't block others.
    const settled = await Promise.allSettled(
      rows.map(async (row) => {
        const amt = parseFloat(row.amount);
        if (isNaN(amt) || amt <= 0) throw new Error("Invalid amount");
        if (row.from === row.to)    throw new Error("Same currencies");
        const data = await fetchRate(row.from, row.to);
        return { id: row.id, rate: data.rate, result: data.rate * amt };
      })
    );

    setRows((prev) =>
      prev.map((row, i) => {
        const res = settled[i];
        if (res.status === "fulfilled") {
          return { ...row, loading: false, rate: res.value.rate, result: res.value.result, error: null };
        }
        return {
          ...row,
          loading: false,
          rate: null,
          result: null,
          error: res.reason instanceof Error ? res.reason.message : "Failed to fetch",
        };
      })
    );

    setConvertingAll(false);
  };

  const hasResults = rows.some((r) => r.result !== null || r.error !== null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">Multiple Conversions</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addRow} disabled={convertingAll}>
            <Plus className="h-4 w-4 mr-1" />
            Add Row
          </Button>
          <Button
            size="sm"
            onClick={convertAll}
            disabled={convertingAll || rows.length === 0}
          >
            {convertingAll ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                Converting…
              </>
            ) : (
              "Convert All"
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {rows.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-10">
            No rows yet. Click <span className="font-medium">Add Row</span> to start.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Column headers — only on wider screens */}
            <div className="hidden sm:grid sm:grid-cols-[7rem_1fr_auto_1fr_1fr_2rem] gap-2 px-1">
              <span className="text-xs text-muted-foreground">Amount</span>
              <span className="text-xs text-muted-foreground">From</span>
              <span />
              <span className="text-xs text-muted-foreground">To</span>
              <span className="text-xs text-muted-foreground">Result</span>
              <span />
            </div>

            <Separator />

            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-1 sm:grid-cols-[7rem_1fr_auto_1fr_1fr_2rem] gap-2 items-center"
              >
                {/* Amount */}
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={row.amount}
                  onChange={(e) => resetRowResult(row.id, { amount: e.target.value })}
                  placeholder="Amount"
                  className="font-mono"
                  disabled={row.loading}
                />

                {/* From */}
                <CurrencySelect
                  currencies={currencies}
                  value={row.from}
                  onChange={(v) => resetRowResult(row.id, { from: v })}
                  disabled={row.loading}
                />

                {/* Arrow separator */}
                <span className="text-muted-foreground text-sm hidden sm:block">→</span>

                {/* To */}
                <CurrencySelect
                  currencies={currencies}
                  value={row.to}
                  onChange={(v) => resetRowResult(row.id, { to: v })}
                  disabled={row.loading}
                />

                {/* Result / status */}
                <div className="min-h-9 flex items-center">
                  {row.loading && (
                    <span className="text-sm text-muted-foreground animate-pulse">Loading…</span>
                  )}
                  {!row.loading && row.error && (
                    <span className="flex items-center gap-1 text-destructive text-xs">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      {row.error}
                    </span>
                  )}
                  {!row.loading && row.result !== null && !row.error && (
                    <span className="font-mono text-sm font-semibold">
                      {row.result.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}{" "}
                      <span className="font-normal text-muted-foreground">{row.to}</span>
                    </span>
                  )}
                  {!row.loading && !hasResults && (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>

                {/* Delete */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeRow(row.id)}
                  disabled={convertingAll}
                  title="Remove row"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
