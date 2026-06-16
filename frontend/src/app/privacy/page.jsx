import Link from 'next/link'
import { ChevronLeft, Lock } from 'lucide-react'
import sections from '@/data/privacy.json'

export const metadata = {
  title: 'מדיניות פרטיות',
  description: 'מדיניות הפרטיות של טאטעפון — איסוף, עיבוד ושמירת מידע אישי בהתאם לחוק.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-[14px] text-slate-400 hover:text-primary-600 mb-6"><ChevronLeft className="w-4 h-4" />חזרה לדף הבית</Link>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center"><Lock className="w-6 h-6 text-primary-600" /></div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">מדיניות פרטיות</h1>
          <p className="text-slate-400 text-sm">עודכן לאחרונה: 2026</p>
        </div>
      </div>
      <div className="space-y-8">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-black text-[18px] text-slate-900 mb-2">{i+1}. {s.title}</h2>
            {s.content.split('\n\n').map((para, j) => <p key={j} className="text-[15px] text-slate-600 leading-7 mb-3 whitespace-pre-line">{para}</p>)}
          </section>
        ))}
      </div>
    </div>
  )
}
