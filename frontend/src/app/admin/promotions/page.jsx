'use client'
import { useState, useEffect } from 'react'
import { Search, Tag, Trash2, Plus, Check, Percent } from 'lucide-react'
import promotionService from '@/services/promotionService'
import productService from '@/services/productService'
import toast from 'react-hot-toast'

export default function AdminPromotions() {
  const [promos, setPromos] = useState([])
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selFilter, setSelFilter] = useState('all')
  const [selSearch, setSelSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [form, setForm] = useState({ name:'', discount:10, startDate:'', endDate:'' })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  useEffect(() => {
    promotionService.getAll().then(d => setPromos(Array.isArray(d) ? d : (d.promotions || []))).catch(() => {})
    productService.getAll({ limit:200 }).then(d => setProducts(d.products || [])).catch(() => {})
  }, [])

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]
  const filteredProducts = products.filter(p => {
    const q = selSearch.toLowerCase()
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)
    const matchFilter = selFilter === 'all' ? true : p.category === selFilter
    return matchSearch && matchFilter
  })
  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const submit = async (e) => {
    e.preventDefault()
    if (!selected.length) { toast.error('בחר לפחות מוצר אחד'); return }
    try {
      await Promise.all(selected.map(id => promotionService.applyDiscount({ type:'product', target:id, discount:form.discount })))
      const promo = await promotionService.create({ ...form, type:'product', target: selected.join(','), productCount: selected.length })
      setPromos(prev => [promo, ...prev]); setShowForm(false); setSelected([])
      toast.success(`הנחה של ${form.discount}% הוחלה על ${selected.length} מוצרים! 🎉`)
    } catch { toast.error('שגיאה ביצירת מבצע') }
  }
  const remove = async (id) => { await promotionService.delete(id); setPromos(prev => prev.filter(p => p._id !== id)); toast.success('מבצע הוסר') }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-slate-900">מבצעים</h1>
        <button onClick={() => setShowForm(v => !v)} className="btn btn-primary px-4 py-2.5"><Plus className="w-4 h-4" />מבצע חדש</button>
      </div>
      {showForm && (
        <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-100 p-5 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className="text-[13px] font-bold text-slate-600 mb-1 block">שם המבצע</label><input value={form.name} onChange={set('name')} className="input" placeholder="מבצע חורף" /></div>
            <div><label className="text-[13px] font-bold text-slate-600 mb-1 block">הנחה %</label><input type="number" value={form.discount} onChange={set('discount')} className="input" /></div>
            <div className="flex items-end"><span className="text-[13px] text-slate-400">{selected.length} מוצרים נבחרו</span></div>
          </div>
          <div className="border border-slate-100 rounded-xl p-3">
            <div className="flex gap-2 mb-3 flex-wrap">
              <div className="relative flex-1 min-w-[150px]"><Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={selSearch} onChange={e => setSelSearch(e.target.value)} placeholder="חפש..." className="input pr-9 text-sm" /></div>
              <select value={selFilter} onChange={e => setSelFilter(e.target.value)} className="input text-sm w-auto"><option value="all">הכל</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
            </div>
            <div className="max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {filteredProducts.map(p => (
                <button type="button" key={p._id} onClick={() => toggleSelect(p._id)} className={`flex items-center gap-2 p-2 rounded-lg border text-right transition-colors ${selected.includes(p._id) ? 'border-primary-400 bg-primary-50' : 'border-slate-100 hover:border-slate-200'}`}>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected.includes(p._id) ? 'bg-primary-500 border-primary-500' : 'border-slate-300'}`}>{selected.includes(p._id) && <Check className="w-3 h-3 text-white" />}</div>
                  {p.images?.[0] && <img src={p.images[0]} alt="" className="w-8 h-8 rounded object-cover" />}
                  <span className="text-[12px] truncate flex-1">{p.name}</span><span className="text-[11px] text-slate-400">₪{p.price}</span>
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary px-6 py-2.5"><Percent className="w-4 h-4" />החל מבצע</button>
        </form>
      )}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {promos.length === 0 ? <div className="p-10 text-center text-slate-400"><Tag className="w-10 h-10 mx-auto mb-2 text-slate-200" />אין מבצעים פעילים</div>
         : <div className="divide-y divide-slate-50">{promos.map(p => <div key={p._id} className="flex items-center justify-between p-4"><div><p className="font-bold text-slate-800">{p.name}</p><p className="text-[12px] text-slate-400">{p.discount}% · {p.productCount || 0} מוצרים</p></div><button onClick={() => remove(p._id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></div>)}</div>}
      </div>
    </div>
  )
}
