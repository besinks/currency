import { Star, ArrowRight, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Currency, FavoritePair } from "@/types/currency";

interface FavoritePairsProps {
  favorites: FavoritePair[];
  currencies: Currency[];
  onLoad: (pair: { from: string; to: string }) => void;
  onDelete: (id: string) => void;
}

export function FavoritePairs({ favorites, currencies, onLoad, onDelete }: FavoritePairsProps) {
  const getCurrencyName = (code: string) =>
    currencies.find((c) => c.iso_code === code)?.name ?? code;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <CardTitle className="text-base">Favorite Pairs</CardTitle>
        <Badge variant="secondary" className="ml-auto">
          {favorites.length} {favorites.length === 1 ? "pair" : "pairs"}
        </Badge>
      </CardHeader>

      <Separator />

      <CardContent className="pt-4">
        {favorites.length === 0 ? (
          <div className="text-center py-14 space-y-2">
            <Star className="h-8 w-8 mx-auto text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">No saved pairs</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Open the <span className="font-medium">Convert</span> tab, pick a currency pair,
              and click the star button to save it here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="flex items-center gap-3 px-3 py-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
              >
                {/* Pair label */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-sm">{fav.from}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-mono font-semibold text-sm">{fav.to}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {getCurrencyName(fav.from)} → {getCurrencyName(fav.to)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLoad({ from: fav.from, to: fav.to })}
                    className="text-xs h-8"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Load
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(fav.id)}
                    title="Remove from favorites"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
