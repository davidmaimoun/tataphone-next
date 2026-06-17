'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart, Check, Heart, Truck, RotateCcw, Shield, ChevronLeft, Info } from 'lucide-react'
import useCartStore from '@/stores/cartStore'
import useCartUiStore from '@/stores/cartUiStore'
import useWishlistStore from '@/stores/wishlistStore'
import useAuthStore from '@/stores/authStore'
import { colorToCss, isLight } from '@/utils/colorUtils'
import toast from 'react-hot-toast'

function ColorSwatch({ name, selected, onClick }) {
  const css = colorToCss(name)
  const light = isLight(css)
  return css ? (
    <button onClick={onClick} title={name} className="w-9 h-9 rounded-full transition-all hover:scale-110 flex-shrink-0"
      style={{ background: css, outline: selected ? '3px solid var(--primary)' : `2px solid ${light ? '#D1D5DB' : 'transparent'}`, outlineOffset:'2px', boxShadow: selected ? '0 0 0 1px var(--primary)' : 'none' }}>
      {selected && <Check className={`w-3.5 h-3.5 mx-auto ${light ? 'text-slate-700' : 'text-white'}`} strokeWidth={3} />}
    </button>
  ) : (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-xl text-[13px] font-semibold border-2 transition-all ${selected ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300'}`}>{name}</button>
  )
}

export default function ProductDetailClient({ product }) {
  const addItem = useCartStore(s => s.addItem)
  const openCart = useCartUiStore(s => s.openCart)
  const toggle = useWishlistStore(s => s.toggle)
  const liked = useWishlistStore(s => s.ids.includes(product._id))
  const user = useAuthStore(s => s.user)
  const [mainImg, setMainImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [selColor, setSelColor] = useState(0)
  const [selSize, setSelSize] = useState(0)

  const {
    _id, name, brand, price, originalPrice, description, images = [],
    rating = 0, reviewCount = 0, stock = 0, category, isKosher,
    specs = {}, colors = [], sizes = [], note = '',
  } = product

  // visited tracking
  useEffect(() => {
    try {
      const visited = JSON.parse(localStorage.getItem('visited') || '[]')
      const next = [_id, ...visited.filter(x => x !== _id)].slice(0, 20)
      localStorage.setItem('visited', JSON.stringify(next))
    } catch {}
  }, [_id])

  const discPct = originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0
  const specsObj = typeof specs === 'object' && !Array.isArray(specs) && specs !== null ? specs : {}
  const showColors = Array.isArray(colors) && colors.length > 0
  const showSizes = Array.isArray(sizes) && sizes.length > 0
  const hasSpecs = Object.keys(specsObj).length > 0

  const handleAdd = () => {
    addItem(product, qty)
    openCart()
    toast.success('נוסף לסל! 🛒')
    setAdded(true); setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-4 flex items-center gap-2 text-[14px] text-slate-400">
        <Link href="/" className="hover:text-primary-600 transition-colors">ראשי</Link>
        <ChevronLeft className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-primary-600 transition-colors">מוצרים</Link>
        {category && <><ChevronLeft className="w-3.5 h-3.5" /><Link href={`/products?category=${encodeURIComponent(category)}`} className="hover:text-primary-600 transition-colors">{category}</Link></>}
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium truncate max-w-xs">{name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery */}
          <div>
            <div className="relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm" style={{ height: 420 }}>
              {images[mainImg]
                ? <Image src={images[mainImg]} alt={name} fill sizes="(max-width:1024px) 100vw, 50vw" unoptimized className="object-cover" priority />
                : <div className="w-full h-full flex items-center justify-center text-9xl">📱</div>}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2.5 mt-3">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setMainImg(i)} className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-50 ${mainImg === i ? 'border-primary-500' : 'border-slate-200 hover:border-primary-300'}`}>
                    <Image src={img} alt="" fill sizes="64px" unoptimized className="object-cover" />
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
              <div className="flex items-center gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />)}</div>
              <span className="text-[14px] font-bold text-slate-700">{rating.toFixed(1)}</span>
              <span className="text-[14px] text-slate-400">({reviewCount} ביקורות)</span>
              {stock > 0
                ? <span className="text-[12px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1"><Check className="w-3 h-3" />במלאי</span>
                : <span className="text-[12px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">אזל מהמלאי</span>}
              {isKosher === true && <span className="text-[12px] font-bold px-2.5 py-1 rounded-full" style={{ background:'#D1FAE5', color:'#064E3B' }}>✡ כשר</span>}
            </div>

            <div className="rounded-2xl p-5 mb-5 border border-primary-100" style={{ background:'linear-gradient(135deg,var(--primary-pale),#FBF7F4)' }}>
              <div className="flex items-baseline gap-3">
                <span className="price-num" style={{ fontSize: 38, lineHeight: 1 }}>₪{price?.toLocaleString()}</span>
                {originalPrice > price && <span className="text-xl text-slate-400 line-through">₪{originalPrice?.toLocaleString()}</span>}
              </div>
              {discPct > 0 && <p className="text-[14px] font-bold text-red-600 mt-1.5">🎉 חסכת ₪{(originalPrice - price).toLocaleString()} — {discPct}% הנחה!</p>}
            </div>

            {description && <p className="text-[15px] text-slate-600 leading-7 mb-5">{description}</p>}

            {showColors && (
              <div className="mb-5">
                <p className="text-[14px] font-bold text-slate-700 mb-3">צבע: <span className="font-normal text-slate-500">{colors[selColor]}</span></p>
                <div className="flex gap-2.5 flex-wrap">{colors.map((color, i) => <ColorSwatch key={i} name={color} selected={selColor === i} onClick={() => setSelColor(i)} />)}</div>
              </div>
            )}

            {showSizes && (
              <div className="mb-5">
                <p className="text-[14px] font-bold text-slate-700 mb-3">אחסון / מידה</p>
                <div className="flex gap-2 flex-wrap">
                  {sizes.map((size, i) => (
                    <button key={i} onClick={() => setSelSize(i)} className="px-4 py-2 rounded-xl text-[14px] font-semibold border-2 transition-all"
                      style={selSize === i ? { borderColor:'var(--primary)', background:'var(--primary-pale)', color:'var(--primary-deep)' } : { borderColor:'#E2E8F0', background:'white', color:'#64748B' }}>{size}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Cart */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-lg font-bold text-slate-600 hover:bg-slate-50">−</button>
                <span className="px-4 font-bold text-[15px] text-slate-800 min-w-[2.5rem] text-center">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="px-4 py-3 text-lg font-bold text-slate-600 hover:bg-slate-50">+</button>
              </div>
              <button onClick={handleAdd} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[15px] text-white transition-all"
                style={{ background: added ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg,var(--primary),var(--primary-dark))' }}>
                {added ? <><Check className="w-5 h-5" strokeWidth={2.5} />נוסף לסל!</> : <><ShoppingCart className="w-5 h-5" />הוסף לסל</>}
              </button>
              <button onClick={() => toggle(_id, user)} className="w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all" style={{ borderColor: liked ? '#FCA5A5' : '#E2E8F0', background: liked ? '#FFF1F2' : 'white' }}>
                <Heart className={`w-5 h-5 ${liked ? 'fill-red-400 text-red-400' : 'text-slate-400'}`} />
              </button>
            </div>

            {/* Trust */}
            <div className="flex gap-2 flex-wrap">
              {[[Truck,'משלוח חינם מ-₪500'],[RotateCcw,'החזרה 14 יום'],[Shield,'אחריות יצרן']].map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl"><Icon className="w-3.5 h-3.5 text-primary-500" />{label}</div>
              ))}
            </div>

            {/* Admin note */}
            {note && (
              <div className="mt-6 flex gap-3 p-4 rounded-2xl border border-primary-200" style={{ background:'linear-gradient(135deg,var(--primary-pale),#FBF7F4)' }}>
                <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5"><Info className="w-4 h-4 text-primary-600" /></div>
                <div><p className="text-[12px] font-bold text-primary-600 uppercase tracking-wider mb-1">💡 כדאי לדעת</p><p className="text-[14px] text-slate-700 leading-relaxed">{note}</p></div>
              </div>
            )}

            {/* Specs */}
            {hasSpecs && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="text-[15px] font-bold text-slate-700 mb-3">מפרט טכני</h3>
                <div className="space-y-0">
                  {Object.entries(specsObj).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[14px] py-2.5 border-b border-slate-50"><span className="text-slate-400 font-medium">{k}</span><span className="text-slate-700 font-semibold">{v}</span></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}