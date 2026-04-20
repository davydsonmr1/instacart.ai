'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const FREE_PLAN_ITEM_LIMIT = 5;

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  storeId: string;
}

export interface AddResult {
  ok: boolean;
  reason?: 'free-limit' | 'cross-store';
  message?: string;
}

interface CartState {
  items: CartItem[];
  storeId: string | null;

  addItem: (item: Omit<CartItem, 'quantity'>) => AddResult;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeItem: (id: string) => void;
  clear: () => void;

  // selectors
  totalItems: () => number;
  totalValue: () => number;
  distinctCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      storeId: null,

      addItem: (item) => {
        const state = get();

        if (state.storeId && state.storeId !== item.storeId) {
          return {
            ok: false,
            reason: 'cross-store',
            message: 'Seu carrinho tem itens de outra loja. Finalize ou limpe antes.',
          };
        }

        const existing = state.items.find((it) => it.id === item.id);
        if (existing) {
          set({
            items: state.items.map((it) =>
              it.id === item.id ? { ...it, quantity: it.quantity + 1 } : it,
            ),
          });
          return { ok: true };
        }

        if (state.items.length >= FREE_PLAN_ITEM_LIMIT) {
          return {
            ok: false,
            reason: 'free-limit',
            message: `Plano Free: máximo ${FREE_PLAN_ITEM_LIMIT} itens distintos.`,
          };
        }

        set({
          items: [...state.items, { ...item, quantity: 1 }],
          storeId: state.storeId ?? item.storeId,
        });
        return { ok: true };
      },

      increaseQuantity: (id) =>
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id ? { ...it, quantity: it.quantity + 1 } : it,
          ),
        })),

      decreaseQuantity: (id) =>
        set((s) => {
          const next = s.items
            .map((it) => (it.id === id ? { ...it, quantity: it.quantity - 1 } : it))
            .filter((it) => it.quantity > 0);
          return {
            items: next,
            storeId: next.length > 0 ? s.storeId : null,
          };
        }),

      removeItem: (id) =>
        set((s) => {
          const next = s.items.filter((it) => it.id !== id);
          return {
            items: next,
            storeId: next.length > 0 ? s.storeId : null,
          };
        }),

      clear: () => set({ items: [], storeId: null }),

      totalItems: () => get().items.reduce((acc, it) => acc + it.quantity, 0),
      totalValue: () =>
        get().items.reduce((acc, it) => acc + it.quantity * it.price, 0),
      distinctCount: () => get().items.length,
    }),
    {
      name: 'instacart-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, storeId: s.storeId }),
      version: 1,
    },
  ),
);
