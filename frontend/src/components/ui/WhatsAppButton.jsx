'use client'
import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 1500)
    return () => clearTimeout(t)
  }, [])
  if (!show) return null
  const phone = '972549784224'
  const msg = encodeURIComponent('שלום! אני מעוניין לקבל מידע על מוצר')
  return (
    <a href={`https://wa.me/${phone}?text=${msg}`} target="_blank" rel="noopener noreferrer"
       className="fixed bottom-5 left-5 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-110"
       style={{ background:'#25D366', boxShadow:'0 4px 20px rgba(37,211,102,0.5)' }} aria-label="WhatsApp">
      <span className="absolute inset-0 rounded-full" style={{ background:'#25D366', animation:'slow-ping 2.5s ease-in-out infinite', opacity:0.5 }} />
      <MessageCircle className="w-7 h-7 text-white relative z-10" fill="white" />
    </a>
  )
}
