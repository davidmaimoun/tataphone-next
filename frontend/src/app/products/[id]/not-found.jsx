import Link from 'next/link'
import { PackageX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[65vh] flex flex-col items-center justify-center gap-5 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
        <PackageX className="w-9 h-9 text-slate-300" />
      </div>
      <h2 className="text-2xl font-black text-slate-800">המוצר לא נמצא</h2>
      <p className="text-slate-400 text-[15px] max-w-sm">ייתכן שהמוצר הוסר או שהקישור שגוי.</p>
      <Link href="/products"><button className="btn btn-primary px-6 py-3">לכל המוצרים ←</button></Link>
    </div>
  )
}
