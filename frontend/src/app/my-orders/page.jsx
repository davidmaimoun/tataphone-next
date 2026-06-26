'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, ChevronDown, Calendar, CreditCard, Truck, MapPin, Download } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import orderService from '@/services/orderService'

// Statuts traduits en hébreu + couleur
const STATUS_CFG = {
  pending:   { label: 'ממתין לאישור', color: '#B45309', bg: '#FEF3C7' },
  approved:  { label: 'אושר',         color: '#059669', bg: '#D1FAE5' },
  shipped:   { label: 'נשלח',         color: '#2563EB', bg: '#DBEAFE' },
  completed: { label: 'הושלם',        color: '#7C3AED', bg: '#EDE9FE' },
  cancelled: { label: 'בוטל',         color: '#DC2626', bg: '#FEE2E2' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending
  return (
    <span className="text-[12px] px-3 py-1 rounded-full font-bold whitespace-nowrap" style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  )
}

function OrderCard({ order }) {
  const [open, setOpen] = useState(false)
  const items = order.items || []
  const itemCount = items.reduce((s, i) => s + (i.qty || 1), 0)
  const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  const oid = order._id?.slice(-6).toUpperCase()
  const isPaid = order.paymentStatus === 'paid' || order.paymentMethod === 'test'

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      {/* En-tête cliquable */}
      <button onClick={() => setOpen(v => !v)} className="w-full p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors text-right">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[12px] text-slate-400">#{oid}</span>
            <StatusBadge status={order.status || 'pending'} />
          </div>
          <p className="font-black text-slate-800 text-[17px]">₪{order.total?.toLocaleString()}</p>
          <div className="flex items-center gap-3 mt-1 text-[12px] text-slate-400">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{date}</span>
            <span className="flex items-center gap-1"><Package className="w-3 h-3" />{itemCount} פריטים</span>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Détails dépliables */}
      {open && (
        <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50/50">
          {/* Produits */}
          <div className="space-y-2">
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">מוצרים</p>
            {items.map((it, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-slate-100">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
                  {it.images?.[0] || it.image
                    ? <Image src={it.images?.[0] || it.image} alt={it.name || ''} fill sizes="48px" unoptimized className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">📱</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-[14px] line-clamp-1">{it.name || 'מוצר'}</p>
                  {it.variantLabel && <p className="text-[11px] text-slate-400">{it.variantLabel}</p>}
                  <p className="text-[12px] text-slate-500">כמות: {it.qty || 1}</p>
                </div>
                <p className="price-num text-[14px] font-bold whitespace-nowrap">₪{((it.price || 0) * (it.qty || 1)).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {/* Récap montants */}
          <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-1.5 text-[13px]">
            {order.subtotal != null && (
              <div className="flex justify-between text-slate-500"><span>סכום ביניים</span><span>₪{order.subtotal?.toLocaleString()}</span></div>
            )}
            {order.shipping != null && (
              <div className="flex justify-between text-slate-500">
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" />משלוח</span>
                <span>{order.shipping === 0 ? <span className="text-green-600 font-semibold">חינם</span> : `₪${order.shipping?.toLocaleString()}`}</span>
              </div>
            )}
            {order.vat != null && (
              <div className="flex justify-between text-slate-400 text-[12px]"><span>מתוכם מע״מ</span><span>₪{order.vat?.toLocaleString()}</span></div>
            )}
            <div className="flex justify-between font-black text-slate-800 pt-1.5 border-t border-slate-100 text-[15px]">
              <span>סה״כ</span><span className="price-num text-primary-600">₪{order.total?.toLocaleString()}</span>
            </div>
          </div>

          {/* Infos paiement + livraison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <p className="flex items-center gap-1.5 text-slate-400 mb-1"><CreditCard className="w-3.5 h-3.5" />תשלום</p>
              <p className="font-semibold text-slate-700">
                {order.paymentMethod === 'grow' ? 'כרטיס אשראי' : order.paymentMethod === 'paypal' ? 'PayPal' : order.paymentMethod === 'test' ? 'בדיקה' : '—'}
                {isPaid && <span className="text-green-600 mr-1">✓ שולם</span>}
              </p>
            </div>
            {(order.customer?.address || order.customer?.city) && (
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <p className="flex items-center gap-1.5 text-slate-400 mb-1"><MapPin className="w-3.5 h-3.5" />כתובת למשלוח</p>
                <p className="font-semibold text-slate-700 line-clamp-1">{[order.customer?.address, order.customer?.city].filter(Boolean).join(', ')}</p>
              </div>
            )}
          </div>

          {/* Télécharger la facture (si payé) */}
          {isPaid && (
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || ''}/orders/${order._id}/invoice-download`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary-50 border border-primary-200 text-primary-700 font-bold text-[13px] hover:bg-primary-100 transition-colors"
            >
              <Download className="w-4 h-4" />הורד חשבונית
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default function MyOrdersPage() {
  const user = useAuthStore(s => s.user)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    orderService.getMine()
      .then(d => setOrders(Array.isArray(d) ? d : (d.orders || [])))
      .catch(() => {})
      .finally(() => setLoading(false))
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
      {loading ? (
        <p className="text-slate-400">טוען...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-bold mb-1">אין הזמנות עדיין</p>
          <Link href="/products" className="text-primary-600 font-bold text-sm">התחל לקנות ←</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => <OrderCard key={o._id} order={o} />)}
        </div>
      )}
    </main>
  )
}