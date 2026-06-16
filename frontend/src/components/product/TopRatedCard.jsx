import Link from 'next/link'
import Image from 'next/image'
import { Star } from 'lucide-react'
import AddToCartButton from './AddToCartButton'
import WishlistHeart from './WishlistHeart'

const MEDAL = {
  1: { from:'#FFD700', to:'#FFA500', shadow:'rgba(255,193,7,0.4)' },
  2: { from:'#C0C0C0', to:'#A0A0A0', shadow:'rgba(160,160,160,0.4)' },
  3: { from:'#CD7F32', to:'#A0522D', shadow:'rgba(160,100,50,0.4)' },
}

// SERVER COMPONENT — affichage. Islands client pour cart/wishlist.
export default function TopRatedCard({ product, rank }) {
  const { _id, name, brand, price, originalPrice, rating = 5, images = [], discount, isKosher } = product
  const r = parseFloat(rating) || 5
  const img = images[0]
  const discPct = discount && originalPrice > price ? Math.round((1-price/originalPrice)*100) : 0
  const medal = MEDAL[rank] || null

  return (
    <Link href={`/products/${_id}`} className="group block h-full">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col h-full hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:border-primary-200 transition-all duration-250">
        <div className="relative overflow-hidden bg-slate-50 flex-shrink-0" style={{ height:180 }}>
          {img
            ? <Image src={img} alt={name} fill sizes="(max-width:640px) 50vw, 200px" unoptimized className="object-cover group-hover:scale-105 transition-transform duration-300" />
            : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"><div className="text-center"><p className="font-rubik font-black text-slate-300 text-2xl leading-none">טאטע</p><p className="font-rubik font-black text-slate-300 text-2xl leading-none">פון</p></div></div>}

          {/* Rank badge */}
          {medal && (
            <div className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black"
                 style={{ background:`linear-gradient(135deg,${medal.from},${medal.to})`, boxShadow:`0 2px 8px ${medal.shadow}`, color:'#fff' }}>{rank}</div>
          )}
          <WishlistHeart productId={_id} />
          {discPct > 0 && <span className="absolute bottom-2 left-2 text-[10px] font-black px-2 py-0.5 rounded-full text-white z-10" style={{ background:'linear-gradient(135deg,#EF4444,#DC2626)' }}>−{discPct}%</span>}
        </div>
        <div className="p-3 flex flex-col flex-1">
          <p className="text-[10px] font-bold text-primary-500 uppercase tracking-wide mb-0.5">{brand}</p>
          <p className="font-semibold text-slate-800 line-clamp-2 leading-snug mb-1 text-[13px]" style={{ minHeight:'2.2rem' }}>{name}</p>
          {isKosher === true && <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1.5 w-fit" style={{ background:'#D1FAE5', color:'#064E3B', border:'1px solid #6EE7B7' }}><span style={{fontSize:8}}>✡</span>כשר</span>}
          <div className="flex items-center gap-0.5 mb-2">
            {[1,2,3,4,5].map(st => <Star key={st} className={`w-3 h-3 ${st<=Math.round(r)?'text-amber-400 fill-amber-400':'text-slate-200 fill-slate-200'}`} />)}
            <span className="text-[10px] text-slate-500 mr-1">{r.toFixed(1)}</span>
          </div>
          <div className="mt-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="price-num" style={{ fontSize:18, lineHeight:1 }}>₪{price?.toLocaleString()}</span>
              {originalPrice > price && <span className="text-[10px] text-slate-400 line-through">₪{originalPrice?.toLocaleString()}</span>}
            </div>
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </Link>
  )
}
