'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Tag, Upload, Mail, Home, Wallet } from 'lucide-react'
import useAuthStore from '@/stores/authStore'

const NAV = [
  { href: '/admin',          label: 'דאשבורד',  icon: LayoutDashboard },
  { href: '/admin/products', label: 'מוצרים',    icon: Package },
  { href: '/admin/orders',   label: 'הזמנות',    icon: ShoppingBag },
  { href: '/admin/accounting', label: 'חשבונאות', icon: Wallet },
  { href: '/admin/users',    label: 'משתמשים',   icon: Users },
  { href: '/admin/promotions', label: 'מבצעים',   icon: Tag },
  { href: '/admin/messages', label: 'הודעות',     icon: Mail },
  { href: '/admin/import',   label: 'ייבוא',       icon: Upload },
]

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { token, user, logout } = useAuthStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    useAuthStore.getState().init?.()
    // Protège : pas de token ou pas admin → login
    const st = useAuthStore.getState()
    if (!st.token || st.user?.role !== 'admin') {
      router.replace('/login')
    } else {
      setReady(true)
    }
  }, [token, user, router])

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">בודק הרשאות...</div>
  }

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col">
        <Link href="/" className="block p-5 border-b border-white/10 hover:bg-white/5 transition-colors">
          <p className="font-black text-white text-lg">טאטעפון</p>
          <p className="text-xs text-slate-500">פאנל ניהול</p>
        </Link>
        <Link href="/" className="mx-3 mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-primary-300 bg-primary-500/10 hover:bg-primary-500/20 transition-colors">
          <Home className="w-4 h-4" />חזרה לאתר
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold transition-colors ${active ? 'bg-primary-600 text-white' : 'hover:bg-white/5'}`}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <p className="text-xs text-slate-500 px-3 mb-2">{user?.email}</p>
          <button onClick={() => { logout(); router.push('/login') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-semibold text-red-300 hover:bg-red-500/10 w-full">
            <LogOut className="w-4 h-4" />התנתק
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-slate-50 overflow-auto">
        {children}
      </main>
    </div>
  )
}
