'use client'
import { useState, useEffect } from 'react'
import { Upload, FileJson, FileSpreadsheet, Check, Download, Database, Info } from 'lucide-react'
import { productAdmin } from '@/services/productService'
import toast from 'react-hot-toast'


export default function AdminImport() {
  const [schema, setSchema] = useState(null)
  const [jsonText, setJsonText] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => { productAdmin.getImportSchema().then(setSchema).catch(() => {}) }, [])

  // Génère un exemple JSON basé sur le schéma (1 produit modèle)
  const buildExample = () => {
    if (!schema) return '[]'
    const obj = {}
    schema.fields.forEach(f => { if (f.example !== undefined) obj[f.key] = f.example })
    return JSON.stringify([obj], null, 2)
  }

  const downloadExample = () => {
    const blob = new Blob([buildExample()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'tataphone-import-example.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = async () => {
    let products
    try { products = JSON.parse(jsonText) } catch { return toast.error('JSON לא תקין') }
    if (!Array.isArray(products)) return toast.error('צריך מערך של מוצרים')
    setBusy(true)
    try { const r = await productAdmin.importJson(products); setResult(r); toast.success(`יובאו ${r.imported ?? products.length} מוצרים! 🎉`) }
    catch (e) { toast.error(e?.response?.data?.error || 'שגיאה בייבוא') } finally { setBusy(false) }
  }
  const importExcel = async (file) => {
    if (!file) return
    setBusy(true)
    try { const fd = new FormData(); fd.append('file', file); const r = await productAdmin.importExcel(fd); setResult(r); toast.success(`הקובץ יובא! ${r.imported ? `(${r.imported} מוצרים)` : ''} 🎉`) }
    catch (e) { toast.error(e?.response?.data?.error || 'שגיאה בייבוא') } finally { setBusy(false) }
  }

  const required = schema?.fields.filter(f => f.required) || []
  const optional = schema?.fields.filter(f => !f.required) || []


  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <h1 className="text-2xl font-black text-slate-900 mb-1">ייבוא מוצרים</h1>
      {schema && <p className="text-[13px] text-slate-400 mb-6">כרגע במאגר: <strong className="text-slate-600">{schema.totalProducts}</strong> מוצרים</p>}

      {/* ── Guide dynamique des champs ── */}
      {schema && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4"><Info className="w-5 h-5 text-primary-600" /><h2 className="font-bold text-slate-800">מבנה הקובץ — שדות נדרשים</h2></div>

          {/* Required */}
          <p className="text-[12px] font-black text-red-500 uppercase tracking-wide mb-2">חובה</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {required.map(f => (
              <div key={f.key} className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                <code className="text-[12px] font-mono font-bold text-red-700" dir="ltr">{f.key}</code>
                <span className="text-[11px] text-slate-500">{f.label} · {f.type}</span>
              </div>
            ))}
          </div>

          {/* Optional */}
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-wide mb-2">אופציונלי</p>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[13px]">
              <thead className="text-[11px] text-slate-400 uppercase">
                <tr><th className="py-2 px-2">שדה</th><th className="py-2 px-2">תיאור</th><th className="py-2 px-2">סוג</th><th className="py-2 px-2">דוגמה</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {optional.map(f => (
                  <tr key={f.key}>
                    <td className="py-2 px-2"><code className="font-mono font-bold text-slate-700" dir="ltr">{f.key}</code></td>
                    <td className="py-2 px-2 text-slate-500">{f.label}{f.note && <span className="block text-[11px] text-amber-600">⚠ {f.note}</span>}</td>
                    <td className="py-2 px-2"><span className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">{f.type}</span></td>
                    <td className="py-2 px-2 text-slate-400 font-mono text-[11px]" dir="ltr">{Array.isArray(f.example) || typeof f.example === 'object' ? JSON.stringify(f.example) : String(f.example ?? '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={downloadExample} className="mt-4 flex items-center gap-2 text-[13px] font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl transition-colors">
            <Download className="w-4 h-4" />הורד קובץ JSON לדוגמה
          </button>
        </div>
      )}

      {/* ── État de la DB (valeurs existantes à réutiliser) ── */}
      {schema && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-3"><Database className="w-4 h-4 text-slate-500" /><h3 className="font-bold text-[14px] text-slate-700">ערכים קיימים במאגר — מומלץ לעקביות</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[['קטגוריות', schema.existingCategories, '#CC785C'], ['מותגים', schema.existingBrands, '#7C3AED'], ['תגיות', schema.existingTags, '#059669']].map(([label, items, color]) => (
              <div key={label}>
                <p className="text-[12px] font-bold mb-1.5" style={{ color }}>{label} ({items.length})</p>
                <div className="flex flex-wrap gap-1">
                  {items.length ? items.map(i => <span key={i} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{i}</span>) : <span className="text-[11px] text-slate-300">—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Import zones ── */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-3"><FileSpreadsheet className="w-5 h-5 text-emerald-600" /><h2 className="font-bold text-slate-800">ייבוא מ-Excel</h2></div>
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-8 cursor-pointer hover:border-primary-300 transition-colors">
            <Upload className="w-8 h-8 text-slate-300" /><span className="text-[13px] text-slate-500">לחץ להעלאת קובץ .xlsx</span>
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={e => importExcel(e.target.files[0])} disabled={busy} />
          </label>
          <p className="text-[11px] text-slate-400 mt-2">השורה הראשונה = שמות העמודות (לפי השדות למעלה)</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-3"><FileJson className="w-5 h-5 text-primary-600" /><h2 className="font-bold text-slate-800">ייבוא מ-JSON</h2></div>
          <textarea value={jsonText} onChange={e => setJsonText(e.target.value)} rows={8} dir="ltr" placeholder={schema ? buildExample() : '[{"name":"...","price":100}]'} className="input font-mono text-[12px] resize-none w-full mb-3" />
          <button onClick={importJson} disabled={busy || !jsonText.trim()} className="btn btn-primary px-6 py-2.5">{busy ? 'מייבא...' : 'ייבא JSON'}</button>
        </div>

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-green-700 mb-1"><Check className="w-5 h-5" /><span className="text-[14px] font-bold">הייבוא הושלם — {result.imported} מוצרים נוספו</span></div>
            {result.errors?.length > 0 && <p className="text-[12px] text-amber-600">{result.errors.length} שגיאות (שורות שדולגו)</p>}
          </div>
        )}
      </div>
    </div>
  )
}