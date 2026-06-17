'use client'
import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Plus, Pencil, Trash2, Search, X, Check, Star, Upload, Layers, Building2, Tag, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import metaService from '@/services/metaService'
import { productAdmin } from '@/services/productService'
import productService from '@/services/productService'
import toast from 'react-hot-toast'

// ── Meta manager (add/remove categories, brands, tags) ──
function MetaManager({ collection, label, icon: Icon, color }) {
  const [items, setItems] = useState([])
  const [newVal, setNewVal] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => { metaService.get(collection).then(setItems) }, [collection])

  const add = async () => {
    const v = newVal.trim()
    if (!v) return
    if (items.some(i => i.toLowerCase() === v.toLowerCase())) { toast.error(`"${v}" כבר קיים`); return }
    setLoading(true)
    try { await metaService.add(collection, v); setItems(p => [...p, v].sort()); setNewVal(''); toast.success(`"${v}" נוסף!`) }
    catch { toast.error('שגיאה') } finally { setLoading(false) }
  }
  const remove = async (name) => { await metaService.delete(collection, name); setItems(p => p.filter(i => i !== name)); toast.success(`"${name}" הוסר`) }

  return (
    <div className="border border-slate-100 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4" style={{ color }} />
        <p className="font-bold text-[13px] text-slate-700">{label}</p>
        <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="flex gap-2 mb-3">
        <input value={newVal} onChange={e => setNewVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} dir="rtl" placeholder={`הוסף ${label}...`} className="input text-sm flex-1 h-9" />
        <button onClick={add} disabled={loading || !newVal.trim()} className="px-3 py-1.5 rounded-xl text-white text-[12px] font-bold transition-all disabled:opacity-40" style={{ background: color }}>{loading ? '...' : '+ הוסף'}</button>
      </div>
      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
        {items.map(item => (
          <span key={item} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold group" style={{ background: `${color}15`, color }}>
            {item}<button onClick={() => remove(item)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"><X className="w-2.5 h-2.5" /></button>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Last Minute config (price threshold only) ──
function LastMinuteConfig() {
  const [open, setOpen] = useState(false)
  const [maxPrice, setMaxPrice] = useState(200)
  useEffect(() => { try { setMaxPrice(parseInt(localStorage.getItem('lm_maxPrice') || '200')) } catch {} }, [])
  const save = (val) => { setMaxPrice(val); try { localStorage.setItem('lm_maxPrice', val) } catch {} }
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl mb-4 overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-amber-400 flex items-center justify-center"><Zap className="w-3.5 h-3.5 text-white fill-white" /></div>
          <p className="font-black text-slate-800 text-[14px]">סקשן "ברגע האחרון" — הגדרות</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-amber-600" />}
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-amber-200 pt-3">
          <p className="text-[12px] text-slate-500 mb-3">מוצרים מתחת לסכום שנבחר מוצגים אוטומטית בסקשן (לפי תגיות התאמה לסל)</p>
          <div className="flex gap-4 items-end">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wide mb-1">מחיר מקס׳ (₪)</label>
              <input type="number" value={maxPrice} min={1} onChange={e => save(Number(e.target.value))} className="input text-sm w-24" />
            </div>
            <p className="text-[11px] text-amber-700 bg-amber-100 rounded-lg px-2.5 py-1.5">💡 התגיות שתוסיף למוצר קובעות התאמה לסל</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Meta panel (collapsible) ──
function MetaPanel() {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl mb-6 overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-2.5"><Layers className="w-4 h-4 text-slate-500" /><p className="font-black text-slate-800 text-[14px]">ניהול קטגוריות, מותגים ותגיות</p></div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-slate-200 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetaManager collection="categories" label="קטגוריות" icon={Layers} color="#CC785C" />
          <MetaManager collection="brands" label="מותגים" icon={Building2} color="#7C3AED" />
          <MetaManager collection="tags" label="תגיות" icon={Tag} color="#059669" />
        </div>
      )}
    </div>
  )
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)

  const load = async () => { setLoading(true); try { const { default: api } = await import('@/services/api'); const r = await api.get('/products/admin/list'); setProducts(r.data.products || []) } catch { productService.getAll({ limit: 9999 }).then(d => setProducts(d.products || [])) } finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const handleDelete = async (id, name) => {
    if (!confirm(`למחוק את "${name}"?`)) return
    try { await productAdmin.remove(id); toast.success('נמחק'); load() } catch { toast.error('שגיאה במחיקה') }
  }
  const filtered = products.filter(p => { const q = search.toLowerCase(); return !q || p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) })

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-2xl font-black text-slate-900">מוצרים ({products.length})</h1>
        <button onClick={() => setModal('new')} className="btn btn-primary px-4 py-2.5"><Plus className="w-4 h-4" />מוצר חדש</button>
      </div>

      <LastMinuteConfig />
      <MetaPanel />

      <div className="relative mb-4 max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חפש מוצר..." className="input pr-10" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-right min-w-[600px]">
          <thead className="bg-slate-50 text-[12px] font-bold text-slate-500 uppercase">
            <tr><th className="px-4 py-3">מוצר</th><th className="px-4 py-3 hidden sm:table-cell">מותג</th><th className="px-4 py-3">קטגוריה</th><th className="px-4 py-3">מחיר</th><th className="px-4 py-3 hidden md:table-cell">מלאי</th><th className="px-4 py-3">פעולות</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">טוען...</td></tr>
             : filtered.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">אין מוצרים</td></tr>
             : filtered.map(p => (
              <tr key={p._id} className="hover:bg-slate-50">
                <td className="px-4 py-3"><div className="flex items-center gap-2">{p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />}<div><p className="font-semibold text-slate-800 text-[14px] line-clamp-1">{p.name}</p>{p.isKosher && <span className="text-[10px] text-emerald-600 font-bold">✡ כשר</span>}</div></div></td>
                <td className="px-4 py-3 text-[13px] text-slate-500 hidden sm:table-cell">{p.brand}</td>
                <td className="px-4 py-3"><span className="text-xs font-bold bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full">{p.category}</span></td>
                <td className="px-4 py-3 font-bold text-[14px]">₪{p.price?.toLocaleString()}</td>
                <td className="px-4 py-3 text-[13px] hidden md:table-cell"><span className={p.stock > 0 ? 'text-green-600' : 'text-red-500'}>{p.stock ?? 0}</span></td>
                <td className="px-4 py-3"><div className="flex gap-1">
                  <button onClick={() => setModal(p)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:border-primary-400 hover:text-primary-600"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(p._id, p.name)} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:border-red-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && <ProductModal product={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load() }} />}
    </div>
  )
}

const DEFAULT_SIZES = ['XS','S','M','L','XL','XXL','64GB','128GB','256GB','512GB']
const DEFAULT_COLORS = ['שחור','לבן','כסף','אפור','זהב','ורוד','אדום','כחול','ירוק','סגול','כתום','טיטניום','שמפניה']

function ProductModal({ product, onClose, onSave }) {
  const [metaCategories, setMetaCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [colors, setColors] = useState(DEFAULT_COLORS)
  const [metaTags, setMetaTags] = useState([])
  const [saving, setSaving] = useState(false)
  const [newBrand, setNewBrand] = useState(''); const [newColor, setNewColor] = useState(''); const [newCat, setNewCat] = useState(''); const [newTag, setNewTag] = useState('')
  const [showNewBrand, setShowNewBrand] = useState(false); const [showNewColor, setShowNewColor] = useState(false); const [showNewCat, setShowNewCat] = useState(false); const [showNewTag, setShowNewTag] = useState(false)
  const [note, setNote] = useState(product?.note || '')
  const DEFAULT_SECTIONS = [
    { title:'תיאור', body:'' }, { title:'אחריות', body:'' },
    { title:'משלוח', body:'' }, { title:'החזרות', body:'' },
  ]
  const [details, setDetails] = useState(() => {
    const d = product?.details
    if (Array.isArray(d) && d.length) return d.map(s => ({ title:String(s.title||''), body:String(s.body||'') }))
    return DEFAULT_SECTIONS
  })
  const [specs, setSpecs] = useState(() => {
    let s = product?.specs
    if (typeof s === 'string') { try { s = JSON.parse(s) } catch { s = {} } }
    if (s && typeof s === 'object' && !Array.isArray(s)) return Object.entries(s).map(([k, v]) => ({ k: String(k), v: String(v) }))
    return []
  })
  const [form, setForm] = useState(product ? {
    ...product,
    selectedColors: Array.isArray(product.colors) ? product.colors : [],
    selectedSizes: Array.isArray(product.sizes) ? product.sizes : [],
    tags: Array.isArray(product.tags) ? product.tags : [],
    isKosher: product.isKosher !== false,
  } : { name:'', brand:'', sku:'', category:'', description:'', price:'', originalPrice:'', supplierPrice:'', stock:0, selectedColors:[], selectedSizes:[], tags:[], isKosher:true })
  const [photos, setPhotos] = useState((product?.images || []).map((url, i) => ({ url, isMain: i === 0, file: null })))
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  useEffect(() => {
    metaService.get('categories').then(cats => setMetaCategories(cats.length ? cats : ['סמארטפונים','מצלמות','אוזניות','שעונים']))
    metaService.get('brands').then(setBrands)
    metaService.get('tags').then(setMetaTags)
    metaService.getColors().then(dbColors => setColors([...new Set([...DEFAULT_COLORS, ...dbColors, ...(product?.colors || [])])]))
  }, [])

  const onDrop = useCallback((accepted) => {
    const newPhotos = accepted.map(file => ({ url: URL.createObjectURL(file), isMain: false, file }))
    setPhotos(prev => { const all = [...prev, ...newPhotos]; if (!all.some(p => p.isMain) && all.length) all[0].isMain = true; return all })
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } })
  const setMain = (i) => setPhotos(prev => prev.map((p, idx) => ({ ...p, isMain: idx === i })))
  const removePhoto = (i) => setPhotos(prev => prev.filter((_, idx) => idx !== i))
  const movePhoto = (from, to) => setPhotos(prev => { const a = [...prev]; const [m] = a.splice(from, 1); a.splice(to, 0, m); return a })

  const addAndSave = async (col, val, setter) => { const v = val.trim(); if (!v) return null; await metaService.add(col, v).catch(() => {}); setter(p => [...new Set([...p, v])].sort()); return v }
  const addBrand = async () => { const v = await addAndSave('brands', newBrand, setBrands); if (v) { setForm(p => ({ ...p, brand: v })); setNewBrand(''); setShowNewBrand(false) } }
  const addCat = async () => { const v = await addAndSave('categories', newCat, setMetaCategories); if (v) { setForm(p => ({ ...p, category: v })); setNewCat(''); setShowNewCat(false) } }
  const addTag = async () => { const v = await addAndSave('tags', newTag.toLowerCase(), setMetaTags); if (v) { setForm(p => ({ ...p, tags: [...new Set([...(p.tags || []), v])] })); setNewTag(''); setShowNewTag(false) } }
  const addColor = async () => { const v = newColor.trim(); if (!v) return; setColors(p => [...new Set([...p, v])]); setForm(p => ({ ...p, selectedColors: [...new Set([...(p.selectedColors || []), v])] })); setNewColor(''); setShowNewColor(false) }
  const toggleTag = t => setForm(p => ({ ...p, tags: p.tags?.includes(t) ? p.tags.filter(x => x !== t) : [...(p.tags || []), t] }))
  const toggleColor = c => setForm(p => ({ ...p, selectedColors: p.selectedColors?.includes(c) ? p.selectedColors.filter(x => x !== c) : [...(p.selectedColors || []), c] }))
  const toggleSize = s => setForm(p => ({ ...p, selectedSizes: p.selectedSizes?.includes(s) ? p.selectedSizes.filter(x => x !== s) : [...(p.selectedSizes || []), s] }))

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const fd = new FormData()
      const TEXT = ['name','brand','sku','category','description','price','originalPrice','supplierPrice','stock']
      TEXT.forEach(k => { const v = form[k]; if (v !== undefined && v !== null) fd.append(k, v) })
      fd.append('colors', JSON.stringify(form.selectedColors || []))
      fd.append('sizes', JSON.stringify(form.selectedSizes || []))
      fd.append('tags', JSON.stringify(form.tags || []))
      const specsObj = {}; specs.filter(s => s.k.trim()).forEach(s => { specsObj[s.k.trim()] = s.v.trim() })
      fd.append('specs', JSON.stringify(specsObj))
      fd.append('note', note)
      fd.append('details', JSON.stringify(details.filter(s => s.title.trim() || s.body.trim())))
      fd.append('isKosher', form.isKosher ? 'true' : 'false')
      // isAccessory auto-derived: a product is "accessory" if it has tags AND is cheap — backend may infer. We send false by default unless backend handles tags.
      const sorted = [...photos].sort((a, b) => b.isMain - a.isMain)
      fd.append('existingImages', JSON.stringify(sorted.filter(p => !p.file).map(p => p.url)))
      sorted.filter(p => p.file).forEach(p => fd.append('photos', p.file))
      const saved = product ? await productAdmin.update(product._id, fd) : await productAdmin.create(fd)
      onSave(saved); toast.success(product ? 'מוצר עודכן!' : 'מוצר נוצר!')
    } catch (err) { console.error(err); toast.error('שגיאה בשמירה') } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl border border-slate-100 p-8 w-full max-w-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] my-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-black text-xl text-slate-900">{product ? 'ערוך מוצר' : 'מוצר חדש'}</h2>
          <button onClick={onClose} className="icon-btn w-9 h-9"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-5">
          {/* Photos */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">תמונות מוצר<span className="font-normal text-slate-400 mr-1">— הראשונה = ראשית ⭐</span></label>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {photos.map((p, i) => (
                  <div key={i} className="relative group/ph" style={{ width: 90 }}>
                    <div className={`w-full rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${p.isMain ? 'border-amber-400 shadow-md' : 'border-slate-200 hover:border-primary-300'}`} style={{ height: 90 }} onClick={() => setMain(i)}>
                      <img src={p.url} alt="" className="w-full h-full object-contain p-1 bg-slate-50" />
                    </div>
                    {p.isMain && <div className="absolute top-1 right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center"><Star className="w-3 h-3 text-white fill-white" /></div>}
                    <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 left-1 w-5 h-5 bg-red-500 rounded-full text-white hidden group-hover/ph:flex items-center justify-center"><X className="w-3 h-3" /></button>
                    <div className="flex justify-center gap-1 mt-1">
                      {i > 0 && <button type="button" onClick={() => movePhoto(i, i - 1)} className="text-[10px] bg-slate-100 rounded px-1 hover:bg-slate-200">←</button>}
                      {i < photos.length - 1 && <button type="button" onClick={() => movePhoto(i, i + 1)} className="text-[10px] bg-slate-100 rounded px-1 hover:bg-slate-200">→</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-400 hover:bg-primary-50/40'}`}>
              <input {...getInputProps()} />
              <Upload className="w-6 h-6 text-slate-300 mx-auto mb-1" />
              <p className="text-[12px] text-slate-400">גרור תמונות או לחץ להעלאה</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1"><label className="block text-xs font-bold text-slate-500 mb-1.5">שם המוצר *</label><input value={form.name} onChange={set('name')} required dir="rtl" className="input text-sm" placeholder="iPhone 15 Pro" /></div>
            <div><label className="block text-xs font-bold text-slate-500 mb-1.5">SKU</label><input value={form.sku || ''} onChange={set('sku')} dir="rtl" className="input text-sm" placeholder="APL-15PM" /></div>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">מותג *</label>
            {!showNewBrand ? (
              <div className="flex gap-2"><select value={form.brand} onChange={set('brand')} required className="input text-sm flex-1"><option value="">בחר מותג...</option>{brands.map(b => <option key={b} value={b}>{b}</option>)}</select><button type="button" onClick={() => setShowNewBrand(true)} className="btn btn-ghost text-xs px-3 py-2">+ חדש</button></div>
            ) : (
              <div className="flex gap-2"><input value={newBrand} onChange={e => setNewBrand(e.target.value)} dir="rtl" className="input text-sm flex-1" placeholder="שם המותג..." autoFocus /><button type="button" onClick={addBrand} className="btn btn-primary px-3 py-2"><Check className="w-4 h-4" /></button><button type="button" onClick={() => setShowNewBrand(false)} className="btn btn-ghost px-3 py-2"><X className="w-4 h-4" /></button></div>
            )}
          </div>

          {/* Category + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">קטגוריה *</label>
              {!showNewCat ? (
                <div className="flex gap-2"><select value={form.category} onChange={set('category')} required className="input text-sm flex-1"><option value="">בחר...</option>{metaCategories.map(c => <option key={c} value={c}>{c}</option>)}</select><button type="button" onClick={() => setShowNewCat(true)} className="btn btn-ghost text-xs px-2 py-2">+</button></div>
              ) : (
                <div className="flex gap-2"><input value={newCat} onChange={e => setNewCat(e.target.value)} dir="rtl" className="input text-sm flex-1" placeholder="קטגוריה חדשה..." autoFocus /><button type="button" onClick={addCat} className="btn btn-primary px-3 py-2"><Check className="w-4 h-4" /></button><button type="button" onClick={() => setShowNewCat(false)} className="btn btn-ghost px-3 py-2"><X className="w-4 h-4" /></button></div>
              )}
            </div>
            <div><label className="block text-xs font-bold text-slate-500 mb-1.5">מלאי</label><input type="number" min="0" value={form.stock || 0} onChange={set('stock')} className="input text-sm" /></div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold text-slate-500 mb-1.5">מחיר (₪) *</label><input type="number" min="0" value={form.price || ''} onChange={set('price')} required className="input text-sm" /></div>
            <div><label className="block text-xs font-bold text-slate-500 mb-1.5">מחיר מקורי</label><input type="number" min="0" value={form.originalPrice || ''} onChange={set('originalPrice')} className="input text-sm" placeholder="אופציונלי" /></div>
          </div>

          {/* Prix fournisseur — usage interne */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <label className="block text-xs font-bold text-amber-700 mb-1.5">🔒 מחיר ספק <span className="font-normal text-amber-600">(פנימי — לא מוצג ללקוח)</span></label>
            <input type="number" min="0" value={form.supplierPrice || ''} onChange={set('supplierPrice')} className="input text-sm max-w-[200px]" placeholder="עלות מהספק" />
          </div>

          {/* Description */}
          <div><label className="block text-xs font-bold text-slate-500 mb-1.5">תיאור</label><textarea value={form.description || ''} onChange={set('description')} rows={3} dir="rtl" className="input resize-none text-sm" placeholder="תיאור המוצר..." /></div>

          {/* Kosher only (isAccessory toggle removed per request) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">כשרות</label>
            <div className="flex gap-2 max-w-xs">
              {[{ val:true, label:'✡ כשר', color:'#059669', bg:'#F0FDF4', border:'#6EE7B7' }, { val:false, label:'לא כשר', color:'#DC2626', bg:'#FEF2F2', border:'#FECACA' }].map(({ val, label, color, bg, border }) => (
                <label key={String(val)} className="flex-1 cursor-pointer">
                  <input type="radio" name="isKosher" className="sr-only" checked={form.isKosher === val} onChange={() => setForm(p => ({ ...p, isKosher: val }))} />
                  <div className="flex items-center justify-center py-2 px-3 rounded-xl border-2 text-[12px] font-bold transition-all" style={{ background: form.isKosher === val ? bg : '#FAFAFA', borderColor: form.isKosher === val ? border : '#E2E8F0', color: form.isKosher === val ? color : '#94A3B8' }}>{label}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">תגיות <span className="font-normal text-slate-400">(לחיפוש חכם + ברגע האחרון)</span></label>
            <div className="flex flex-wrap gap-2 mb-2">
              {metaTags.map(t => (
                <button type="button" key={t} onClick={() => toggleTag(t)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${form.tags?.includes(t) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'}`}>#{t}</button>
              ))}
              {!showNewTag ? <button type="button" onClick={() => setShowNewTag(true)} className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-dashed border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 transition-all">+ הוסף</button>
               : <div className="flex gap-1.5"><input value={newTag} onChange={e => setNewTag(e.target.value)} dir="ltr" className="input text-xs px-2 py-1 h-auto w-28" placeholder="tag..." autoFocus /><button type="button" onClick={addTag} className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></button><button type="button" onClick={() => setShowNewTag(false)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center"><X className="w-3.5 h-3.5 text-slate-500" /></button></div>}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">צבעים</label>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => <button type="button" key={c} onClick={() => toggleColor(c)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${form.selectedColors?.includes(c) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'}`}>{c}</button>)}
              {!showNewColor ? <button type="button" onClick={() => setShowNewColor(true)} className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-dashed border-slate-300 text-slate-400 hover:border-primary-400 hover:text-primary-500 transition-all">+ הוסף</button>
               : <div className="flex gap-1.5"><input value={newColor} onChange={e => setNewColor(e.target.value)} dir="rtl" className="input text-xs px-2 py-1 h-auto w-24" placeholder="צבע..." autoFocus /><button type="button" onClick={addColor} className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></button><button type="button" onClick={() => setShowNewColor(false)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center"><X className="w-3.5 h-3.5 text-slate-500" /></button></div>}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">מידות</label>
            <div className="flex flex-wrap gap-2">{DEFAULT_SIZES.map(s => <button type="button" key={s} onClick={() => toggleSize(s)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${form.selectedSizes?.includes(s) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'}`}>{s}</button>)}</div>
          </div>

          {/* Note */}
          <div><label className="block text-xs font-bold text-slate-500 mb-1.5">הערת מנהל <span className="font-normal text-slate-400">("כדאי לדעת")</span></label><textarea value={note} onChange={e => setNote(e.target.value)} rows={2} dir="rtl" className="input resize-none text-sm" placeholder="לדוגמה: מחיר כולל מתאם ישראלי." /></div>

          {/* Specs */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">מפרט טכני</label>
            <div className="space-y-2 mb-2">
              {specs.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={row.k} onChange={e => setSpecs(prev => prev.map((r, idx) => idx === i ? { ...r, k: e.target.value } : r))} dir="rtl" className="input text-xs flex-1" placeholder="שם" />
                  <input value={row.v} onChange={e => setSpecs(prev => prev.map((r, idx) => idx === i ? { ...r, v: e.target.value } : r))} dir="rtl" className="input text-xs flex-1" placeholder="ערך" />
                  <button type="button" onClick={() => setSpecs(prev => prev.filter((_, idx) => idx !== i))} className="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setSpecs(prev => [...prev, { k:'', v:'' }])} className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"><Plus className="w-3.5 h-3.5" />הוסף שורה</button>
          </div>

          {/* Sections (לשוניות מתחת למוצר) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">מקטעים — לשוניות מתחת למוצר <span className="font-normal text-slate-400">(תיאור, אחריות, משלוח...)</span></label>
            <div className="space-y-3 mb-2">
              {details.map((sec, i) => (
                <div key={i} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                  <div className="flex gap-2 items-center mb-2">
                    <input value={sec.title} onChange={e => setDetails(prev => prev.map((s,idx)=>idx===i?{...s,title:e.target.value}:s))} dir="rtl" className="input text-sm font-bold flex-1" placeholder="כותרת הלשונית (תיאור, אחריות...)" />
                    <button type="button" onClick={() => setDetails(prev => prev.filter((_,idx)=>idx!==i))} className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center flex-shrink-0"><X className="w-4 h-4" /></button>
                  </div>
                  <textarea value={sec.body} onChange={e => setDetails(prev => prev.map((s,idx)=>idx===i?{...s,body:e.target.value}:s))} rows={3} dir="rtl" className="input resize-none text-sm w-full" placeholder="תוכן הלשונית..." />
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setDetails(prev => [...prev, { title:'', body:'' }])} className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"><Plus className="w-3.5 h-3.5" />הוסף מקטע</button>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn btn-primary px-8 py-2.5 text-[14px]">{saving ? 'שומר...' : product ? 'שמור שינויים' : 'צור מוצר'}</button>
            <button type="button" onClick={onClose} className="btn btn-ghost py-2.5 px-5 text-[14px]">ביטול</button>
          </div>
        </form>
      </div>
    </div>
  )
}