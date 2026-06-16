'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import authService from '@/services/authService'
import toast from 'react-hot-toast'

function VerifyInner() {
  const params = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) { setStatus('error'); setError('קישור לא תקין'); return }
    authService.verifyEmail(token)
      .then(({ token: jwt, user }) => {
        useAuthStore.setState({ token: jwt, user })
        setStatus('success'); toast.success(`ברוך הבא, ${user.name}! 🎉`)
        setTimeout(() => router.push('/'), 2500)
      })
      .catch(err => { setStatus('error'); setError(err?.response?.data?.error || 'שגיאה באימות') })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background:'linear-gradient(135deg,var(--primary-pale) 0%,#F8FAFF 60%,#F0F9FF 100%)' }}>
      <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} className="w-full max-w-sm text-center">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-10">
          {status === 'loading' && <><Loader2 className="w-14 h-14 text-primary-500 animate-spin mx-auto mb-4" /><h2 className="font-black text-xl text-slate-800">מאמת את האימייל...</h2></>}
          {status === 'success' && <><motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring' }}><CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" /></motion.div><h2 className="font-black text-xl text-slate-900 mb-2">האימייל אומת בהצלחה! ✅</h2><p className="text-slate-400 text-[14px]">מועבר לדף הבית...</p></>}
          {status === 'error' && <><XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" /><h2 className="font-black text-xl text-slate-900 mb-2">שגיאה באימות</h2><p className="text-red-500 text-[14px] mb-6">{error}</p><Link href="/register"><button className="btn btn-primary px-8 py-2.5 text-[14px]">הרשם מחדש</button></Link></>}
        </div>
      </motion.div>
    </div>
  )
}

export default function VerifyEmailPage() { return <Suspense><VerifyInner /></Suspense> }
