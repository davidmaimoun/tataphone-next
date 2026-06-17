'use client'
import { useState, useEffect } from 'react'
import { Mail, Search } from 'lucide-react'
import orderService from '@/services/orderService'
import useAuthStore from '@/stores/authStore'
import toast from 'react-hot-toast'
import { ORDER_STATUSES, statusLabel, statusStyle, normalizeStatus, fmtDate } from '@/utils/orderStatus'

export default function AdminOrders() {
  const logout = useAuthStore(s => s.logout)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [sendingInvoice, setSendingInvoice] = useState(null)

  useEffect(() => {
    orderService.getAll()
      .then(d => { setOrders(d.orders || (Array.isArray(d) ? d : [])); setError(null) })
      .catch(err => {
        const status = err?.response?.status
        if (status === 401 || status === 422) { logout(); window.location.href = '/login' }
        else { setError('שגיאה בטעינת הזמנות'); toast.error('שגיאה בטעינת הזמנות') }
      })
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await orderService.updateStatus(id, status)   // status = clé EN
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o))
      toast.success('סטטוס עודכן')
    } catch { toast.error('שגיאה בעדכון סטטוס') }
  }
  const sendInvoice = async (id) => {
    setSendingInvoice(id)
    try { await orderService.sendInvoice(id); toast.success('חשבונית נשלחה! 📧') }
    catch { toast.error('שגיאה') } finally { setSendingInvoice(null) }
  }

  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    const c = o.customer || {}
    const matchSearch = !q || `${c.firstName||''} ${c.lastName||''}`.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) || c.phone?.includes(q) || o._id?.includes(q)
    return matchSearch && (filterStatus === 'all' || normalizeStatus(o.status) === filterStatus)
  })
  const totalRev = orders.filter(o => normalizeStatus(o.status) !== 'cancelled').reduce((s,o) => s + (o.total||0), 0)

  if (error) return <div className="p-8 text-center text-slate-400"><p className="text-5xl mb-4">⚠️</p><p className="font-semibold">{error}</p></div>

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 mb-1">הזמנות</h1>
        <p className="text-sm text-slate-400">{orders.length} הזמנות · הכנסות: ₪{totalRev.toLocaleString()}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pr-10" placeholder="חיפוש לקוח, אימייל..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[{k:'all',l:'הכל'}, ...ORDER_STATUSES.map(s=>({k:s,l:statusLabel(s)}))].map(({ k, l }) => (
            <button key={k} onClick={() => setFilterStatus(k)}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all ${filterStatus===k ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead className="border-b border-slate-100 bg-slate-50/60">
            <tr>{['#','לקוח','פרטי קשר','פריטים','סכום','סטטוס','תאריך','פעולות'].map(h => (
              <th key={h} className="text-right py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wide">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {loading ? Array.from({length:5}).map((_,i) => (
              <tr key={i} className="border-b border-slate-50 animate-pulse">{Array.from({length:8}).map((_,j) => <td key={j} className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-20"/></td>)}</tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="py-16 text-center text-slate-400">לא נמצאו הזמנות</td></tr>
            ) : filtered.map(o => {
              const c = o.customer || {}
              const st = statusStyle(o.status)
              const cur = normalizeStatus(o.status)
              return (
                <>
                  <tr key={o._id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors cursor-pointer" onClick={() => setExpanded(expanded === o._id ? null : o._id)}>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{o._id?.slice(-6).toUpperCase()}{o.isTest && <span className="block text-[9px] text-amber-500 font-bold">TEST</span>}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{c.firstName} {c.lastName}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs"><p>{c.email}</p><p>{c.phone}</p></td>
                    <td className="py-3.5 px-4 text-slate-500">{o.items?.length} פריטים</td>
                    <td className="py-3.5 px-4 font-black text-primary-600">₪{o.total?.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <select value={cur} onClick={e=>e.stopPropagation()} onChange={e=>updateStatus(o._id,e.target.value)}
                        className="text-xs font-bold rounded-xl px-3 py-1.5 border-0 outline-none cursor-pointer" style={{ background:st.bg, color:st.color }}>
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">{fmtDate(o.createdAt, true)}</td>
                    <td className="py-3.5 px-4" onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>sendInvoice(o._id)} disabled={sendingInvoice===o._id} className="icon-btn w-8 h-8 disabled:opacity-50" title="שלח חשבונית">
                        {sendingInvoice===o._id
                          ? <svg className="animate-spin w-3.5 h-3.5 text-primary-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                          : <Mail className="w-3.5 h-3.5"/>}
                      </button>
                    </td>
                  </tr>
                  {expanded === o._id && (
                    <tr key={`${o._id}-exp`} className="bg-primary-50/40">
                      <td colSpan={8} className="px-8 py-3">
                        <p className="text-xs font-bold text-slate-500 mb-2">פירוט:</p>
                        <div className="flex flex-wrap gap-2">
                          {(o.items||[]).map((item,i) => (
                            <div key={i} className="bg-white rounded-xl px-3 py-2 text-xs border border-slate-100">
                              <span className="font-semibold">{item.name||item.product}</span>
                              <span className="text-slate-400 mr-2">×{item.qty}</span>
                              <span className="text-primary-600 font-bold mr-1">₪{(item.price*item.qty).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        {c.address && <p className="text-xs text-slate-400 mt-2">📍 {c.address}, {c.city}</p>}
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
