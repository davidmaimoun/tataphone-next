'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import useWishlistStore from '@/stores/wishlistStore'
import useCartStore from '@/stores/cartStore'
import toast from 'react-hot-toast'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function WishlistSection() {
  const toggle = useWishlistStore(s => s.toggle)
  const ids = useWishlistStore(s => s.ids)
  const addItem = useCartStore(s => s.addItem)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); setProducts([]); return }
    fetch(`${API}/products/by-ids`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    }).then(r => r.ok ? r.json() : { products: [] })
      .then(d => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [ids.length])

  if (!loading && ids.length === 0) return null

  return (
    <section className="py-12" style={{ background:'linear-gradient(to bottom,#FFF1F2,white)' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><Heart className="w-5 h-5 text-red-500 fill-red-500" /></div>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">שמרת</span>
            </div>
            <h2 className="font-black tracking-tight leading-none" style={{ fontSize:36 }}>
              <span className="text-slate-900">המוצרים </span>
              <span style={{ WebkitTextFillColor:'transparent', WebkitBackgroundClip:'text', backgroundClip:'text', backgroundImage:'linear-gradient(135deg,#F43F5E,#FB7185)' }}>שאהבת</span>
            </h2>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({length:4}).map((_,i) => <div key={i} className="bg-white rounded-2xl border border-slate-100 animate-pulse"><div className="bg-slate-100 rounded-t-2xl" style={{height:180}}/><div className="p-4 space-y-2"><div className="h-3 bg-slate-100 rounded w-1/4"/><div className="h-4 bg-slate-100 rounded w-4/5"/></div></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((p, i) => (
              <WishlistCard key={p._id} product={p} index={i}
                onRemove={() => { toggle(p._id); setProducts(prev => prev.filter(x => x._id !== p._id)) }}
                onAddCart={() => { addItem(p); toast.success(`${p.name} נוסף לסל! 🛒`) }} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function WishlistCard({ product, index, onRemove, onAddCart }) {
  const { _id, name, brand, price, originalPrice, discount, images=[] } = product
  const img = images[0]
  const discPct = discount && originalPrice > price ? Math.round((1-price/originalPrice)*100) : 0
  return (
    <motion.div initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:index*0.06,duration:0.3}}>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:border-red-100 transition-all group">
        <Link href={`/products/${_id}`}>
          <div className="relative overflow-hidden bg-slate-50" style={{height:180}}>
            {img ? <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full flex items-center justify-center text-5xl text-slate-200">📱</div>}
            {discPct > 0 && <span className="badge badge-sale absolute top-2.5 left-2.5">−{discPct}%</span>}
            <button onClick={e => { e.preventDefault(); onRemove() }} className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 border border-red-200 flex items-center justify-center hover:bg-red-50 transition-all shadow-sm"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
          </div>
        </Link>
        <div className="p-4">
          <p className="text-[11px] font-bold text-primary-500 uppercase tracking-wider mb-1">{brand}</p>
          <Link href={`/products/${_id}`}><p className="text-[14px] font-semibold text-slate-800 line-clamp-2 leading-snug mb-3 hover:text-primary-600 transition-colors">{name}</p></Link>
          <div className="flex items-center justify-between">
            <div>
              <span className="price-num" style={{fontSize:20,lineHeight:1}}>₪{price?.toLocaleString()}</span>
              {originalPrice > price && <span className="text-[11px] text-slate-400 line-through block mt-0.5">₪{originalPrice?.toLocaleString()}</span>}
            </div>
            <button onClick={onAddCart} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-[12px] font-bold transition-all hover:scale-105" style={{background:'linear-gradient(135deg,var(--primary),var(--primary-dark))',boxShadow:'0 2px 8px var(--primary-shadow)'}}><ShoppingCart className="w-3.5 h-3.5" />הוסף</button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
