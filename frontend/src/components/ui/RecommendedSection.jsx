'use client'
import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import SectionHeader from './SectionHeader'
import ProductCarousel from './ProductCarousel'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const W = 'max-w-[1440px] mx-auto px-2 sm:px-6 lg:px-8'

export default function RecommendedSection() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    let visited = []
    try { visited = JSON.parse(localStorage.getItem('visited') || '[]') } catch {}
    if (!visited.length) return
    fetch(`${API}/products/recommended`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitedIds: visited }),
    }).then(r => r.ok ? r.json() : { products: [] })
      .then(d => setProducts(d.products || []))
      .catch(() => {})
  }, [])

  if (products.length === 0) return null

  return (
    <section className="py-14" style={{ background:'linear-gradient(to bottom,#F0FDF4,white)' }}>
      <div className={`${W} mb-6`}>
        <SectionHeader icon={Star} iconColor="text-green-500" label="עבורך" title="מומלץ" gradientWord="אישית"
          gradientColors="#10B981, #06B6D4" description="בהתאם למוצרים שצפית בהם" />
      </div>
      <div className={W}><ProductCarousel products={products} /></div>
    </section>
  )
}
