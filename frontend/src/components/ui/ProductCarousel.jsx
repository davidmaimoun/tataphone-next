'use client'
import { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'

const CARD_W = 200
const SCROLL_BY = CARD_W * 2 + 16

export default function ProductCarousel({ products = [], loading = false, forceNew = false }) {
  const trackRef = useRef(null)
  const drag = useRef({ on: false, startX: 0, scrollLeft: 0, moved: false })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const items = loading
    ? Array.from({ length: 6 }, (_, i) => ({ _id: `sk${i}`, _skeleton: true }))
    : products

  const updateArrows = () => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 10)
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  // RTL : signes inversés (convention de ce projet)
  const goNext = () => { trackRef.current?.scrollBy({ left: -SCROLL_BY, behavior: 'smooth' }); setTimeout(updateArrows, 400) }
  const goPrev = () => { trackRef.current?.scrollBy({ left: SCROLL_BY, behavior: 'smooth' }); setTimeout(updateArrows, 400) }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    setTimeout(updateArrows, 50)
    el.addEventListener('scroll', updateArrows, { passive: true })

    const onMouseDown = (e) => {
      drag.current = { on: true, startX: e.clientX, scrollLeft: el.scrollLeft, moved: false }
      el.style.cursor = 'grabbing'; el.style.userSelect = 'none'
    }
    const onMouseMove = (e) => {
      if (!drag.current.on) return
      const dx = e.clientX - drag.current.startX
      if (Math.abs(dx) > 5) drag.current.moved = true
      el.scrollLeft = drag.current.scrollLeft - dx
    }
    const stop = () => {
      if (!drag.current.on) return
      drag.current.on = false; el.style.cursor = 'grab'; el.style.userSelect = ''
      updateArrows()
    }
    const preventClick = (e) => {
      if (drag.current.moved) { e.stopPropagation(); e.preventDefault(); drag.current.moved = false }
    }
    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseup', stop)
    el.addEventListener('mouseleave', stop)
    el.addEventListener('click', preventClick, true)

    return () => {
      el.removeEventListener('scroll', updateArrows)
      el.removeEventListener('mousedown', onMouseDown)
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseup', stop)
      el.removeEventListener('mouseleave', stop)
      el.removeEventListener('click', preventClick, true)
    }
  }, [items.length])

  if (!items.length) return null

  const btn = (onClick, can, icon) => (
    <button onClick={onClick}
      className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all"
      style={{ opacity: can ? 1 : 0, pointerEvents: can ? 'auto' : 'none' }}>
      {icon}
    </button>
  )

  return (
    <div className="flex items-center gap-1.5">
      {btn(goPrev, canPrev, <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />)}
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute right-0 top-0 bottom-2 w-8 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left,rgba(255,255,255,0.6),transparent)' }} />
        <div className="absolute left-0 top-0 bottom-2 w-8 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right,rgba(255,255,255,0.6),transparent)' }} />
        <div ref={trackRef} className="flex gap-2 overflow-x-auto no-scrollbar pb-2" style={{ cursor: 'grab' }}>
          {items.map((p, i) => (
            <div key={p._id} style={{ flexShrink: 0, width: CARD_W, display: 'flex' }}>
              {p._skeleton ? <SkeletonCard /> : <ProductCard product={p} index={i} forceNew={forceNew} />}
            </div>
          ))}
        </div>
      </div>
      {btn(goNext, canNext, <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />)}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="w-full rounded-2xl overflow-hidden bg-white border border-slate-100 animate-pulse">
      <div className="bg-slate-100" style={{ height: 180 }} />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-slate-100 rounded-full w-1/4" />
        <div className="h-4 bg-slate-100 rounded w-4/5" />
        <div className="h-9 bg-slate-100 rounded-xl" />
      </div>
    </div>
  )
}
