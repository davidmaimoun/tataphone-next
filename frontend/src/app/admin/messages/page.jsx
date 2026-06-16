'use client'
import { useState, useEffect } from 'react'
import { Mail, Trash2, Phone } from 'lucide-react'
import api from '@/services/api'
import toast from 'react-hot-toast'

export default function AdminMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => api.get('/contact/').then(r => { const d = r.data; setMessages(Array.isArray(d) ? d : (d.messages || [])) }).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const remove = async (id) => {
    if (!confirm('למחוק את ההודעה?')) return
    try { await api.delete(`/contact/${id}`); setMessages(prev => prev.filter(m => m._id !== id)); toast.success('נמחק') } catch { toast.error('שגיאה') }
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-black text-slate-900 mb-6">הודעות ({messages.length})</h1>
      {loading ? <p className="text-slate-400">טוען...</p>
       : messages.length === 0 ? <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400"><Mail className="w-10 h-10 mx-auto mb-2 text-slate-200" />אין הודעות</div>
       : (
        <div className="space-y-3">
          {messages.map(m => (
            <div key={m._id} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-slate-800">{m.name}</p>
                  <div className="flex items-center gap-3 text-[12px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1" dir="ltr"><Mail className="w-3 h-3" />{m.email}</span>
                    {m.phone && <span className="flex items-center gap-1" dir="ltr"><Phone className="w-3 h-3" />{m.phone}</span>}
                  </div>
                </div>
                <button onClick={() => remove(m._id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
              <p className="text-[14px] text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-3">{m.message}</p>
              {m.createdAt && <p className="text-[11px] text-slate-300 mt-2">{new Date(m.createdAt).toLocaleString('he-IL')}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
