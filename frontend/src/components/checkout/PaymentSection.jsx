'use client'
import { useState } from 'react'
import { CreditCard, Loader2, FlaskConical } from 'lucide-react'
import api from '@/services/api'
import orderService from '@/services/orderService'
import toast from 'react-hot-toast'

const IS_TEST = process.env.NEXT_PUBLIC_TEST_MODE === 'true'

export default function PaymentSection({ form, totalTTC, subtotal, vatAmount, items, agreed, validatePhone, onSuccess }) {
  const [loading, setLoading] = useState(null)

  const validate = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.address || !form.city) { toast.error('יש למלא את כל השדות'); return false }
    if (!validatePhone(form.phone)) { toast.error('מספר טלפון לא תקין'); return false }
    if (!agreed) { toast.error('יש לאשר את תנאי השימוש'); return false }
    return true
  }

  const createOrder = async (paymentMethod) => orderService.create({
    customer: form,
    items: items.map(i => ({ product: i._id, qty: i.qty, price: i.price, name: i.name })),
    subtotal, vat: vatAmount, total: totalTTC, paymentMethod, paymentStatus: 'paid',
  })

  const handlePayPal = async () => {
    if (!validate()) return
    setLoading('paypal')
    try {
      sessionStorage.setItem('pending_order', JSON.stringify({ form, totalTTC, subtotal, vatAmount, items }))
      const { data } = await api.post('/orders/paypal/create', { amount: totalTTC, returnUrl: `${window.location.origin}/order-success?payment=paypal`, cancelUrl: `${window.location.origin}/checkout` })
      if (data.approvalUrl) window.location.href = data.approvalUrl
      else toast.error('שגיאה ביצירת תשלום PayPal')
    } catch { toast.error('שגיאה בחיבור ל-PayPal') } finally { setLoading(null) }
  }

  const handlePayPlus = async () => {
    if (!validate()) return
    setLoading('payplus')
    try {
      sessionStorage.setItem('pending_order', JSON.stringify({ form, totalTTC, subtotal, vatAmount, items }))
      const { data } = await api.post('/orders/payplus/create', { amount: totalTTC, customer: form, returnUrl: `${window.location.origin}/order-success?payment=payplus` })
      if (data.paymentUrl) window.location.href = data.paymentUrl
      else toast.error('שגיאה ביצירת דף תשלום')
    } catch { toast.error('שגיאה בחיבור ל-PayPlus') } finally { setLoading(null) }
  }

  const handleTest = async () => {
    if (!validate()) return
    setLoading('test')
    try { await new Promise(r => setTimeout(r, 1000)); await createOrder('test'); toast.success('✅ תשלום בדיקה הצליח!'); onSuccess() }
    catch { toast.error('שגיאה') } finally { setLoading(null) }
  }

  const Spin = ({ col }) => <Loader2 className="w-4 h-4 animate-spin" style={col?{color:col}:{}} />

  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">בחר אמצעי תשלום</p>
      <button onClick={handlePayPal} disabled={!!loading} type="button" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[14px] transition-all hover:opacity-90 hover:shadow-md disabled:opacity-40" style={{ background:'#FFC439', color:'#003087' }}>
        {loading==='paypal' ? <Spin col="#003087" /> : <><svg viewBox="0 0 24 24" className="h-4 w-4" fill="#003087"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z"/></svg>PayPal</>}
      </button>
      <button onClick={handlePayPlus} disabled={!!loading} type="button" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[14px] text-white transition-all hover:opacity-90 hover:shadow-md disabled:opacity-40" style={{ background:'linear-gradient(135deg,#1A56DB,#1E3A8A)' }}>
        {loading==='payplus' ? <Spin /> : <><CreditCard className="w-4 h-4" />תשלום מאובטח בכרטיס אשראי</>}
      </button>
      {IS_TEST && (
        <button onClick={handleTest} disabled={!!loading} type="button" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[12px] bg-amber-50 border-2 border-dashed border-amber-300 text-amber-700 hover:bg-amber-100 transition-all disabled:opacity-40">
          {loading==='test' ? <Spin col="#B45309" /> : <><FlaskConical className="w-3.5 h-3.5" />בדיקה — ללא תשלום</>}
        </button>
      )}
    </div>
  )
}
