'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'

const EMPTY = {
  name: '', brand: '', category: '', price: '', originalPrice: '',
  description: '', stock: '', sku: '', isKosher: false, isAccessory: false,
  isNew: false, discount: false, images: [],
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'new' | product object

  const load = () => {
    setLoading(true)
    api.get('/products/?limit=9999')
      .then(d => setProducts(d.products || []))
      .catch(() => toast.error('שגיאה בטעינת מוצרים'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleDelete = async (id, name) => {
    if (!confirm(`למחוק את "${name}"?`)) return
    try {
      await api.del(`/products/${id}`)
      toast.success('נמחק')
      load()
    } catch { toast.error('שגיאה במחיקה') }
  }

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-black text-slate-900">מוצרים ({products.length})</h1>
        <button onClick={() => setModal('new')} className="btn btn-primary px-4 py-2.5">
          <Plus className="w-4 h-4" />מוצר חדש
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חפש מוצר..."
               className="w-full border border-slate-200 rounded-xl py-2.5 pr-10 pl-3 text-[14px] outline-none focus:border-primary-400" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-[12px] font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">מוצר</th>
              <th className="px-4 py-3 hidden sm:table-cell">מותג</th>
              <th className="px-4 py-3">מחיר</th>
              <th className="px-4 py-3 hidden md:table-cell">מלאי</th>
              <th className="px-4 py-3">פעולות</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">טוען...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">אין מוצרים</td></tr>
            ) : filtered.map(p => (
              <tr key={p._id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                    <div>
                      <p className="font-semibold text-slate-800 text-[14px] line-clamp-1">{p.name}</p>
                      {p.isKosher && <span className="text-[10px] text-emerald-600 font-bold">✡ כשר</span>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] text-slate-500 hidden sm:table-cell">{p.brand}</td>
                <td className="px-4 py-3 font-bold text-[14px]">₪{p.price?.toLocaleString()}</td>
                <td className="px-4 py-3 text-[13px] hidden md:table-cell">
                  <span className={p.stock > 0 ? 'text-green-600' : 'text-red-500'}>{p.stock ?? 0}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => setModal(p)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:border-primary-400 hover:text-primary-600">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(p._id, p.name)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:border-red-300 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && <ProductModal product={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }} />}
    </div>
  )
}

function ProductModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(product ? { ...EMPTY, ...product } : EMPTY)
  const [saving, setSaving] = useState(false)
  const isEdit = !!product

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        originalPrice: Number(form.originalPrice) || 0,
        stock: Number(form.stock) || 0,
      }
      if (isEdit) await api.put(`/products/${product._id}`, payload)
      else await api.post('/products/', payload)
      toast.success(isEdit ? 'עודכן' : 'נוצר')
      onSaved()
    } catch (e) { toast.error(e.message || 'שגיאה') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="font-black text-lg">{isEdit ? 'עריכת מוצר' : 'מוצר חדש'}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="שם המוצר" value={form.name} onChange={v => set('name', v)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="מותג" value={form.brand} onChange={v => set('brand', v)} />
            <Field label="קטגוריה" value={form.category} onChange={v => set('category', v)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="מחיר ₪" type="number" value={form.price} onChange={v => set('price', v)} />
            <Field label="מחיר מקורי ₪" type="number" value={form.originalPrice} onChange={v => set('originalPrice', v)} />
            <Field label="מלאי" type="number" value={form.stock} onChange={v => set('stock', v)} />
          </div>
          <Field label="SKU" value={form.sku} onChange={v => set('sku', v)} />
          <div>
            <label className="text-[13px] font-bold text-slate-600 mb-1.5 block">תיאור</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
                      className="w-full border border-slate-200 rounded-xl p-3 text-[14px] outline-none focus:border-primary-400" />
          </div>
          <Field label="תמונה (URL)" value={form.images?.[0] || ''} onChange={v => set('images', v ? [v] : [])} dir="ltr" />
          <div className="flex flex-wrap gap-4">
            <Toggle label="✡ כשר" checked={form.isKosher} onChange={v => set('isKosher', v)} />
            <Toggle label="⚡ אביזר" checked={form.isAccessory} onChange={v => set('isAccessory', v)} />
            <Toggle label="✨ חדש" checked={form.isNew} onChange={v => set('isNew', v)} />
            <Toggle label="🔥 מבצע" checked={form.discount} onChange={v => set('discount', v)} />
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white">
          <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1 py-2.5">
            {saving ? 'שומר...' : isEdit ? 'שמור שינויים' : 'צור מוצר'}
          </button>
          <button onClick={onClose} className="btn btn-ghost px-6 py-2.5">ביטול</button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', dir = 'rtl' }) {
  return (
    <div>
      <label className="text-[13px] font-bold text-slate-600 mb-1.5 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} dir={dir}
             className="w-full border border-slate-200 rounded-xl py-2.5 px-3 text-[14px] outline-none focus:border-primary-400" />
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} type="button"
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-bold border-2 transition-all ${checked ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-400'}`}>
      <span className={`w-4 h-4 rounded-full border-2 ${checked ? 'bg-primary-500 border-primary-500' : 'border-slate-300'}`} />
      {label}
    </button>
  )
}
