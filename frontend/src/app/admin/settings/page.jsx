'use client'
import { useState, useEffect } from 'react'
import { Save, Loader2, Store, Truck, Percent, Megaphone } from 'lucide-react'
import settingsService from '@/services/settingsService'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const [s, setS] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsService.get()
      .then(data => setS(data))
      .catch(() => toast.error('שגיאה בטעינת ההגדרות'))
      .finally(() => setLoading(false))
  }, [])

  const set = (k, v) => setS(p => ({ ...p, [k]: v }))
  const setBanner = (k, v) => setS(p => ({ ...p, promoBanner: { ...p.promoBanner, [k]: v } }))

  const save = async () => {
    setSaving(true)
    try {
      const updated = await settingsService.update(s)
      setS(updated)
      toast.success('✅ ההגדרות נשמרו')
    } catch {
      toast.error('שגיאה בשמירה')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
  if (!s) return <div className="text-center py-20 text-slate-400">לא ניתן לטעון את ההגדרות</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">הגדרות החנות</h1>
        <button onClick={save} disabled={saving} className="btn btn-primary px-5 py-2.5 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}שמור
        </button>
      </div>

      {/* ── TVA ── */}
      <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-800"><Percent className="w-5 h-5 text-primary-600" />מע״מ</div>
        <div>
          <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">שיעור מע״מ (%)</label>
          <input type="number" value={s.vatRate} onChange={e => set('vatRate', e.target.value)} className="input w-full" />
          <p className="text-[11px] text-slate-400 mt-1">המחירים כוללים מע״מ. ערך זה לתצוגה בלבד (כמה מע״מ כלול).</p>
        </div>
      </section>

      {/* ── Livraison ── */}
      <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-800"><Truck className="w-5 h-5 text-primary-600" />משלוח</div>

        <div>
          <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">סוג חישוב</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={s.shippingType === 'fixed'} onChange={() => set('shippingType', 'fixed')} />
              <span className="text-[14px]">סכום קבוע (₪)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={s.shippingType === 'percent'} onChange={() => set('shippingType', 'percent')} />
              <span className="text-[14px]">אחוז מהמוצרים (%)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">
            {s.shippingType === 'percent' ? 'אחוז (%)' : 'סכום משלוח (₪)'}
          </label>
          <input type="number" value={s.shippingValue} onChange={e => set('shippingValue', e.target.value)} className="input w-full" />
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={s.freeShippingEnabled} onChange={e => set('freeShippingEnabled', e.target.checked)} />
            <span className="text-[14px] font-semibold text-slate-700">משלוח חינם מעל סכום מסוים</span>
          </label>
          {s.freeShippingEnabled && (
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">סכום מינימום למשלוח חינם (₪)</label>
              <input type="number" value={s.freeShippingThreshold} onChange={e => set('freeShippingThreshold', e.target.value)} className="input w-full" />
              <p className="text-[11px] text-slate-400 mt-1">הזמנות בסכום זה ומעלה — משלוח חינם.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Infos boutique ── */}
      <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-800"><Store className="w-5 h-5 text-primary-600" />פרטי החנות</div>
        <div>
          <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">שם החנות</label>
          <input type="text" value={s.shopName} onChange={e => set('shopName', e.target.value)} className="input w-full" />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">אימייל ליצירת קשר</label>
          <input type="email" value={s.shopEmail} onChange={e => set('shopEmail', e.target.value)} className="input w-full" dir="ltr" />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">טלפון</label>
          <input type="tel" value={s.shopPhone} onChange={e => set('shopPhone', e.target.value)} className="input w-full" dir="ltr" />
        </div>
      </section>

      {/* ── Bannière promo ── */}
      <section className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <div className="flex items-center gap-2 font-bold text-slate-800"><Megaphone className="w-5 h-5 text-primary-600" />באנר פרסום עליון</div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={s.promoBanner?.enabled} onChange={e => setBanner('enabled', e.target.checked)} />
          <span className="text-[14px] font-semibold text-slate-700">הצג באנר בראש האתר</span>
        </label>
        {s.promoBanner?.enabled && (
          <div>
            <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">טקסט הבאנר</label>
            <input type="text" value={s.promoBanner?.text || ''} onChange={e => setBanner('text', e.target.value)} className="input w-full" placeholder="משלוח חינם מעל ₪500! 🚚" />
          </div>
        )}
      </section>

      <button onClick={save} disabled={saving} className="btn btn-primary w-full py-3 disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}שמור הגדרות
      </button>
    </div>
  )
}