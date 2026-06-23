'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Clé unique d'une ligne de panier : produit + variante choisie.
// Sans variante → la clé est juste l'_id (comportement identique à avant).
function lineKeyOf(item) {
  return item.variantSku ? `${item._id}::${item.variantSku}` : item._id
}

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // addItem(product, qty, variant?)
      // variant (optionnel) = { sku, attributes, price, originalPrice, image, stock }
      addItem: (product, qty = 1, variant = null) => set(state => {
        // Construit l'item à ajouter : si variante, on surcharge prix/sku/image
        const base = {
          _id:           product._id,
          name:          product.name,
          brand:         product.brand,
          images:        product.images,
          price:         variant ? variant.price : product.price,
          originalPrice: variant ? variant.originalPrice : product.originalPrice,
          variantSku:    variant ? variant.sku : null,
          variantLabel:  variant ? Object.values(variant.attributes || {}).join(' · ') : '',
          variantImage:  variant?.image || '',
          qty,
        }
        const key = lineKeyOf(base)
        const existing = state.items.find(i => lineKeyOf(i) === key)
        if (existing) {
          return { items: state.items.map(i => lineKeyOf(i) === key ? { ...i, qty: i.qty + qty } : i) }
        }
        return { items: [...state.items, base] }
      }),

      removeItem: (key) => set(s => ({ items: s.items.filter(i => lineKeyOf(i) !== key) })),

      updateQty: (key, qty) => {
        if (qty < 1) { get().removeItem(key); return }
        set(s => ({ items: s.items.map(i => lineKeyOf(i) === key ? { ...i, qty } : i) }))
      },

      clearCart: () => set({ items: [] }),
      getCount: () => get().items.reduce((s, i) => s + i.qty, 0),
      getTotal: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),
      getDiscount: () => get().items.reduce((s, i) => i.originalPrice > i.price ? s + (i.originalPrice - i.price) * i.qty : s, 0),

      // expose la fonction de clé pour les composants (panier)
      lineKey: lineKeyOf,
    }),
    { name: 'tataphone-cart', partialize: (s) => ({ items: s.items }) }
  )
)

export default useCartStore