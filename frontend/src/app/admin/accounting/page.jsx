'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, Package, Wallet, Receipt, ChevronDown, ChevronUp } from 'lucide-react'
import orderService from '@/services/orderService'
import { ORDER_STATUSES, statusLabel, statusStyle, normalizeStatus, fmtDate } from '@/utils/orderStatus'
import toast from 'react-hot-toast'

function monthOptions() {
  const opts = []; const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    opts.push({ val: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, label: d.toLocaleDateString('he-IL', { month:'long', year:'numeric' }) })
  }
  return opts
}

export default function AdminAccounting() {
  const months = monthOptions()
  const [month, setMonth] = useState(months[0].val)
  const [includeTest, setIncludeTest] = useState(false)
  const [data, setData] = useState(null)       // rapport financier (completed only)
  const [orders, setOrders] = useState([])     // toutes les commandes (pour sections par statut)
  const [loading, setLoading] = useState(true)
  const [openStatus, setOpenStatus] = useState('completed')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      orderService.accounting(month, includeTest).then(setData).catch(() => toast.error('שגיאה בטעינת הדוח')),
      orderService.getAll().then(d => setOrders(d.orders || (Array.isArray(d)?d:[]))).catch(()=>{}),
    ]).finally(() => setLoading(false))
  }, [month, includeTest])

  // Filtre les commandes du mois sélectionné
  const monthOrders = orders.filter(o => {
    if (!o.createdAt) return false
    if (!includeTest && o.isTest) return false
    return String(o.createdAt).slice(0,7) === month
  })
  const ordersByStatus = ORDER_STATUSES.reduce((acc, s) => {
    acc[s] = monthOrders.filter(o => normalizeStatus(o.status) === s); return acc
  }, {})

  const KPIS = data ? [
    { label:'הכנסות (הושלמו)', value:`₪${data.revenue?.toLocaleString()}`, icon:TrendingUp, color:'#059669', sub:`${data.orderCount} הזמנות שהושלמו` },
    { label:'חוב לספק', value:`₪${data.supplierCost?.toLocaleString()}`, icon:Receipt, color:'#DC2626', sub:'עלות סחורה' },
    { label:'רווח נקי', value:`₪${data.profit?.toLocaleString()}`, icon:Wallet, color:'#CC785C', sub:'הכנסות − עלות' },
    { label:'מוצרים שנמכרו', value:data.products?.reduce((s,p)=>s+p.qty,0)||0, icon:Package, color:'#7C3AED', sub:`${data.products?.length||0} סוגים` },
  ] : []

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <h1 className="text-2xl font-black text-slate-900">חשבונאות וניהול</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 cursor-pointer">
            <input type="checkbox" checked={includeTest} onChange={e => setIncludeTest(e.target.checked)} className="accent-primary-600" />כלול הזמנות בדיקה
          </label>
          <div className="relative">
            <select value={month} onChange={e => setMonth(e.target.value)} className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-9 text-[13px] font-bold text-slate-700 cursor-pointer focus:outline-none focus:border-primary-400">
              {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>
            <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
      <p className="text-[13px] text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-6 inline-block">💡 הרווח מחושב רק מהזמנות בסטטוס "הושלם"</p>

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

          {/* Détail par produit (completed) */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-slate-100"><h2 className="font-black text-slate-800">פירוט רווח לפי מוצר (הושלמו)</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-right min-w-[600px]">
                <thead className="bg-slate-50 text-[12px] font-bold text-slate-500 uppercase">
                  <tr><th className="px-4 py-3">מוצר</th><th className="px-4 py-3">נמכרו</th><th className="px-4 py-3">הכנסה</th><th className="px-4 py-3">עלות ספק</th><th className="px-4 py-3">רווח</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.products.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">אין מכירות שהושלמו בחודש זה</td></tr>
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

          {/* Sections déroulantes par statut (point 3) */}
          <h2 className="font-black text-slate-800 mb-3">הזמנות לפי סטטוס — {months.find(m=>m.val===month)?.label}</h2>
          <div className="space-y-2">
            {ORDER_STATUSES.map(s => {
              const list = ordersByStatus[s]
              const st = statusStyle(s)
              const sum = list.reduce((acc,o)=>acc+(o.total||0),0)
              return (
                <div key={s} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <button onClick={() => setOpenStatus(openStatus===s?null:s)} className="w-full flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-bold px-2.5 py-1 rounded-full" style={{ background:st.bg, color:st.color }}>{statusLabel(s)}</span>
                      <span className="text-[13px] text-slate-500">{list.length} הזמנות · ₪{sum.toLocaleString()}</span>
                    </div>
                    {openStatus===s ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openStatus===s && (
                    <div className="border-t border-slate-50 divide-y divide-slate-50">
                      {list.length === 0 ? <p className="px-5 py-4 text-[13px] text-slate-400">אין הזמנות בסטטוס זה</p>
                       : list.map(o => (
                        <div key={o._id} className="px-5 py-3 flex items-center justify-between text-[13px]">
                          <div><span className="font-mono text-slate-400 text-[11px]">#{o._id?.slice(-6).toUpperCase()}</span><span className="font-semibold text-slate-700 mr-2">{o.customer?.firstName} {o.customer?.lastName}</span></div>
                          <div className="flex items-center gap-3"><span className="text-slate-400 text-[11px]">{fmtDate(o.createdAt)}</span><span className="font-bold text-primary-600">₪{o.total?.toLocaleString()}</span></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-[12px] text-slate-400 mt-3">💡 "נמכרו" = הכמות להפחית מהמלאי. רק "הושלם" נכלל ברווח.</p>
        </>
      )}
    </div>
  )
}
