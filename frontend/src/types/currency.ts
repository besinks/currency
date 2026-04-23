export interface Currency {
  iso_code: string;
  name: string;
  symbol: string;
}

export interface ExchangeRate {
  date: string;
  base: string;
  quote: string;
  rate: number;
}

export interface Provider {
  id: string;
  name: string;
  feePercent: number;
  transferTime: string;
}

export interface FavoritePair {
  id: string;
  from: string;
  to: string;
  addedAt: number;
}

export interface MultiRow {
  id: string;
  from: string;
  to: string;
  amount: string;
  rate: number | null;
  result: number | null;
  error: string | null;
  loading: boolean;
}

export interface ChartPoint { date: string; rate: number }

export interface ChartStore {
  base: string;
  quote: string;
  period: Period;
  data: ChartPoint[];
  loading: boolean;
  error: string | null;
  setBase: (base: string)    => void;
  setQuote: (quote: string)   => void;
  setPeriod: (period: Period)  => void;
  setData: (data: ChartPoint[]) => void;
  setLoading: (loading: boolean)   => void;
  setError: (error: string | null) => void;
}

export interface FavoritePairsProps {
  favorites: FavoritePair[];
  currencies: Currency[];
  onLoad: (pair: { from: string; to: string }) => void;
  onDelete: (id: string) => void;
}

export interface ProviderFeesProps {
  amount: number;
  grossResult: number;
  from: string;
  to: string;
}

export interface CurrencySelectProps {
  currencies: Currency[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof ChartConfig, string> }
  )
>

export type ChartContextProps = {
  config: ChartConfig
}

export type Period = "7D" | "30D" | "90D";

export interface RatesChartProps {
  currencies: Currency[];
}

export const PERIOD_DAYS: Record<Period, number> = { "7D": 7, "30D": 30, "90D": 90 };

export interface SingleConverterProps {
  currencies: Currency[];
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  favorites: FavoritePair[];
  onSaveFavorite: (from: string, to: string) => void;
}