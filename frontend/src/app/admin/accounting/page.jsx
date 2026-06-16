'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, Package, Wallet, Receipt, ChevronDown } from 'lucide-react'
import orderService from '@/services/orderService'
import toast from 'react-hot-toast'

function monthOptions() {
  const opts = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })
    opts.push({ val, label })
  }
  return opts
}

export default function AdminAccounting() {
  const months = monthOptions()
  const [month, setMonth] = useState(months[0].val)
  const [includeTest, setIncludeTest] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    orderService.accounting(month, includeTest)
      .then(setData)
      .catch(() => toast.error('שגיאה בטעינת הדוח'))
      .finally(() => setLoading(false))
  }, [month, includeTest])

  const KPIS = data ? [
    { label:'הכנסות', value:`₪${data.revenue?.toLocaleString()}`, icon:TrendingUp, color:'#059669', sub:`${data.orderCount} הזמנות` },
    { label:'חוב לספק', value:`₪${data.supplierCost?.toLocaleString()}`, icon:Receipt, color:'#DC2626', sub:'עלות סחורה' },
    { label:'רווח נקי', value:`₪${data.profit?.toLocaleString()}`, icon:Wallet, color:'#CC785C', sub:'הכנסות − עלות' },
    { label:'מוצרים שנמכרו', value:data.products?.reduce((s,p)=>s+p.qty,0) || 0, icon:Package, color:'#7C3AED', sub:`${data.products?.length||0} סוגים` },
  ] : []

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-black text-slate-900">חשבונאות וניהול</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 cursor-pointer">
            <input type="checkbox" checked={includeTest} onChange={e => setIncludeTest(e.target.checked)} className="accent-primary-600" />
            כלול הזמנות בדיקה
          </label>
          <div className="relative">
            <select value={month} onChange={e => setMonth(e.target.value)} className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-9 text-[13px] font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-primary-400">
              {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>
            <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? <p className="text-slate-400">טוען...</p> : !data ? <p className="text-slate-400">אין נתונים</p> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {KPIS.map(({ label, value, icon:Icon, color, sub }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background:`${color}15` }}><Icon className="w-5 h-5" style={{ color }} /></div>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-[13px] text-slate-400">{label}</p>
                <p className="text-[11px] text-slate-300 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100"><h2 className="font-black text-slate-800">פירוט לפי מוצר</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-right min-w-[600px]">
                <thead className="bg-slate-50 text-[12px] font-bold text-slate-500 uppercase">
                  <tr><th className="px-4 py-3">מוצר</th><th className="px-4 py-3">נמכרו</th><th className="px-4 py-3">הכנסה</th><th className="px-4 py-3">עלות ספק</th><th className="px-4 py-3">רווח</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.products.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">אין מכירות בחודש זה</td></tr>
                   : data.products.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-800 text-[14px]">{p.name}</td>
                      <td className="px-4 py-3"><span className="font-bold text-primary-600">{p.qty}</span></td>
                      <td className="px-4 py-3 text-[14px]">₪{p.revenue?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[14px] text-red-500">₪{p.supplierCost?.toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-[14px] text-green-600">₪{p.profit?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[12px] text-slate-400 mt-3">💡 "נמכרו" = הכמות להפחית מהמלאי. "עלות ספק" = מה שצריך לשלם לספק.</p>
        </>
      )}
    </div>
  )
}
