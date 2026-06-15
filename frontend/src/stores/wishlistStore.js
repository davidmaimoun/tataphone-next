'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useWishlistStore = create(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => set((state) => ({
        ids: state.ids.includes(id)
          ? state.ids.filter(x => x !== id)
          : [...state.ids, id],
      })),
      isLiked: (id) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    { name: 'tataphone-wishlist' }
  )
)

export default useWishlistStore
