import { useState } from "react";
import { Plus, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CurrencySelect } from "@/components/CurrencySelect";
import { fetchRate } from "@/services/frankfurter";
import type { Currency, MultiRow } from "@/types/currency";

const INITIAL_PAIRS = [
  { from: "USD", to: "EUR", amount: "100" },
  { from: "USD", to: "JPY", amount: "100" },
  { from: "GBP", to: "PHP", amount: "50"  },
];

function makeRow(from: string, to: string, amount: string): MultiRow {
  return { id: crypto.randomUUID(), from, to, amount, rate: null, result: null, error: null, loading: false };
}

export function MultipleConverter({ currencies }: { currencies: Currency[] }) {
  const [rows, setRows]           = useState<MultiRow[]>(INITIAL_PAIRS.map((p) => makeRow(p.from, p.to, p.amount)));
  const [convertingAll, setConvertingAll] = useState(false);

  const patchRow = (id: string, patch: Partial<MultiRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const resetRow = (id: string, patch: Partial<MultiRow>) =>
    patchRow(id, { ...patch, rate: null, result: null, error: null });

  const addRow    = () => setRows((prev) => [...prev, makeRow("USD", "EUR", "1")]);
  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const convertAll = async () => {
    if (!rows.length) return;
    setConvertingAll(true);
    setRows((prev) => prev.map((r) => ({ ...r, loading: true, rate: null, result: null, error: null })));

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
        return res.status === "fulfilled"
          ? { ...row, loading: false, rate: res.value.rate, result: res.value.result, error: null }
          : { ...row, loading: false, rate: null, result: null, error: res.reason instanceof Error ? res.reason.message : "Failed" };
      })
    );
    setConvertingAll(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base">Multiple Conversions</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addRow} disabled={convertingAll}>
            <Plus className="h-4 w-4 mr-1" /> Add Row
          </Button>
          <Button size="sm" onClick={convertAll} disabled={convertingAll || !rows.length}>
            {convertingAll
              ? <><RefreshCw className="h-4 w-4 animate-spin mr-1" />Converting…</>
              : "Convert All"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {rows.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-10">
            No rows yet. Click <span className="font-medium">Add Row</span> to start.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="hidden sm:grid sm:grid-cols-[7rem_minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,1fr)_2rem] gap-2 px-1">
              {["Amount", "From", "", "To", "Result", ""].map((h, i) => (
                <span key={i} className="text-xs text-muted-foreground">{h}</span>
              ))}
            </div>

            <Separator />

            {rows.map((row) => (
              <div key={row.id} className="grid grid-cols-1 sm:grid-cols-[7rem_minmax(0,1fr)_auto_minmax(0,1fr)_minmax(0,1fr)_2rem] gap-2 items-center">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={row.amount}
                  onChange={(e) => resetRow(row.id, { amount: e.target.value })}
                  placeholder="Amount"
                  className="font-mono"
                  disabled={row.loading}
                />
                <div className="min-w-0">
                  <CurrencySelect currencies={currencies} value={row.from} onChange={(v) => resetRow(row.id, { from: v })} disabled={row.loading} />
                </div>
                <span className="text-muted-foreground text-sm hidden sm:block">→</span>
                <div className="min-w-0">
                  <CurrencySelect currencies={currencies} value={row.to} onChange={(v) => resetRow(row.id, { to: v })} disabled={row.loading} />
                </div>

                <div className="relative min-w-0">
                  <Input
                    readOnly
                    className="font-mono bg-muted"
                    value={
                      row.loading
                        ? ""
                        : row.result !== null && !row.error
                          ? row.result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                          : ""
                    }
                    placeholder={row.loading ? "Loading…" : "—"}
                  />
                  {!row.loading && row.error && (
                    <span className="absolute inset-0 flex items-center gap-1 px-3 text-destructive text-xs pointer-events-none">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {row.error}
                    </span>
                  )}
                </div>

                <div className="flex justify-center shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeRow(row.id)}
                    disabled={convertingAll}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
