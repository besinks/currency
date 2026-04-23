import { PROVIDERS, applyFee } from "@/services/frankfurter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ProviderFeesProps {
  /** Original amount in the source currency. */
  amount: number;
  /** Converted amount at the mid-market rate (before fees). */
  grossResult: number;
  from: string;
  to: string;
}

/**
 * Shows what each provider would deliver after applying their fee to the
 * mid-market converted amount. Sorted best-to-worst (lowest fee first).
 */
export function ProviderFees({ amount, grossResult, from, to }: ProviderFeesProps) {
  const sorted = [...PROVIDERS].sort((a, b) => a.feePercent - b.feePercent);
  const bestProvider = sorted[0];

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Provider Comparison</h3>
        <span className="text-xs text-muted-foreground">
          Mid-market: {grossResult.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {to}
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead className="text-right">Fee</TableHead>
            <TableHead className="text-right">Fee deducted</TableHead>
            <TableHead className="text-right">You receive</TableHead>
            <TableHead className="text-right">Speed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((provider) => {
            const feeInSource = amount * (provider.feePercent / 100);
            const netResult   = applyFee(grossResult, provider.feePercent);
            const isBest      = provider.id === bestProvider.id;

            return (
              <TableRow key={provider.id} className={isBest ? "bg-accent/40" : ""}>
                <TableCell className="font-medium">
                  <span>{provider.name}</span>
                  {isBest && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Best deal
                    </Badge>
                  )}
                </TableCell>

                <TableCell className="text-right text-muted-foreground text-sm">
                  {provider.feePercent}%
                </TableCell>

                <TableCell className="text-right text-muted-foreground text-sm">
                  {feeInSource.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {from}
                </TableCell>

                <TableCell className="text-right font-mono text-sm font-semibold">
                  {netResult.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {to}
                </TableCell>

                <TableCell className="text-right text-muted-foreground text-sm">
                  {provider.transferTime}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <p className="text-xs text-muted-foreground">
        * Fees are estimates for comparison. Actual rates and fees vary by provider, amount, and corridor.
        Mid-market rate sourced from Frankfurter API.
      </p>
    </div>
  );
}
