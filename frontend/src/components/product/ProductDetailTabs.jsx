'use client'
import { useState } from 'react'

export default function ProductDetailTabs({ details = [], specs = {} }) {
  // Sections de details SAUF l'onglet "תיאור" (redondant avec la description en haut)
  const sections = (Array.isArray(details) ? details : [])
    .filter(s => s && (s.title || s.body))
    .filter(s => String(s.title).trim() !== 'תיאור')

  const specsObj = specs && typeof specs === 'object' && !Array.isArray(specs) ? specs : {}
  const hasSpecs = Object.keys(specsObj).length > 0

  // Onglets : תיאור טכני (specs) en premier, puis les autres sections
  const tabs = []
  if (hasSpecs) tabs.push({ title: 'מפרט טכני', type: 'specs' })
  sections.forEach(s => tabs.push({ title: s.title || 'מקטע', type: 'text', body: s.body }))

  const [active, setActive] = useState(0)
  if (tabs.length === 0) return null

  return (
    <div className="mt-10 pt-2">
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto" role="tablist">
        {tabs.map((t, i) => (
          <button key={i} role="tab" onClick={() => setActive(i)}
            className={`relative px-5 py-3 text-[14px] font-bold whitespace-nowrap transition-colors ${active === i ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}>
            {t.title}
            {active === i && <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-primary-600 rounded-full" />}
          </button>
        ))}
      </div>

      <div className="py-6 px-1">
        {tabs[active]?.type === 'specs' ? (
          <div className="max-w-2xl">
            {Object.entries(specsObj).map(([k, v]) => (
              <div key={k} className="flex justify-between text-[14px] py-2.5 border-b border-slate-50">
                <span className="text-slate-400 font-medium">{k}</span>
                <span className="text-slate-700 font-semibold">{v}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[15px] text-slate-600 leading-8 whitespace-pre-wrap">{tabs[active]?.body}</p>
        )}
      </div>
    </div>
  )
}