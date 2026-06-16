'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, qty = 1) => set(state => {
        const existing = state.items.find(i => i._id === product._id)
        if (existing) return { items: state.items.map(i => i._id === product._id ? { ...i, qty: i.qty + qty } : i) }
        return { items: [...state.items, { ...product, qty }] }
      }),
      removeItem: (id) => set(s => ({ items: s.items.filter(i => i._id !== id) })),
      updateQty: (id, qty) => {
        if (qty < 1) { get().removeItem(id); return }
        set(s => ({ items: s.items.map(i => i._id === id ? { ...i, qty } : i) }))
      },
      clearCart: () => set({ items: [] }),
      getCount: () => get().items.reduce((s, i) => s + i.qty, 0),
      getTotal: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
      getDiscount: () => get().items.reduce((s, i) => i.originalPrice > i.price ? s + (i.originalPrice - i.price) * i.qty : s, 0),
    }),
    { name: 'tataphone-cart', partialize: (s) => ({ items: s.items }) }
  )
)

export default useCartStore
