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

export interface PairStore {
  pairs: MultiRow[];
  addPair: (pair: MultiRow) => void;
  removePair: (id: string) => void;
}
