import Link from 'next/link'
import { Phone, Mail, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <h3 className="font-black text-white text-xl mb-3">טאטעפון</h3>
          <p className="text-sm text-slate-400">חנות הטכנולוגיה הכשרה המובילה בישראל.</p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-3">קישורים</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products" className="hover:text-white">כל המוצרים</Link></li>
            <li><Link href="/products?isKosher=true" className="hover:text-white">מכשירים כשרים</Link></li>
            <li><Link href="/products?sale=true" className="hover:text-white">מבצעים</Link></li>
            <li><Link href="/contact" className="hover:text-white">צור קשר</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-3">יצירת קשר</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 03-555-1234</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@tataphone.co.il</li>
            <li className="flex items-center gap-2"><Clock className="w-4 h-4" /> א׳–ה׳ 9:00–18:00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} טאטעפון. כל הזכויות שמורות.
      </div>
    </footer>
  )
}
