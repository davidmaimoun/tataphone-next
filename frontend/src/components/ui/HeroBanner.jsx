import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary-pale) 0%, white 60%, var(--primary-pale) 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
               style={{ background: 'white', color: 'var(--primary-dark)', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            <Sparkles className="w-4 h-4" />
            <span className="text-[13px] font-bold">✦ חדש בחנות</span>
          </div>
          <h1 className="font-black leading-[1.05] mb-4 text-slate-900" style={{ fontSize: 'clamp(32px,6vw,56px)' }}>
            הטלפון{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              הכשר
            </span>
            {' '}שחיפשת
          </h1>
          <p className="text-slate-500 mb-7" style={{ fontSize: 'clamp(15px,2vw,19px)' }}>
            מגוון מכשירים מאושרים במחירים הטובים ביותר — סמארטפונים, אוזניות, מצלמות ועוד.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/products">
              <button className="btn btn-primary px-6 py-3 text-[15px]">
                גלה מוצרים <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/products?isKosher=true">
              <button className="btn px-6 py-3 text-[15px] font-bold" style={{ background: '#D1FAE5', color: '#064E3B' }}>
                ✡ מכשירים כשרים
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
