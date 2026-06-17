'use client'
import { useState, useEffect } from 'react'
import { Users, Star, Trash2, Globe, UserX, UserCheck, Search } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'
import { fmtDate } from '@/utils/orderStatus'

function StarRow({ rating }) {
  return <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3" style={{fill: s<=rating?'#F59E0B':'#E2E8F0', color: s<=rating?'#F59E0B':'#E2E8F0'}}/>)}</div>
}

function ReviewsModal({ userId, userName, onClose }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get(`/users/${userId}/reviews`).then(r => setReviews(r.data.reviews || [])).catch(()=>{}).finally(() => setLoading(false)) }, [userId])
  const del = async (id) => { await api.delete(`/reviews/${id}`); setReviews(prev => prev.filter(r => r._id !== id)); toast.success('ביקורת נמחקה') }
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <h3 className="font-black text-lg text-slate-900 mb-4">ביקורות של {userName}</h3>
        {loading ? <div className="animate-pulse h-20 bg-slate-100 rounded-xl"/> :
         reviews.length === 0 ? <p className="text-slate-400 text-center py-8">אין ביקורות</p> : (
          <div className="overflow-y-auto space-y-3">
            {reviews.map(r => (
              <div key={r._id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex items-start justify-between mb-2">
                  <div><StarRow rating={r.rating}/>{r.title && <p className="font-bold text-[13px] text-slate-800 mt-1">{r.title}</p>}</div>
                  <button onClick={() => del(r._id)} className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center flex-shrink-0"><Trash2 className="w-3.5 h-3.5 text-red-500"/></button>
                </div>
                <p className="text-[13px] text-slate-600">{r.body}</p>
                <p className="text-[11px] text-slate-400 mt-2">{fmtDate(r.createdAt, true)}</p>
              </div>
            ))}
          </div>
        )}
        <button onClick={onClose} className="mt-4 btn btn-ghost py-2 w-full">סגור</button>
      </div>
    </div>
  )
}

export default function AdminUsers() {
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewCounts, setReviewCounts] = useState({})

  useEffect(() => {
    Promise.all([
      api.get('/users/').then(r => {
        const us = r.data.users || (Array.isArray(r.data) ? r.data : [])
        setUsers(us)
        us.forEach(u => { api.get(`/users/${u._id}/reviews`).then(r2 => { const cnt = (r2.data.reviews || []).length; if (cnt > 0) setReviewCounts(prev => ({...prev, [u._id]: cnt})) }).catch(()=>{}) })
      }).catch(()=>{}),
      api.get('/users/guests').then(r => setGuests(r.data.guests || [])).catch(()=>{}),
    ]).finally(() => setLoading(false))
  }, [])

  const toggleBan = async (u) => {
    const endpoint = u.banned ? `/users/${u._id}/unban` : `/users/${u._id}/ban`
    await api.put(endpoint)
    setUsers(prev => prev.map(x => x._id === u._id ? {...x, banned: !x.banned} : x))
    toast.success(u.banned ? 'משתמש הוסר מחסימה' : 'משתמש נחסם')
  }

  const filteredUsers = users.filter(u => !search || u.email?.includes(search) || u.name?.includes(search))
  const filteredGuests = guests.filter(g => !search || g.email?.includes(search) || g.name?.includes(search))

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-black text-slate-900 mb-1">משתמשים</h1>
          <p className="text-sm text-slate-400">{users.length} חשבונות · {guests.length} אורחים</p></div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap items-center">
        {[{k:'users',label:`חשבונות (${users.length})`,icon:Users},{k:'guests',label:`אורחים (${guests.length})`,icon:Globe}].map(({k,label,icon:Icon}) => (
          <button key={k} onClick={() => setTab(k)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${tab===k?'bg-primary-600 text-white shadow-sm':'bg-white border border-slate-200 text-slate-600 hover:border-primary-200'}`}><Icon className="w-3.5 h-3.5"/>{label}</button>
        ))}
        <div className="mr-auto max-w-xs flex-1 relative min-w-[160px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pr-10" placeholder="חיפוש..." />
        </div>
      </div>

      {tab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="border-b border-slate-100 bg-slate-50/60">
              <tr>{['שם','אימייל','IP','תפקיד','סטטוס','ביקורות','פעולות'].map(h=>(<th key={h} className="text-right py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wide">{h}</th>))}</tr>
            </thead>
            <tbody>
              {loading ? Array.from({length:4}).map((_,i) => (<tr key={i} className="animate-pulse border-b border-slate-50">{Array.from({length:7}).map((_,j) => <td key={j} className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-20"/></td>)}</tr>))
               : filteredUsers.map(u => (
                <tr key={u._id} className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors ${u.banned?'opacity-60':''}`}>
                  <td className="py-3 px-4 font-semibold text-slate-800">{u.name}</td>
                  <td className="py-3 px-4 text-slate-500 text-[12px]">{u.email}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{u.ip || '—'}</td>
                  <td className="py-3 px-4"><span className={`text-[11px] font-bold px-2 py-1 rounded-full ${u.role==='admin'?'bg-purple-50 text-purple-700':'bg-slate-100 text-slate-500'}`}>{u.role==='admin'?'מנהל':'לקוח'}</span></td>
                  <td className="py-3 px-4">{u.banned ? <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-red-50 text-red-600">חסום</span> : <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-green-50 text-green-700">פעיל</span>}</td>
                  <td className="py-3 px-4">{reviewCounts[u._id] ? (<button onClick={() => setReviewModal(u)} className="flex items-center gap-1 text-[11px] font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 px-2 py-1 rounded-lg transition-colors"><Star className="w-3 h-3"/>{reviewCounts[u._id]}</button>) : <span className="text-slate-300 text-[11px]">—</span>}</td>
                  <td className="py-3 px-4">{u.role !== 'admin' && (<button onClick={() => toggleBan(u)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${u.banned?'bg-green-50 text-green-700 hover:bg-green-100':'bg-red-50 text-red-600 hover:bg-red-100'}`}>{u.banned ? <><UserCheck className="w-3.5 h-3.5"/>בטל חסימה</> : <><UserX className="w-3.5 h-3.5"/>חסום</>}</button>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'guests' && (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="border-b border-slate-100 bg-slate-50/60">
              <tr>{['שם','אימייל','טלפון','IP','הזמנות','נראה לאחרונה'].map(h=>(<th key={h} className="text-right py-3 px-4 text-xs font-black text-slate-400 uppercase tracking-wide">{h}</th>))}</tr>
            </thead>
            <tbody>
              {filteredGuests.length === 0 ? <tr><td colSpan={6} className="text-center py-10 text-slate-400">אין אורחים עדיין</td></tr>
               : filteredGuests.map(g => (
                <tr key={g._id} className="border-b border-slate-50 hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-semibold text-slate-700">{g.name||'—'}</td>
                  <td className="py-3 px-4 text-slate-500 text-[12px]">{g.email}</td>
                  <td className="py-3 px-4 text-slate-500 text-[12px]">{g.phone||'—'}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{g.ip||'—'}</td>
                  <td className="py-3 px-4 font-bold text-slate-700">{g.orderCount||0}</td>
                  <td className="py-3 px-4 text-slate-400 text-[12px]">{fmtDate(g.lastSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reviewModal && <ReviewsModal userId={reviewModal._id} userName={reviewModal.name} onClose={() => setReviewModal(null)}/>}
    </div>
  )
}
