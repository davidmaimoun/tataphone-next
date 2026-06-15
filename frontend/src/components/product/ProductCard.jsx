'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Check, Heart } from 'lucide-react'
import useCartStore from '@/stores/cartStore'
import useWishlistStore from '@/stores/wishlistStore'
import toast from 'react-hot-toast'

export default function ProductCard({ product, index = 0, forceNew = false }) {
  const addItem = useCartStore(s => s.addItem)
  const toggleWish = useWishlistStore(s => s.toggle)
  const liked = useWishlistStore(s => s.ids.includes(product._id))
  const [added, setAdded] = useState(false)

  const { _id, name, brand, price, originalPrice, images = [], discount, isKosher, isNew } = product
  const img = images[0]
  const discPct = discount && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0
  const showNew = forceNew || isNew

  const handleAdd = (e) => {
    e.preventDefault()
    addItem(product)
    toast.success('נוסף לסל! 🛒')
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: Math.min(index * 0.05, 0.3) }} className="h-full">
      <Link href={`/products/${_id}`} className="group block h-full">
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col h-full
                        hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:border-primary-200 transition-all duration-250">
          {/* Image */}
          <div className="relative overflow-hidden bg-slate-50 flex-shrink-0" style={{ height: 180 }}>
            {img
              ? <Image src={img} alt={name} fill sizes="200px" unoptimized
                       className="object-cover group-hover:scale-105 transition-transform duration-300" />
              : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <div className="text-center">
                    <p className="font-rubik font-black text-slate-300 text-2xl leading-none">טאטע</p>
                    <p className="font-rubik font-black text-slate-300 text-2xl leading-none">פון</p>
                  </div>
                </div>
            }
            <button onClick={(e) => { e.preventDefault(); toggleWish(_id) }}
              className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ background: liked ? '#FFF1F2' : 'rgba(255,255,255,0.9)', border: liked ? '1.5px solid #FCA5A5' : '1.5px solid rgba(0,0,0,0.08)' }}>
              <Heart className="w-3.5 h-3.5" style={{ fill: liked ? '#F43F5E' : 'none', color: liked ? '#F43F5E' : '#94A3B8' }} />
            </button>
            <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
              {showNew && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                      style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>חדש</span>
              )}
              {discPct > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                      style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)' }}>−{discPct}%</span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-3 flex flex-col flex-1">
            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-wide mb-0.5">{brand}</p>
            <p className="text-[12px] sm:text-[13px] font-semibold text-slate-800 line-clamp-2 leading-snug"
               style={{ minHeight: '2.2rem' }}>{name}</p>

            {isKosher === true && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 w-fit"
                    style={{ background: '#D1FAE5', color: '#064E3B', border: '1px solid #6EE7B7' }}>
                <span style={{ fontSize: 9 }}>✡</span>כשר
              </span>
            )}

            {/* Price + cart — always bottom */}
            <div className="mt-auto pt-2">
              <div className="h-10 flex flex-col justify-center">
                <span className="price-num" style={{ fontSize: 18, lineHeight: 1 }}>₪{price?.toLocaleString()}</span>
                {originalPrice > price
                  ? <span className="text-[10px] text-slate-400 line-through">₪{originalPrice?.toLocaleString()}</span>
                  : <span className="h-[14px]" />}
              </div>
              <button onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-[12px] text-white transition-all mt-1"
                style={{ background: added ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                <AnimatePresence mode="wait" initial={false}>
                  {added
                    ? <motion.span key="c" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1"><Check className="w-3.5 h-3.5" strokeWidth={2.5} />נוסף!</motion.span>
                    : <motion.span key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1"><ShoppingCart className="w-3.5 h-3.5" />הוסף</motion.span>}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
