'use client'
import { useEffect, useState } from 'react'
import api from '@/services/api'
import toast from 'react-hot-toast'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/')
      .then(d => setOrders(Array.isArray(d) ? d : (d.orders || [])))
      .catch(() => toast.error('שגיאה בטעינת הזמנות'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-black text-slate-900 mb-6">הזמנות ({orders.length})</h1>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-[12px] font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">מספר</th>
              <th className="px-4 py-3">לקוח</th>
              <th className="px-4 py-3">סכום</th>
              <th className="px-4 py-3 hidden sm:table-cell">סטטוס</th>
              <th className="px-4 py-3 hidden md:table-cell">תאריך</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">טוען...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">אין הזמנות עדיין</td></tr>
            ) : orders.map(o => (
              <tr key={o._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-[12px]">{o._id?.slice(-6)}</td>
                <td className="px-4 py-3 text-[14px]">{o.customerName || o.email || '—'}</td>
                <td className="px-4 py-3 font-bold">₪{o.total?.toLocaleString() || '—'}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-[12px] px-2 py-1 rounded-full bg-slate-100">{o.status || 'pending'}</span>
                </td>
                <td className="px-4 py-3 text-[13px] text-slate-400 hidden md:table-cell">
                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString('he-IL') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
