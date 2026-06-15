'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart, Check, Heart, Truck, RotateCcw, Shield, ChevronLeft } from 'lucide-react'
import useCartStore from '@/stores/cartStore'
import toast from 'react-hot-toast'

export default function ProductDetailClient({ product }) {
  const addItem = useCartStore(s => s.addItem)
  const [mainImg, setMainImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [liked, setLiked] = useState(false)

  const {
    name, brand, price, originalPrice, description, images = [],
    rating = 0, reviewCount = 0, stock = 0, category, isKosher,
  } = product

  const discPct = originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0

  const handleAdd = () => {
    addItem(product, qty)
    toast.success('נוסף לסל! 🛒')
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex items-center gap-2 text-[14px] text-slate-400">
        <Link href="/" className="hover:text-primary-600 transition-colors">ראשי</Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-primary-600 transition-colors">מוצרים</Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium truncate max-w-xs">{name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* Gallery */}
          <div>
            <div className="relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm" style={{ height: 420 }}>
              {images[mainImg]
                ? <Image src={images[mainImg]} alt={name} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" priority />
                : <div className="w-full h-full flex items-center justify-center text-9xl">📱</div>}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2.5 mt-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setMainImg(i)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-50
                      ${mainImg === i ? 'border-primary-500' : 'border-slate-200 hover:border-primary-300'}`}>
                    <Image src={img} alt="" fill sizes="64px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-[12px] font-bold text-primary-500 uppercase tracking-[0.14em] mb-2">{brand}</p>
            <h1 className="font-black text-slate-900 leading-tight mb-4" style={{ fontSize: 30 }}>{name}</h1>

            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />)}
              </div>
              <span className="text-[14px] font-bold text-slate-700">{rating.toFixed(1)}</span>
              <span className="text-[14px] text-slate-400">({reviewCount} ביקורות)</span>
              {stock > 0
                ? <span className="text-[12px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1"><Check className="w-3 h-3" />במלאי</span>
                : <span className="text-[12px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">אזל מהמלאי</span>}
              {isKosher === true && (
                <span className="text-[12px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#D1FAE5', color: '#064E3B' }}>✡ כשר</span>
              )}
            </div>

            <div className="rounded-2xl p-5 mb-5 border" style={{ background: 'var(--primary-pale)', borderColor: 'var(--primary-border)' }}>
              <div className="flex items-baseline gap-3">
                <span className="price-num" style={{ fontSize: 38, lineHeight: 1 }}>₪{price?.toLocaleString()}</span>
                {originalPrice > price && <span className="text-xl text-slate-400 line-through">₪{originalPrice?.toLocaleString()}</span>}
              </div>
              {discPct > 0 && <p className="text-[14px] font-bold text-red-600 mt-1.5">🎉 חסכת ₪{(originalPrice - price).toLocaleString()} — {discPct}% הנחה!</p>}
            </div>

            {description && <p className="text-[15px] text-slate-600 leading-7 mb-5">{description}</p>}

            {/* Qty + Cart */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-lg font-bold text-slate-600 hover:bg-slate-50">−</button>
                <span className="px-4 font-bold text-[15px] text-slate-800 min-w-[2.5rem] text-center">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="px-4 py-3 text-lg font-bold text-slate-600 hover:bg-slate-50">+</button>
              </div>
              <button onClick={handleAdd}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[15px] text-white transition-all"
                style={{ background: added ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                {added ? <><Check className="w-5 h-5" strokeWidth={2.5} />נוסף לסל!</> : <><ShoppingCart className="w-5 h-5" />הוסף לסל</>}
              </button>
              <button onClick={() => setLiked(v => !v)}
                className="w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all"
                style={{ borderColor: liked ? '#FCA5A5' : '#E2E8F0', background: liked ? '#FFF1F2' : 'white' }}>
                <Heart className={`w-5 h-5 ${liked ? 'fill-red-400 text-red-400' : 'text-slate-400'}`} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex gap-2 flex-wrap">
              {[[Truck,'משלוח חינם מ-₪500'],[RotateCcw,'החזרה 14 יום'],[Shield,'אחריות יצרן']].map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                  <Icon className="w-3.5 h-3.5 text-primary-500" />{label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
