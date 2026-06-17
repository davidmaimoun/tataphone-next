'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, User, Mail, Phone, MessageSquare, FlaskConical, Check, ShieldCheck } from 'lucide-react'
import useCartStore from '@/stores/cartStore'
import useAuthStore from '@/stores/authStore'
import PaymentSection from '@/components/checkout/PaymentSection'
import Field from '@/components/common/Field'
import orderService from '@/services/orderService'
import toast from 'react-hot-toast'

const VAT_RATE = 0.18
const TEST_DATA = { firstName:'David', lastName:'Maimoun', email:'davidmaimoun@hotmail.com', phone:'0501234567', address:'רחוב הרצל 12', city:'תל אביב', notes:'Test' }

function validatePhone(phone) { const d = phone.replace(/\D/g, ''); return d.length >= 9 && d.length <= 10 }

export default function CheckoutPage() {
  const items = useCartStore(s => s.items)
  const clearCart = useCartStore(s => s.clearCart)
  const user = useAuthStore(s => s.user)
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [testing, setTesting] = useState(false)
  const [form, setForm] = useState({
    firstName: user?.name?.split(' ')[0] || '', lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '', phone:'', address:'', city:'', notes:'',
  })
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  // Simule une commande complète : remplit le form + crée une vraie commande (isTest) + redirige
  const runTestOrder = async () => {
    setTesting(true)
    setForm(TEST_DATA)
    try {
      await orderService.create({
        customer: TEST_DATA,
        items: items.map(i => ({ product: i._id, qty: i.qty, price: i.price, name: i.name })),
        subtotal, vat: vatAmount, total: totalTTC,
        paymentMethod: 'test', paymentStatus: 'paid',
      })
      toast.success('✅ הזמנת בדיקה נוצרה! בדוק בפאנל ניהול')
      clearCart()
      router.push('/order-success')
    } catch (e) {
      toast.error('שגיאה ביצירת הזמנת בדיקה')
    } finally { setTesting(false) }
  }

  const totalTTC = items.reduce((s, i) => s + i.price * i.qty, 0)
  const subtotal = Math.round(totalTTC / (1 + VAT_RATE))
  const vatAmount = totalTTC - subtotal

  const handlePaymentSuccess = async () => { clearCart(); router.push('/order-success') }

  if (items.length === 0) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-slate-500">העגלה ריקה</p>
      <button onClick={() => router.push('/products')} className="btn btn-primary px-6 py-3">לחנות ←</button>
    </div>
  )

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-black text-2xl text-slate-900">פרטי הזמנה</h1>
        <button onClick={runTestOrder} disabled={testing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"><FlaskConical className="w-3.5 h-3.5" />{testing ? 'יוצר...' : 'הזמנת בדיקה'}</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {!user && <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 text-[13px] text-primary-700 font-medium">💡 ניתן לרכוש גם בלי חשבון</div>}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <h2 className="font-bold text-slate-800 text-[16px]">פרטים אישיים</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="שם פרטי" icon={User} type="text" value={form.firstName} onChange={set('firstName')} required placeholder="ישראל" />
              <Field label="שם משפחה" type="text" value={form.lastName} onChange={set('lastName')} required placeholder="ישראלי" />
            </div>
            <Field label="אימייל" icon={Mail} type="email" value={form.email} onChange={set('email')} required placeholder="your@email.com" />
            <div>
              <Field label="טלפון" icon={Phone} type="tel" value={form.phone} onChange={set('phone')} required placeholder="050-0000000" />
              <p className="text-[11px] text-slate-400 mt-1">9-10 ספרות (כולל קידומת)</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <h2 className="font-bold text-slate-800 text-[16px]">כתובת למשלוח</h2>
            <Field label="כתובת" icon={MapPin} type="text" value={form.address} onChange={set('address')} required placeholder="רחוב הרצל 12" />
            <Field label="עיר" type="text" value={form.city} onChange={set('city')} required placeholder="תל אביב" />
            <div>
              <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">הערות</label>
              <div className="relative">
                <MessageSquare className="absolute top-3.5 right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <textarea value={form.notes} onChange={set('notes')} rows={3} dir="rtl" placeholder="הערות אופציונליות..." className="input pr-10 resize-none w-full" style={{minHeight:80}} />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
            <h2 className="font-black text-[16px] text-slate-800 mb-4">סיכום הזמנה</h2>
            <div className="space-y-2 mb-4">
              {items.map(i => <div key={i._id} className="flex justify-between text-[12px]"><span className="text-slate-500 flex-1 line-clamp-1">{i.name} ×{i.qty}</span><span className="font-semibold mr-2">₪{(i.price*i.qty).toLocaleString()}</span></div>)}
            </div>
            <div className="border-t border-slate-100 pt-3 space-y-1.5 mb-4">
              <div className="flex justify-between text-[12px] text-slate-500"><span>לפני מע"מ</span><span>₪{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-[12px] text-slate-500"><span>מע"מ 18%</span><span>₪{vatAmount.toLocaleString()}</span></div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100"><span className="font-black text-[15px] text-slate-800">סה"כ</span><span className="price-num text-primary-600" style={{fontSize:22}}>₪{totalTTC.toLocaleString()}</span></div>
            </div>
            <PaymentSection form={form} totalTTC={totalTTC} vatAmount={vatAmount} subtotal={subtotal} items={items} agreed={agreed} validatePhone={validatePhone} onSuccess={handlePaymentSuccess} />
          </div>
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
            <label className="flex gap-3 cursor-pointer">
              <div className="flex-shrink-0 mt-0.5">
                <div onClick={() => setAgreed(v => !v)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${agreed ? 'bg-primary-600 border-primary-600' : 'border-slate-300 bg-white'}`}>{agreed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}</div>
              </div>
              <p className="text-[11.5px] text-slate-600 leading-relaxed">קראתי והסכמתי ל<a href="/terms" className="text-primary-600 underline mx-0.5">תנאי שימוש</a> ול<a href="/privacy" className="text-primary-600 underline">מדיניות הפרטיות</a>. הפרטים יישמרו לצורך טיפול בהזמנה ומתן שירות.</p>
            </label>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400"><ShieldCheck className="w-3.5 h-3.5 text-green-500" />תשלום מאובטח · SSL מוצפן</div>
        </div>
      </div>
    </div>
  )
}
