'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut } from 'lucide-react'
import useAuthStore from '@/stores/authStore'

const NAV = [
  { href: '/admin',          label: 'דאשבורד',  icon: LayoutDashboard },
  { href: '/admin/products', label: 'מוצרים',    icon: Package },
  { href: '/admin/orders',   label: 'הזמנות',    icon: ShoppingBag },
  { href: '/admin/users',    label: 'משתמשים',   icon: Users },
]

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { token, user, logout } = useAuthStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Protège : pas de token ou pas admin → login
    if (!token || user?.role !== 'admin') {
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
        <div className="p-5 border-b border-white/10">
          <p className="font-black text-white text-lg">טאטעפון</p>
          <p className="text-xs text-slate-500">פאנל ניהול</p>
        </div>
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
