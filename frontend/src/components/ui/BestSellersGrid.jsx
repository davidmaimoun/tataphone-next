'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Check, Star, Heart } from 'lucide-react'
import useCartStore from '@/stores/cartStore'
import useWishlistStore from '@/stores/wishlistStore'
import toast from 'react-hot-toast'

const MEDALS = [
  { gradient:'linear-gradient(135deg,#FFD700,#FFA500)', shadow:'rgba(255,193,7,0.5)' },
  { gradient:'linear-gradient(135deg,#C0C0C0,#A0A0A0)', shadow:'rgba(160,160,160,0.4)' },
  { gradient:'linear-gradient(135deg,#CD7F32,#A0522D)', shadow:'rgba(160,100,50,0.4)' },
]

function WishlistBtn({ productId }) {
  const toggle = useWishlistStore(s => s.toggle)
  const liked = useWishlistStore(s => s.ids.includes(productId))
  return (
    <button onClick={e => { e.preventDefault(); toggle(productId) }}
      className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
      style={{ background: liked?'#FFF1F2':'rgba(255,255,255,0.88)', border: liked?'1.5px solid #FCA5A5':'1.5px solid rgba(0,0,0,0.10)', boxShadow:'0 1px 6px rgba(0,0,0,0.12)' }}>
      <Heart className="w-3.5 h-3.5" style={{ fill:liked?'#F43F5E':'none', color:liked?'#F43F5E':'#64748B' }} />
    </button>
  )
}

function RankedCard({ product, rank }) {
  const addItem = useCartStore(s => s.addItem)
  const [added, setAdded] = useState(false)
  const { _id, name, brand, price, originalPrice, discount, images=[], rating=0, isKosher } = product
  const img = images[0]
  const discPct = discount && originalPrice > price ? Math.round((1-price/originalPrice)*100) : 0
  const medal = MEDALS[rank - 1] || null

  const handle = (e) => {
    e.preventDefault()
    addItem(product)
    toast.success(`${name} נוסף לסל! 🛒`)
    setAdded(true); setTimeout(() => setAdded(false), 1800)
  }

  return (
    <motion.div initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:Math.min(rank*0.06,0.3)}} className="h-full">
      <Link href={`/products/${_id}`} className="group block h-full">
        <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 border-2"
          style={{ borderColor: medal ? medal.shadow.replace('0.5','0.35').replace('0.4','0.3') : '#E2E8F0' }}>
          <div className="relative overflow-hidden bg-slate-50 flex-shrink-0" style={{ height: 200 }}>
            {img
              ? <img src={img} alt={name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
              : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"><div className="text-center"><p className="font-rubik font-black text-slate-300 text-xl leading-none">טאטע</p><p className="font-rubik font-black text-slate-300 text-xl leading-none">פון</p></div></div>}
            {/* Rank number fading into image */}
            <div className="absolute top-0 right-0 pointer-events-none select-none overflow-hidden z-10" style={{ width:90, height:90 }}>
              <div style={{ position:'absolute', inset:0, background: medal ? `radial-gradient(ellipse at 95% 5%, ${medal.shadow} 0%, transparent 70%)` : 'radial-gradient(ellipse at 95% 5%, rgba(100,116,139,0.5) 0%, transparent 70%)' }} />
              <span style={{ position:'absolute', top:2, right:2, fontSize:72, fontWeight:900, lineHeight:1, fontFamily:"'Georgia','Times New Roman',serif", letterSpacing:'-3px',
                background: medal ? `linear-gradient(135deg, white 0%, ${medal.gradient.match(/#[A-Fa-f0-9]{6}/g)?.[0]||'white'} 60%, transparent 100%)` : 'linear-gradient(135deg, white 0%, rgba(200,200,200,0.6) 60%, transparent 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', opacity:0.85 }}>{rank}</span>
            </div>
            <WishlistBtn productId={_id} />
            {discPct > 0 && <span className="absolute bottom-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full text-white z-10" style={{ background:'linear-gradient(135deg,#EF4444,#DC2626)' }}>−{discPct}%</span>}
          </div>
          <div className="p-3 flex flex-col flex-1">
            <p className="text-[10px] font-bold text-primary-500 uppercase tracking-wide mb-0.5">{brand}</p>
            <p className="font-semibold text-slate-800 line-clamp-2 leading-snug mb-1 text-[13px]" style={{ minHeight:'2.2rem' }}>{name}</p>
            {isKosher === true && <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1.5 w-fit" style={{ background:'#D1FAE5', color:'#064E3B', border:'1px solid #6EE7B7' }}><span style={{fontSize:8}}>✡</span>כשר</span>}
            {rating > 0 && (
              <div className="flex items-center gap-0.5 mb-2">
                {[1,2,3,4,5].map(st => <Star key={st} className={`w-3 h-3 ${st<=Math.round(rating)?'text-amber-400 fill-amber-400':'text-slate-200 fill-slate-200'}`} />)}
                <span className="text-[10px] text-slate-500 mr-1">{rating.toFixed(1)}</span>
              </div>
            )}
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="price-num" style={{ fontSize:18, lineHeight:1 }}>₪{price?.toLocaleString()}</span>
                {originalPrice > price && <span className="text-[10px] text-slate-400 line-through">₪{originalPrice?.toLocaleString()}</span>}
              </div>
              <button onClick={handle} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-[12px] text-white transition-all"
                style={{ background: added ? 'linear-gradient(135deg,#059669,#10B981)' : 'linear-gradient(135deg,var(--primary),var(--primary-dark))' }}>
                <AnimatePresence mode="wait" initial={false}>
                  {added
                    ? <motion.span key="c" initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} exit={{opacity:0}} className="flex items-center gap-1"><Check className="w-3.5 h-3.5" strokeWidth={2.5}/>נוסף!</motion.span>
                    : <motion.span key="s" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex items-center gap-1"><ShoppingCart className="w-3.5 h-3.5"/>הוסף</motion.span>}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function Skel() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse flex flex-col">
      <div className="bg-slate-100 flex-shrink-0" style={{ height:200 }} />
      <div className="p-3 space-y-2"><div className="h-3 bg-slate-100 rounded w-1/4" /><div className="h-4 bg-slate-100 rounded w-4/5" /><div className="h-8 bg-slate-100 rounded mt-3" /></div>
    </div>
  )
}

export default function BestSellersGrid({ products=[], loading=false }) {
  const all = loading ? Array.from({length:8},(_,i)=>({_id:`bsk${i}`,_skeleton:true})) : products.slice(0,8)
  if (!all.length) return null
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-2">
      {all.map((p,i) => p._skeleton ? <Skel key={p._id} /> : <RankedCard key={p._id} product={p} rank={i+1} />)}
    </div>
  )
}
