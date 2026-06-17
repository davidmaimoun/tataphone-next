'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import useWishlistStore from '@/stores/wishlistStore'
import ProductCard from '@/components/product/ProductCard'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function WishlistPage() {
  const ids = useWishlistStore(s => s.ids)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ids.length === 0) { setProducts([]); setLoading(false); return }
    setLoading(true)
    // Fetch each liked product
    Promise.all(
      ids.map(id => fetch(`${API}/products/${id}`).then(r => r.ok ? r.json() : null).catch(() => null))
    ).then(results => {
      setProducts(results.filter(Boolean))
      setLoading(false)
    })
  }, [ids])

  if (!loading && products.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Heart className="w-9 h-9 text-slate-300" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">רשימת המשאלות ריקה</h2>
        <p className="text-slate-400">לחץ על הלב ❤️ במוצרים שאהבת.</p>
        <Link href="/products"><button className="btn btn-primary px-6 py-3">גלה מוצרים ←</button></Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen max-w-[1440px] mx-auto px-2 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-red-400 fill-red-400" />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">רשימת משאלות ({products.length})</h1>
      </div>
      {loading ? (
        <p className="text-slate-400">טוען...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 items-stretch">
          {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
        </div>
      )}
    </main>
  )
}
