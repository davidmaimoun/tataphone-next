'use client'
import { useEffect, useState } from 'react'
import { Package, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import api from '@/services/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/users/analytics/stats?range=30d')
      .then(r => setStats(r.data))
      .catch(() => setStats(null))
  }, [])

  const cards = [
    { label: 'ביקורים', value: stats?.visits ?? '—', icon: TrendingUp, color: '#2563EB' },
    { label: 'הזמנות', value: stats?.orders ?? '—', icon: ShoppingBag, color: '#059669' },
    { label: 'הכנסות', value: stats?.revenue ? `₪${stats.revenue.toLocaleString()}` : '—', icon: Package, color: '#D97706' },
    { label: 'משתמשים', value: stats?.users ?? '—', icon: Users, color: '#7C3AED' },
  ]

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-black text-slate-900 mb-6">דאשבורד</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}15` }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-[13px] text-slate-400">{label}</p>
          </div>
        ))}
      </div>
      <p className="text-slate-400 text-sm mt-6">
        ברוך הבא לפאנל הניהול. נהל מוצרים, הזמנות ומשתמשים מהתפריט בצד.
      </p>
    </div>
  )
}
