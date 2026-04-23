import { useState, useEffect } from "react";
import { Globe, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SingleConverter } from "@/components/SingleConverter";
import { MultipleConverter } from "@/components/MultipleConverter";
import { FavoritePairs } from "@/components/FavoritePairs";
import { RatesChart } from "@/components/RatesChart";
import { fetchCurrencies } from "@/services/frankfurter";
import { useFavoritesStore } from "@/stores/favorites-store";
import type { Currency } from "@/types/currency";

const App = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [converterFrom, setConverterFrom] = useState("PHP");
  const [converterTo, setConverterTo] = useState("USD");
  const { favorites, addFavorite, removeFavorite } = useFavoritesStore();

  useEffect(() => {
    fetchCurrencies()
      .then(setCurrencies)
      .catch((err) => setError(err instanceof Error ? err.message : "Unknown error"))
      .finally(() => setLoading(false));
  }, []);

  const loadFavoritePair = ({ from, to }: { from: string; to: string }) => {
    setConverterFrom(from);
    setConverterTo(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl py-3 px-4 md:px-6 lg:px-4 flex items-center gap-3">
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

      <main className="mx-auto max-w-7xl py-6 px-4 md:px-6 lg:px-4">
        {loading && <DashboardSkeleton />}
        {error && <ErrorState message={error} />}

        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

            <div className="lg:col-span-3 flex flex-col gap-6">
              <RatesChart currencies={currencies} />
              <MultipleConverter currencies={currencies} />
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6">
              <SingleConverter
                currencies={currencies}
                from={converterFrom}
                to={converterTo}
                onFromChange={setConverterFrom}
                onToChange={setConverterTo}
                favorites={favorites}
                onSaveFavorite={addFavorite}
              />
              <FavoritePairs
                favorites={favorites}
                currencies={currencies}
                onLoad={loadFavoritePair}
                onDelete={removeFavorite}
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
