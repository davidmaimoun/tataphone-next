'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import toast from 'react-hot-toast'
import Field from '@/components/common/Field'
import GoogleButton from '@/components/common/GoogleButton'

export default function LoginPage() {
  const { login } = useAuthStore()
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`ברוך הבא, ${user.name}! 👋`)
      router.push(user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      const data = err?.response?.data
      if (data?.requiresVerification) { toast.error('יש לאמת את האימייל לפני ההתחברות 📧'); setUnverifiedEmail(data.email || form.email) }
      else toast.error('אימייל או סיסמה שגויים')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background:'linear-gradient(135deg,var(--primary-pale) 0%,#F8FAFF 60%,#F0F9FF 100%)' }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/"><span className="font-rubik text-3xl font-black text-primary-600">טאטע</span><span className="font-rubik text-3xl font-black text-slate-800">פון</span></Link>
          <p className="text-slate-500 mt-2 text-[15px]">התחבר לחשבון שלך</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-8">
          <form onSubmit={submit} className="space-y-4 mb-5">
            <Field label="אימייל" icon={Mail} type="email" value={form.email} onChange={set('email')} required placeholder="your@email.com" />
            <Field label="סיסמה" icon={Lock} type="password" value={form.password} onChange={set('password')} required placeholder="••••••••" />
            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-[15px] justify-center mt-1"><LogIn className="w-4 h-4" />{loading ? 'מתחבר...' : 'התחבר'}</button>
            {unverifiedEmail && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                <p className="text-[13px] text-amber-700 mb-2">האימייל לא אומת עדיין</p>
                <button type="button" onClick={async () => { const { default: authService } = await import('@/services/authService'); await authService.resendVerification(unverifiedEmail); toast.success('אימייל נשלח מחדש! 📧') }} className="text-[13px] font-bold text-amber-700 underline">שלח קישור אימות מחדש</button>
              </div>
            )}
          </form>
          <div className="flex items-center gap-3 mb-4"><div className="flex-1 h-px bg-slate-100" /><span className="text-[13px] font-medium text-slate-400">או המשך עם</span><div className="flex-1 h-px bg-slate-100" /></div>
          <GoogleButton label="התחבר עם Google" />
          <p className="mt-6 text-center text-[14px] text-slate-400">אין לך חשבון?{' '}<Link href="/register" className="font-bold text-primary-600 hover:text-primary-700">הרשם כאן</Link></p>
        </div>
      </motion.div>
    </div>
  )
}
