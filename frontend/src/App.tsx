import { useState, useEffect } from "react";
import { Globe, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SingleConverter } from "@/components/SingleConverter";
import { MultipleConverter } from "@/components/MultipleConverter";
import { FavoritePairs } from "@/components/FavoritePairs";
import { RatesChart } from "@/components/RatesChart";
import { fetchCurrencies } from "@/services/frankfurter";
import type { Currency, FavoritePair } from "@/types/currency";

const FAVORITES_KEY = "currency-favorites";

function loadFavorites(): FavoritePair[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

const App = () => {
  const [currencies, setCurrencies]   = useState<Currency[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [favorites, setFavorites]     = useState<FavoritePair[]>(loadFavorites);
  const [converterFrom, setConverterFrom] = useState("USD");
  const [converterTo, setConverterTo]     = useState("EUR");

  useEffect(() => {
    fetchCurrencies()
      .then(setCurrencies)
      .catch((err) => setError(err instanceof Error ? err.message : "Unknown error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const saveFavorite = (from: string, to: string) => {
    const alreadySaved = favorites.some((f) => f.from === from && f.to === to);
    if (alreadySaved) return;
    const newFav: FavoritePair = { id: crypto.randomUUID(), from, to, addedAt: Date.now() };
    setFavorites((prev) => [newFav, ...prev]);
  };

  const deleteFavorite = (id: string) =>
    setFavorites((prev) => prev.filter((f) => f.id !== id));

  const loadFavoritePair = ({ from, to }: { from: string; to: string }) => {
    setConverterFrom(from);
    setConverterTo(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <Globe className="h-5 w-5 text-primary shrink-0" />
          <div>
            <h1 className="text-sm font-semibold leading-none">Currency Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live mid-market rates · Frankfurter API
            </p>
          </div>
          {!loading && !error && (
            <span className="ml-auto text-xs text-muted-foreground">
              {currencies.length} currencies
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-2 sm:px-4 py-6">
        {loading && <DashboardSkeleton />}
        {error && <ErrorState message={error} />}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Left column — chart + batch converter */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <RatesChart currencies={currencies} />
              <MultipleConverter currencies={currencies} />
            </div>

            {/* Right column — single converter + favorites */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <SingleConverter
                currencies={currencies}
                from={converterFrom}
                to={converterTo}
                onFromChange={setConverterFrom}
                onToChange={setConverterTo}
                favorites={favorites}
                onSaveFavorite={saveFavorite}
              />
              <FavoritePairs
                favorites={favorites}
                currencies={currencies}
                onLoad={loadFavoritePair}
                onDelete={deleteFavorite}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 flex flex-col gap-6">
        <Skeleton className="h-[32rem] w-full rounded-xl" />
        <Skeleton className="h-52 w-full rounded-xl" />
      </div>
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Skeleton className="h-[26rem] w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <h2 className="font-semibold">Failed to load currencies</h2>
      <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      <button
        className="text-sm text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
        onClick={() => window.location.reload()}
      >
        Try again
      </button>
    </div>
  );
}

export default App;
