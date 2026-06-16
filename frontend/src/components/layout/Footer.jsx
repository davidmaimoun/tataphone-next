import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'

const COLS = [
  { title:'קטגוריות', links:[
    {l:'סמארטפונים כשרים', to:'/products?category=סמארטפונים'},
    {l:'מצלמות',           to:'/products?category=מצלמות'},
    {l:'אוזניות',          to:'/products?category=אוזניות'},
    {l:'שעונים חכמים',     to:'/products?category=שעונים'},
    {l:'אביזרים',          to:'/products'},
  ]},
  { title:'שירות לקוחות', links:[
    {l:'מדיניות החזרות', to:'/terms'},
    {l:'אחריות',         to:'/terms'},
    {l:'שאלות נפוצות',   to:'/contact'},
    {l:'צור קשר',        to:'/contact'},
  ]},
  { title:'על טאטעפון', links:[
    {l:'תנאי שימוש',     to:'/terms'},
    {l:'מדיניות פרטיות', to:'/privacy'},
  ]},
]

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white mt-16">
      <div className="h-[3px]" style={{ background:'linear-gradient(to right,#1E3A8A,var(--primary),var(--primary-light),var(--primary),#1E3A8A)' }} />
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <div className="mb-5">
              <span className="font-rubik text-2xl font-black text-primary-400">טאטע</span>
              <span className="font-rubik text-2xl font-black text-white">פון</span>
            </div>
            <p className="text-sm text-slate-300 leading-7 mb-6 max-w-xs">
              המקום המוביל לטכנולוגיה כשרה בישראל. כל המוצרים מאושרים ומותאמים לציבור הדתי. אנו מחויבים לאיכות ולשירות הטוב ביותר.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['תשלום מאובטח','כשרות מוסמכת','משלוח מהיר','החזרה 14 יום'].map(b => (
                <span key={b} className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-white/8 border border-white/15 text-slate-300">{b}</span>
              ))}
            </div>
            <div className="space-y-3">
              {[[Phone,'0549784224'],[Mail,'tataphone@outlook.com'],[MapPin,'ירושלים']].map(([Icon,val]) => (
                <div key={val} className="flex items-center gap-2.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center shrink-0"><Icon className="w-3.5 h-3.5" /></div>{val}
                </div>
              ))}
            </div>
          </div>
          {COLS.map(col => (
            <div key={col.title}>
              <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-200 mb-5">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(({ l, to }) => (
                  <li key={l}><Link href={to} className="text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 group/l">
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover/l:bg-primary-400 transition-colors shrink-0" />{l}
                  </Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/15 pt-7 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-300">© 2026 Tataphone Ltd. — כל הזכויות שמורות</p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span className="text-xs text-slate-300">עשוי עם ❤️ בישראל 🇮🇱</span>
            <a href="https://www.sudosudev.com" target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-primary-500/30 hover:border-primary-400/60 transition-all group"
               style={{ direction:'ltr', background:'linear-gradient(135deg,rgba(204,120,92,0.15),rgba(157,75,46,0.2))' }}>
              <div style={{ direction:'ltr', textAlign:'left' }}>
                <p className="text-[10px] text-slate-400 leading-none mb-0.5">Powered by</p>
                <p className="font-black text-[15px] leading-none tracking-tight" style={{ background:'linear-gradient(135deg,#DDA08A,var(--primary-light))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>sudosu.dev</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
