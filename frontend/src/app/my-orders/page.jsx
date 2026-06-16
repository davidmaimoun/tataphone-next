'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ChevronLeft } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import orderService from '@/services/orderService'

export default function MyOrdersPage() {
  const user = useAuthStore(s => s.user)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    orderService.getMine().then(d => setOrders(Array.isArray(d) ? d : (d.orders || []))).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  if (!user) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <Package className="w-12 h-12 text-slate-300" />
      <p className="text-slate-500">התחבר כדי לראות את ההזמנות שלך</p>
      <Link href="/login"><button className="btn btn-primary px-6 py-3">התחבר ←</button></Link>
    </div>
  )

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-6">ההזמנות שלי</h1>
      {loading ? <p className="text-slate-400">טוען...</p>
       : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-bold mb-1">אין הזמנות עדיין</p>
          <Link href="/products" className="text-primary-600 font-bold text-sm">התחל לקנות ←</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o._id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-[12px] text-slate-400">#{o._id?.slice(-6)}</p>
                <p className="font-bold text-slate-800">₪{o.total?.toLocaleString()}</p>
                <p className="text-[12px] text-slate-400">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('he-IL') : ''}</p>
              </div>
              <span className="text-[12px] px-3 py-1 rounded-full bg-slate-100 font-bold">{o.status || 'pending'}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
