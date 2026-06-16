'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Lock, UserPlus, CheckCircle2, RefreshCw } from 'lucide-react'
import authService from '@/services/authService'
import toast from 'react-hot-toast'
import Field from '@/components/common/Field'
import GoogleButton from '@/components/common/GoogleButton'

const FIELDS = [
  { k:'name',     l:'שם מלא', t:'text',     icon:User,  ph:'ישראל ישראלי' },
  { k:'email',    l:'אימייל', t:'email',    icon:Mail,  ph:'your@email.com' },
  { k:'phone',    l:'טלפון',  t:'tel',      icon:Phone, ph:'050-0000000' },
  { k:'password', l:'סיסמה',  t:'password', icon:Lock,  ph:'לפחות 6 תווים' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form')
  const [resending, setResending] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authService.register(form)
      if (res.requiresVerification) setStep('verify')
      else { toast.success('ברוך הבא לטאטעפון! 🎉'); router.push('/') }
    } catch (err) { toast.error(err?.response?.data?.error || 'שגיאה — ייתכן שהאימייל כבר קיים') }
    finally { setLoading(false) }
  }

  const resend = async () => {
    setResending(true)
    try { await authService.resendVerification(form.email); toast.success('אימייל נשלח מחדש! 📧') }
    catch { toast.error('שגיאה') } finally { setResending(false) }
  }

  if (step === 'verify') return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background:'linear-gradient(135deg,var(--primary-pale) 0%,#F8FAFF 60%,#F0F9FF 100%)' }}>
      <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} className="w-full max-w-md text-center">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-10">
          <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-10 h-10 text-primary-500" /></div>
          <h2 className="font-black text-2xl text-slate-900 mb-3">בדוק את האימייל שלך 📧</h2>
          <p className="text-[15px] text-slate-500 leading-7 mb-2">שלחנו קישור אימות ל:</p>
          <p className="font-bold text-primary-600 text-[15px] mb-6">{form.email}</p>
          <p className="text-[13px] text-slate-400 mb-6">לחץ על הקישור באימייל להשלמת ההרשמה.<br />הקישור תקף ל-24 שעות.</p>
          <button onClick={resend} disabled={resending} className="flex items-center gap-2 mx-auto text-[13px] font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-5 py-2.5 rounded-xl transition-colors">
            <RefreshCw className={`w-4 h-4 ${resending?'animate-spin':''}`} />{resending ? 'שולח...' : 'שלח מחדש'}
          </button>
          <p className="mt-6 text-[13px] text-slate-400"><Link href="/login" className="font-bold text-primary-600 hover:text-primary-700">חזור להתחברות</Link></p>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background:'linear-gradient(135deg,var(--primary-pale) 0%,#F8FAFF 60%,#F0F9FF 100%)' }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><span className="font-rubik text-3xl font-black text-primary-600">טאטע</span><span className="font-rubik text-3xl font-black text-slate-800">פון</span></Link>
          <p className="text-slate-500 mt-2 text-[15px]">צור חשבון חדש</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-8">
          <form onSubmit={submit} className="space-y-4 mb-6">
            {FIELDS.map(({ k, l, t, icon, ph }) => <Field key={k} label={l} icon={icon} type={t} value={form[k]} onChange={set(k)} required placeholder={ph} />)}
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-[15px] justify-center mt-1"><UserPlus className="w-4 h-4" />{loading ? 'רושם...' : 'הרשם'}</button>
          </form>
          <div className="flex items-center gap-3 mb-4 mt-2"><div className="flex-1 h-px bg-slate-100" /><span className="text-[13px] font-medium text-slate-400">או המשך עם</span><div className="flex-1 h-px bg-slate-100" /></div>
          <GoogleButton label="הרשם עם Google" />
          <p className="mt-6 text-center text-[14px] text-slate-400">יש לך חשבון?{' '}<Link href="/login" className="font-bold text-primary-600 hover:text-primary-700">התחבר כאן</Link></p>
        </div>
      </motion.div>
    </div>
  )
}
