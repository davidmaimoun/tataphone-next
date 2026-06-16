'use client'
import { Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import { jwtDecode } from 'jwt-decode'
import toast from 'react-hot-toast'

function GoogleInner() {
  const params = useSearchParams()
  const router = useRouter()
  useEffect(() => {
    const token = params.get('token')
    const error = params.get('error')
    if (error) {
      const msgs = { google_cancelled:'ההתחברות בוטלה', invalid_state:'שגיאת אבטחה — נסה שוב', token_exchange_failed:'שגיאה בהתחברות עם Google', invalid_token:'טוקן לא תקין' }
      toast.error(msgs[error] || 'שגיאה בהתחברות'); router.push('/login'); return
    }
    if (!token) { router.push('/login'); return }
    try {
      const decoded = jwtDecode(token)
      const user = { id: decoded.sub, name: decoded.name || '', email: decoded.email || '', role: decoded.role || 'user' }
      useAuthStore.setState({ token, user })
      toast.success(`ברוך הבא, ${user.name}! 👋`)
      router.push(user.role === 'admin' ? '/admin' : '/')
    } catch { toast.error('שגיאה בעיבוד הטוקן'); router.push('/login') }
  }, [])
  return (
    <div className="min-h-screen flex items-center justify-center"><div className="text-center"><Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-3" /><p className="text-slate-500 font-medium">מתחבר עם Google...</p></div></div>
  )
}

export default function GoogleAuthSuccessPage() { return <Suspense><GoogleInner /></Suspense> }
