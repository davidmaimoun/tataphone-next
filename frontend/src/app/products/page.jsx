'use client'
import { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import productService from '@/services/productService'
import metaService from '@/services/metaService'
import ProductCard from '@/components/product/ProductCard'

const SORT_OPTIONS = [
  { value: 'default', label: 'ברירת מחדל' },
  { value: 'price_asc', label: 'מחיר: נמוך לגבוה ↑' },
  { value: 'price_desc', label: 'מחיר: גבוה לנמוך ↓' },
  { value: 'rating_desc', label: 'דירוג הגבוה ביותר' },
  { value: 'new', label: 'חדש ביותר' },
]

function Badge({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-all whitespace-nowrap ${active ? 'bg-primary-600 text-white border-primary-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-600'}`}>{label}</button>
  )
}

function useUrlParams() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams.toString())
    if (val) next.set(key, val); else next.delete(key)
    router.push(`/products?${next.toString()}`)
  }
  const toggleParam = (key, val) => setParam(key, searchParams.get(key) === val ? '' : val)
  return { searchParams, setParam, toggleParam, router }
}

function FilterBadges({ categories }) {
  const { searchParams, setParam, toggleParam, router } = useUrlParams()
  const sale = searchParams.get('sale') === 'true'
  const topRated = searchParams.get('topRated') === 'true'
  const isNew = searchParams.get('new') === 'true'
  const isKosher = searchParams.get('isKosher') === 'true' || searchParams.get('kosher') === 'yes'
  const category = searchParams.get('category') || ''
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-2">
      <Badge label="🔥 מבצעים" active={sale} onClick={() => toggleParam('sale','true')} />
      <Badge label="⭐ Top rated" active={topRated} onClick={() => toggleParam('topRated','true')} />
      <Badge label="✨ חדש" active={isNew} onClick={() => toggleParam('new','true')} />
      <Badge label="✡ כשר" active={isKosher} onClick={() => {
        const next = new URLSearchParams(searchParams.toString())
        if (isKosher) { next.delete('isKosher'); next.delete('kosher') } else next.set('isKosher','true')
        router.push(`/products?${next.toString()}`)
      }} />
      <Badge label="⚡ אביזרים" active={searchParams.get('isAccessory')==='true'} onClick={() => toggleParam('isAccessory','true')} />
      <div className="hidden sm:block w-px h-6 bg-slate-200 self-center mx-1" />
      {categories.map(cat => <Badge key={cat} label={cat} active={category===cat} onClick={() => setParam('category', category===cat?'':cat)} />)}
    </div>
  )
}

function ProductsInner() {
  const { searchParams, setParam, router } = useUrlParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(false)

  const sort = searchParams.get('sort') || 'default'
  const category = searchParams.get('category') || ''
  const sale = searchParams.get('sale') === 'true'
  const topRated = searchParams.get('topRated') === 'true'
  const isNew = searchParams.get('new') === 'true'
  const isKosher = searchParams.get('isKosher') === 'true' || searchParams.get('kosher') === 'yes'
  const hasFilters = sort !== 'default' || category || sale || topRated || isNew || isKosher
  const clearFilters = () => router.push('/products')

  useEffect(() => {
    productService.getAll({ limit: 300 }).then(d => setProducts(d.products || [])).catch(() => {}).finally(() => setLoading(false))
    metaService.get('categories').then(setCategories).catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    let list = [...products]
    if (category) list = list.filter(p => p.category === category)
    if (sale) list = list.filter(p => p.discount && p.originalPrice > p.price)
    if (topRated) list = list.filter(p => p.isTopRated || (p.rating >= 4.5))
    if (isNew) list = list.filter(p => p.isNew)
    if (isKosher) list = list.filter(p => p.isKosher === true)
    if (searchParams.get('isAccessory')==='true') list = list.filter(p => p.isAccessory === true)
    switch (sort) {
      case 'price_asc': list.sort((a,b) => a.price - b.price); break
      case 'price_desc': list.sort((a,b) => b.price - a.price); break
      case 'rating_desc': list.sort((a,b) => (b.rating||0) - (a.rating||0)); break
      case 'new': list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); break
    }
    return list
  }, [products, category, sale, topRated, isNew, isKosher, searchParams, sort])

  return (
    <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-5">
        <div><h1 className="font-black text-2xl sm:text-3xl text-slate-900">כל המוצרים</h1><p className="text-[13px] text-slate-400 mt-0.5">{filtered.length} מוצרים</p></div>
        <div className="relative">
          <select value={sort} onChange={e => setParam('sort', e.target.value === 'default' ? '' : e.target.value)} className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-8 text-[13px] font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-primary-400">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 sm:hidden">
        <button onClick={() => setShowSidebar(v=>!v)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-700"><SlidersHorizontal className="w-4 h-4" />סינון{hasFilters && <span className="w-2 h-2 bg-primary-500 rounded-full" />}</button>
        {hasFilters && <button onClick={clearFilters} className="text-[12px] text-red-500 font-bold">נקה</button>}
      </div>

      <div className={`fixed inset-0 z-40 sm:hidden transition-all duration-200 ${showSidebar?'visible':'invisible'}`}>
        <div className={`absolute inset-0 bg-black/40 transition-opacity ${showSidebar?'opacity-100':'opacity-0'}`} onClick={() => setShowSidebar(false)} />
        <div className={`absolute right-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col transition-transform duration-300 ${showSidebar?'translate-x-0':'translate-x-full'}`}>
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100"><h3 className="font-black text-slate-900">סינון</h3><button onClick={() => setShowSidebar(false)}><X className="w-5 h-5 text-slate-400" /></button></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2"><FilterBadges categories={categories} /></div>
          <div className="p-4 border-t border-slate-100"><button onClick={() => { clearFilters(); setShowSidebar(false) }} className="w-full py-2.5 rounded-xl text-[13px] font-bold text-red-500 bg-red-50 border border-red-100">נקה הכל</button></div>
        </div>
      </div>

      <div className="hidden sm:flex flex-wrap gap-2 mb-6">
        <FilterBadges categories={categories} />
        {hasFilters && <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"><X className="w-3 h-3" />נקה</button>}
      </div>

      {loading ? (
        <div className="products-grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">{Array.from({length:8}).map((_,i) => <div key={i} className="bg-white/60 rounded-2xl animate-pulse" style={{height:300}} />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24"><p className="text-6xl mb-4">🔍</p><p className="font-black text-xl text-slate-800 mb-2">לא נמצאו מוצרים</p><button onClick={clearFilters} className="btn btn-primary mt-4 px-8">הצג הכל</button></div>
      ) : (
        <div className="products-grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 items-stretch">{filtered.map((p) => <ProductCard key={p._id} product={p} />)}</div>
      )}
    </div>
  )
}

export default function ProductsPage() { return <Suspense><ProductsInner /></Suspense> }