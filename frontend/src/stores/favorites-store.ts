import { create } from "zustand";
import type { FavoritePair } from "@/types/currency";

interface FavoritesStore {
  favorites: FavoritePair[];
  addFavorite: (from: string, to: string) => void;
  removeFavorite: (id: string) => void;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favorites: [],

  addFavorite: (from, to) => {
    const alreadySaved = get().favorites.some((f) => f.from === from && f.to === to);
    if (alreadySaved) return;
    set((state) => ({
      favorites: [{ id: crypto.randomUUID(), from, to, addedAt: Date.now() }, ...state.favorites],
    }));
  },

  removeFavorite: (id) =>
    set((state) => ({ favorites: state.favorites.filter((f) => f.id !== id) })),
}));
