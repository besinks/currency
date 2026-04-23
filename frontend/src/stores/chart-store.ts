import { create } from "zustand";
import type { ChartStore } from "@/types/currency";

export const useChartStore = create<ChartStore>((set) => ({
  base: "PHP",
  quote: "USD",
  period: "30D",
  data: [],
  loading: false,
  error: null,
  setBase: (base) => set({ base }),
  setQuote: (quote) => set({ quote }),
  setPeriod: (period) => set({ period }),
  setData: (data) => set({ data }),
  setLoading:(loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
