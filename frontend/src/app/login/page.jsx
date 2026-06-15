'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogIn, Mail, Lock } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import toast from 'react-hot-toast'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore(s => s.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'שגיאת התחברות')
      setAuth(data.token, data.user)
      toast.success(`שלום ${data.user.name || ''}! 👋`)
      // Admin → dashboard, sinon → accueil
      router.push(data.user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--primary-pale)' }}>
            <LogIn className="w-7 h-7" style={{ color: 'var(--primary)' }} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">התחברות</h1>
          <p className="text-slate-400 text-sm mt-1">היכנס לחשבון שלך</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[13px] font-bold text-slate-600 mb-1.5 block">אימייל</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                     dir="ltr" className="w-full border border-slate-200 rounded-xl py-3 pr-10 pl-3 text-[15px] outline-none focus:border-primary-400 transition-colors text-right" />
            </div>
          </div>
          <div>
            <label className="text-[13px] font-bold text-slate-600 mb-1.5 block">סיסמה</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                     dir="ltr" className="w-full border border-slate-200 rounded-xl py-3 pr-10 pl-3 text-[15px] outline-none focus:border-primary-400 transition-colors text-right" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 mt-2">
            {loading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>
      </div>
    </main>
  )
}
