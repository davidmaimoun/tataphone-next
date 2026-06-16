'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

const SLIDES = [
  { title: 'מבצע חורף 2025', subtitle: 'עד 30% הנחה', desc: 'על כל האוזניות והמצלמות — לזמן מוגבל', cta: 'קנה עכשיו', to: '/products?sale=true',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&h=500&fit=crop&q=80',
    grad: 'linear-gradient(120deg,var(--primary-deep) 0%,var(--primary-dark) 45%,rgba(204,120,92,0.2) 100%)', tag: '❄️ חורף 2025' },
  { title: 'חבילות משפחה', subtitle: 'הנחת כמות 20%', desc: 'מעל 2 מכשירים — קבלו 20% הנחה אוטומטית', cta: 'גלה חבילות', to: '/products',
    img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&h=500&fit=crop&q=80',
    grad: 'linear-gradient(120deg,#0C4A6E 0%,#0891B2 45%,rgba(8,145,178,0.2) 100%)', tag: '👨‍👩‍👧 משפחה' },
  { title: 'אוזניות פרמיום', subtitle: 'Sony & Bose', desc: 'ביטול רעשים מקצועי — החל מ-₪990', cta: 'גלה אוזניות', to: '/products?category=אוזניות',
    img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200&h=500&fit=crop&q=80',
    grad: 'linear-gradient(120deg,#3B0764 0%,#7C3AED 45%,rgba(124,58,237,0.2) 100%)', tag: '🎧 סאונד פרמיום' },
]

export default function PromoBanners() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])
  const b = SLIDES[idx]

  return (
    <div className="relative overflow-hidden w-full" style={{ minHeight: 'clamp(240px, 40vw, 420px)' }}>
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0">
          <img src={b.img} alt={b.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: b.grad }} />
          <div className="relative z-10 h-full flex flex-col justify-center p-6 sm:p-10 lg:p-14" style={{ maxWidth: '90%' }}>
            <motion.span initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.15 }} className="text-[11px] sm:text-[13px] font-bold uppercase tracking-[0.14em] text-white/60 mb-2 sm:mb-3">{b.tag}</motion.span>
            <motion.h2 initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.22 }} className="font-black text-white leading-tight mb-1 sm:mb-2" style={{ fontSize: 'clamp(22px, 4vw, 42px)' }}>{b.title}</motion.h2>
            <motion.p initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.3 }} className="font-bold text-white/90 mb-1 sm:mb-2" style={{ fontSize: 'clamp(15px, 2.2vw, 22px)' }}>{b.subtitle}</motion.p>
            <motion.p initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.38 }} className="text-white/65 mb-4 sm:mb-6 max-w-md" style={{ fontSize: 'clamp(12px, 1.6vw, 15px)' }}>{b.desc}</motion.p>
            <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.46 }}>
              <Link href={b.to}>
                <button className="inline-flex items-center gap-2 bg-white font-bold text-[13px] sm:text-[15px] px-5 sm:px-7 py-2.5 sm:py-3 rounded-full shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all" style={{ color: 'var(--primary-deep)' }}>
                  {b.cta} <ArrowLeft className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-4 right-6 sm:right-10 z-20 flex gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className="rounded-full transition-all duration-300" style={{ width: i===idx?24:8, height: 8, background: i===idx?'white':'rgba(255,255,255,0.45)' }} />
        ))}
      </div>
    </div>
  )
}
