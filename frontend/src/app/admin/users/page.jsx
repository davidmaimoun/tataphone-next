'use client'
import { useEffect, useState } from 'react'
import api from '@/services/api'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/')
      .then(r => { const d = r.data; setUsers(Array.isArray(d) ? d : (d.users || [])) })
      .catch(() => toast.error('שגיאה בטעינת משתמשים'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-black text-slate-900 mb-6">משתמשים ({users.length})</h1>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-[12px] font-bold text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3">שם</th>
              <th className="px-4 py-3">אימייל</th>
              <th className="px-4 py-3 hidden sm:table-cell">תפקיד</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">טוען...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">אין משתמשים</td></tr>
            ) : users.map(u => (
              <tr key={u._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-[14px]">{u.name || '—'}</td>
                <td className="px-4 py-3 text-[13px] text-slate-500" dir="ltr">{u.email}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`text-[12px] px-2 py-1 rounded-full font-bold ${u.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                    {u.role || 'user'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
