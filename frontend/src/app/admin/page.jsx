'use client'
import { useState, useEffect } from 'react'
import { TrendingUp, ShoppingBag, DollarSign, BarChart2, RefreshCw, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import api from '@/services/api'
import orderService from '@/services/orderService'
import { normalizeStatus, statusLabel, fmtDate } from '@/utils/orderStatus'

const RANGES = [{ label:'7 ימים', days:7 }, { label:'30 ימים', days:30 }, { label:'90 ימים', days:90 }, { label:'שנה', days:365 }]

function StatCard({ icon:Icon, label, value, sub, color, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{background:bg}}><Icon className="w-5 h-5" style={{color}}/></div>
      <div><p className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">{label}</p><p className="font-black text-2xl text-slate-900">{value}</p>{sub && <p className="text-[12px] text-slate-500 mt-0.5">{sub}</p>}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-lg p-3 text-[12px]">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      {payload.map(p => <p key={p.dataKey} style={{color:p.color}} className="font-semibold">{p.name}: {p.dataKey === 'revenue' ? `₪${p.value?.toLocaleString()}` : p.value}</p>)}
    </div>
  )
}

export default function AdminDashboard() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    Promise.all([
      api.get(`/users/analytics/stats?days=${days}`).then(r => setData(r.data)).catch(()=>{}),
      orderService.getAll().then(d => setOrders(d.orders || (Array.isArray(d)?d:[]))).catch(()=>{}),
    ]).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [days])

  const totals = data?.totals || {}
  const daily = (data?.daily || []).map(d => ({ ...d, dateLabel: fmtDate(d.date) }))

  // Répartition par statut de commande (le point 4)
  const byStatus = orders.reduce((acc, o) => { const s = normalizeStatus(o.status); acc[s] = (acc[s]||0)+1; return acc }, {})
  const STATUS_CARDS = [
    { key:'pending',   icon:Clock,        color:'#B45309', bg:'#FEF3C7' },
    { key:'approved',  icon:CheckCircle2, color:'#9D4B2E', bg:'#FAF3EF' },
    { key:'shipped',   icon:Truck,        color:'#6D28D9', bg:'#EDE9FE' },
    { key:'completed', icon:CheckCircle2, color:'#065F46', bg:'#D1FAE5' },
    { key:'cancelled', icon:XCircle,      color:'#B91C1C', bg:'#FEE2E2' },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-black text-slate-900 mb-1">לוח בקרה</h1><p className="text-sm text-slate-400">סטטיסטיקות ומגמות</p></div>
        <button onClick={load} className="icon-btn w-10 h-10" title="רענן"><RefreshCw className="w-4 h-4"/></button>
      </div>

      {/* Commandes par statut (point 4) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {STATUS_CARDS.map(({ key, icon:Icon, color, bg }) => (
          <div key={key} className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background:bg }}><Icon className="w-4 h-4" style={{ color }} /></div>
            <p className="text-2xl font-black text-slate-900">{byStatus[key] || 0}</p>
            <p className="text-[12px] text-slate-400">{statusLabel(key)}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {RANGES.map(r => (<button key={r.days} onClick={() => setDays(r.days)} className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all ${days===r.days?'bg-primary-600 text-white shadow-sm':'bg-white border border-slate-200 text-slate-600 hover:border-primary-300'}`}>{r.label}</button>))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={TrendingUp} label="ביקורים" value={loading?'...':totals.visits?.toLocaleString()||'0'} color="var(--primary-dark)" bg="var(--primary-pale)"/>
        <StatCard icon={ShoppingBag} label="הזמנות" value={loading?'...':totals.orders?.toLocaleString()||orders.length} color="#059669" bg="#F0FDF4"/>
        <StatCard icon={DollarSign} label="הכנסות" value={loading?'...':totals.revenue?`₪${Math.round(totals.revenue).toLocaleString()}`:'₪0'} color="#D97706" bg="#FFFBEB"/>
        <StatCard icon={BarChart2} label="המרה" value={loading?'...':totals.conversion?`${totals.conversion}%`:'0%'} sub={`מ-${totals.visits||0} ביקורים`} color="#7C3AED" bg="#F5F3FF"/>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-5 shadow-sm">
        <h2 className="font-black text-[16px] text-slate-900 mb-5">ביקורים לעומת הזמנות</h2>
        {loading ? <div className="animate-pulse bg-slate-100 rounded-xl h-52"/> : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={daily}>
              <defs>
                <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/><stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/></linearGradient>
                <linearGradient id="go" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#059669" stopOpacity={0.15}/><stop offset="95%" stopColor="#059669" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
              <XAxis dataKey="dateLabel" tick={{fontSize:11, fill:'#94A3B8'}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fontSize:11, fill:'#94A3B8'}} tickLine={false} axisLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Area type="monotone" dataKey="visits" name="ביקורים" stroke="var(--primary)" strokeWidth={2} fill="url(#gv)"/>
              <Area type="monotone" dataKey="orders" name="הזמנות" stroke="#059669" strokeWidth={2} fill="url(#go)"/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h2 className="font-black text-[16px] text-slate-900 mb-5">הכנסות יומיות (₪)</h2>
        {loading ? <div className="animate-pulse bg-slate-100 rounded-xl h-52"/> : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9"/>
              <XAxis dataKey="dateLabel" tick={{fontSize:11, fill:'#94A3B8'}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fontSize:11, fill:'#94A3B8'}} tickLine={false} axisLine={false} tickFormatter={v => `₪${v}`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="revenue" name="הכנסות" fill="#CC785C" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
