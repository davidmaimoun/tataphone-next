'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

function FaqItem({ q, a, index }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div initial={{opacity:0,y:6}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:index*0.05}}>
      <div className={`bg-white rounded-2xl border transition-all overflow-hidden ${open ? 'border-primary-200 shadow-[0_4px_16px_var(--primary-glow)]' : 'border-slate-100 hover:border-primary-100'}`}>
        <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-5 text-right">
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${open ? 'bg-primary-600' : 'bg-primary-100'}`}>
              <span className={`font-black text-[12px] transition-colors ${open ? 'text-white' : 'text-primary-600'}`}>?</span>
            </div>
            <p className="font-bold text-[14px] text-slate-800">{q}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform mr-2 ${open ? 'rotate-180' : ''}`} />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.2}}>
              <div className="px-5 pb-5 pt-0"><div className="bg-primary-50 rounded-xl p-4 mr-10"><p className="text-[13px] text-slate-600 leading-6">{a}</p></div></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function FaqAccordion({ faqs }) {
  const [open, setOpen] = useState(false)
  return (
    <div id="faq" className="mb-12">
      <button onClick={() => setOpen(v => !v)} className="flex items-center justify-between w-full mb-0 group">
        <div className="flex items-center gap-3"><div className="sh-bar" /><h2 className="font-black text-slate-900" style={{fontSize:26}}>שאלות נפוצות</h2></div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${open ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-primary-200'}`}>
          <span className="text-[13px] font-semibold">{open ? 'סגור' : 'הצג שאלות'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25}} className="overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">{faqs.map((f, i) => <FaqItem key={i} {...f} index={i} />)}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
