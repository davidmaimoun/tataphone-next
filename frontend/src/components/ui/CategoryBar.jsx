import Link from 'next/link'
import Image from 'next/image'

const CATS = [
  { key: 'סמארטפונים', img: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=300&fit=crop&q=80' },
  { key: 'מצלמות',     img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=300&fit=crop&q=80' },
  { key: 'אוזניות',    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop&q=80' },
  { key: 'שעונים',     img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop&q=80' },
  { key: 'טאבלטים',    img: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=300&h=300&fit=crop&q=80' },
  { key: 'סוללות',     img: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=300&h=300&fit=crop&q=80' },
  { key: 'מטענים',     img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop&q=80' },
  { key: 'כיסויים',    img: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=300&h=300&fit=crop&q=80' },
]

export default function CategoryBar() {
  return (
    <section className="py-8 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-10">
        <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2">
          {CATS.map(({ key, img }) => (
            <Link key={key} href={`/products?category=${encodeURIComponent(key)}`}
                  className="group flex flex-col items-center gap-2 flex-shrink-0">
              <div className="relative rounded-full overflow-hidden border-2 border-slate-100 group-hover:border-primary-400 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1"
                   style={{ width: 'clamp(64px,18vw,92px)', height: 'clamp(64px,18vw,92px)' }}>
                <Image src={img} alt={key} fill sizes="92px" className="object-cover group-hover:scale-110 transition-transform duration-400" />
              </div>
              <span className="text-[12px] sm:text-[13px] font-bold text-slate-600 group-hover:text-primary-600 transition-colors whitespace-nowrap">{key}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
