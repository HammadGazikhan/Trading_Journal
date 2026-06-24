import { create } from "zustand";
import type { TradeWithMistakes } from "@/types";

interface TradeModalState {
  isOpen: boolean;
  editingTrade: TradeWithMistakes | null;
  refreshKey: number;
  openModal: (trade?: TradeWithMistakes) => void;
  closeModal: () => void;
  notifyTradeChanged: () => void;
}

export const useTradeModalStore = create<TradeModalState>((set) => ({
  isOpen: false,
  editingTrade: null,
  refreshKey: 0,
  openModal: (trade) => set({ isOpen: true, editingTrade: trade || null }),
  closeModal: () => set({ isOpen: false, editingTrade: null }),
  notifyTradeChanged: () =>
    set((state) => ({ refreshKey: state.refreshKey + 1 })),
}));
