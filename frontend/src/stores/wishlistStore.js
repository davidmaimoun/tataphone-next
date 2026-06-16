'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import wishlistService from '@/services/wishlistService'

const useWishlistStore = create(
  persist(
    (set, get) => ({
      ids: [],
      synced: false,
      toggle: async (productId, user) => {
        const pid = String(productId)
        const prev = get().ids.map(String)
        const isLiked = prev.includes(pid)
        const newIds = isLiked ? prev.filter(id => id !== pid) : [...prev, pid]
        set({ ids: newIds })
        if (user) {
          try { await wishlistService.toggle(pid) }
          catch { set({ ids: prev }) }
        }
      },
      syncOnLogin: async () => {
        try {
          const { ids: serverIds } = await wishlistService.getIds()
          const sIds = (serverIds || []).map(String)
          set({ ids: sIds, synced: true })
          const localIds = get().ids.map(String)
          const localOnly = localIds.filter(id => !sIds.includes(id))
          if (localOnly.length > 0) {
            await Promise.all(localOnly.map(id => wishlistService.toggle(id)))
            set({ ids: [...new Set([...sIds, ...localOnly])] })
          }
        } catch { set({ synced: true }) }
      },
      setIds: (ids) => set({ ids: ids.map(String) }),
    }),
    { name: 'tataphone-wishlist', partialize: (s) => ({ ids: s.ids }) }
  )
)

export default useWishlistStore
