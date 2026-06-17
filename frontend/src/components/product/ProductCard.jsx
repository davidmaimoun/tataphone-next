import Link from 'next/link'
import Image from 'next/image'
import AddToCartButton from './AddToCartButton'
import WishlistHeart from './WishlistHeart'

// SERVER COMPONENT — rendu côté serveur (SEO + perf).
// Seuls <AddToCartButton> et <WishlistHeart> sont des îlots client.
export default function ProductCard({ product, forceNew = false }) {
  const { _id, name, brand, price, originalPrice, discount, images = [], isNew, isKosher } = product
  const img = images[0]
  const discPct = discount && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0
  const showNew = forceNew || isNew

  return (
    <Link href={`/products/${_id}`}
      className="product-card flex flex-col h-full w-full overflow-hidden group">

      {/* Image */}
      <div className="relative flex-shrink-0 overflow-hidden bg-slate-50" style={{ height: 180 }}>
        {img
          ? <Image src={img} alt={name} fill sizes="(max-width:640px) 50vw, 200px" unoptimized
                   className="object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-5xl text-slate-200">📱</div>}

        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
          {showNew && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', boxShadow: '0 2px 6px var(--primary-shadow)' }}>
              ✦ חדש
            </span>
          )}
          {discPct > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg,#EF4444,#DC2626)', boxShadow: '0 2px 6px rgba(220,38,38,0.4)' }}>
              −{discPct}%
            </span>
          )}
        </div>

        {/* Wishlist heart — CLIENT island */}
        <WishlistHeart productId={_id} />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 px-2.5 pt-2.5 pb-2.5">
        <p className="text-[10px] font-bold text-primary-500 uppercase tracking-wide mb-0.5">{brand}</p>
        <p className="text-[12px] sm:text-[13px] font-semibold text-slate-800 line-clamp-2 leading-snug mb-1"
           style={{ minHeight: '2.4rem' }}>{name}</p>

        {isKosher === true && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full mb-1.5 w-fit"
            style={{ background: '#D1FAE5', color: '#064E3B', border: '1px solid #6EE7B7' }}>
            <span style={{ fontSize: 10 }}>✡</span>כשר
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
          {/* Cart — CLIENT island */}
          <AddToCartButton product={product} />
        </div>
      </div>
    </Link>
  )
}