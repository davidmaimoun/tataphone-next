import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function SectionHeader({ icon: Icon, iconColor = 'text-primary-500', label, title, gradientWord, gradientColors = 'var(--primary), var(--primary-light)', description, linkTo, linkLabel }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
      <div>
        {label && (
          <div className="flex items-center gap-2 mb-1.5">
            {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</span>
          </div>
        )}
        <h2 className="font-black text-slate-900 leading-tight" style={{ fontSize: 'clamp(22px,3vw,30px)' }}>
          {title}{' '}
          {gradientWord && (
            <span style={{ background: `linear-gradient(135deg, ${gradientColors})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {gradientWord}
            </span>
          )}
        </h2>
        {description && <p className="text-slate-400 text-[14px] mt-1">{description}</p>}
      </div>
      {linkTo && (
        <Link href={linkTo} className="flex items-center gap-1 text-[14px] font-bold text-primary-600 hover:gap-2 transition-all whitespace-nowrap">
          {linkLabel || 'ראה הכל'} <ArrowLeft className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}
