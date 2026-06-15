'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1) => set((state) => {
        const existing = state.items.find(i => i._id === product._id)
        if (existing) {
          return {
            items: state.items.map(i =>
              i._id === product._id ? { ...i, qty: i.qty + qty } : i
            ),
          }
        }
        return { items: [...state.items, { ...product, qty }] }
      }),

      removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i._id !== id),
      })),

      updateQty: (id, qty) => set((state) => ({
        items: state.items.map(i =>
          i._id === id ? { ...i, qty: Math.max(1, qty) } : i
        ),
      })),

      clear: () => set({ items: [] }),

      get total() {
        return get().items.reduce((sum, i) => sum + i.price * i.qty, 0)
      },
      get count() {
        return get().items.reduce((sum, i) => sum + i.qty, 0)
      },
    }),
    { name: 'tataphone-cart' }
  )
)

export default useCartStore
