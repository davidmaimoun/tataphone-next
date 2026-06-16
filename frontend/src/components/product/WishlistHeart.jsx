'use client'
import { Heart } from 'lucide-react'
import useWishlistStore from '@/stores/wishlistStore'

export default function WishlistHeart({ productId }) {
  const toggle = useWishlistStore(s => s.toggle)
  const liked = useWishlistStore(s => s.ids.includes(productId))

  const handleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(productId)
  }

  return (
    <button onClick={handleLike}
      className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-all"
      style={{
        background: liked ? '#FFF1F2' : 'rgba(255,255,255,0.88)',
        border: liked ? '1.5px solid #FCA5A5' : '1.5px solid rgba(0,0,0,0.10)',
        boxShadow: '0 1px 6px rgba(0,0,0,0.12)',
      }}>
      <Heart className="w-3.5 h-3.5 transition-all" style={{ fill: liked ? '#F43F5E' : 'none', color: liked ? '#F43F5E' : '#64748B' }} />
    </button>
  )
}
