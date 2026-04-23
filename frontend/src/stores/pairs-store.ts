import type { PairStore } from "@/types/currency";
import { create } from "zustand";

export const usePairStore = create<PairStore>((set) => ({
  pairs: [],
  addPair: (pair) => set((state) => ({ pairs: [...state.pairs, pair] })),
  removePair: (id) => set((state) => ({ pairs: state.pairs.filter((p) => p.id !== id) })),
}));