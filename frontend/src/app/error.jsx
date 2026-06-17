'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, Home, Mail } from 'lucide-react'

const OWNER_EMAIL = 'tataphone@outlook.com'

export default function Error({ error, reset }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-primary-50 flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-primary-500" />
      </div>
      <h1 className="font-black text-2xl sm:text-3xl text-slate-900 mb-2">משהו השתבש</h1>
      <p className="text-slate-500 text-[15px] max-w-md leading-7 mb-8">
        אירעה שגיאה בלתי צפויה. נסה לרענן את הדף. אם הבעיה נמשכת, אנא צור איתנו קשר ונשמח לעזור.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => reset()} className="btn btn-primary px-7 py-3 gap-2 justify-center">
          <RotateCcw className="w-4 h-4" />נסה שוב
        </button>
        <Link href="/"><button className="btn btn-secondary px-7 py-3 gap-2 justify-center w-full"><Home className="w-4 h-4" />דף הבית</button></Link>
        <a href={`mailto:${OWNER_EMAIL}?subject=דיווח על תקלה באתר`}>
          <button className="btn btn-ghost px-7 py-3 gap-2 justify-center w-full"><Mail className="w-4 h-4" />דווח לנו</button>
        </a>
      </div>
      <p className="text-[12px] text-slate-300 mt-8" dir="ltr">{OWNER_EMAIL}</p>
    </div>
  )
}
