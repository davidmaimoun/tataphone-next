'use client'
import { create } from 'zustand'

const useCartUiStore = create((set) => ({
  open: false,
  openCart: () => set({ open: true }),
  closeCart: () => set({ open: false }),
}))

export default useCartUiStore
