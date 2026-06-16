import Link from 'next/link'

export default function SectionHeader({ icon: Icon, iconColor, label, title, gradientWord, gradientColors, description, linkTo, linkLabel = 'צפה בכולם' }) {
  const grad = gradientColors || 'var(--primary-dark), var(--primary-light)'
  const c1 = grad.split(',')[0]

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          {(label || Icon) && (
            <div className="flex items-center gap-2 mb-2">
              {Icon && (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${c1.trim()}20` }}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor || 'text-primary-500'}`} />
                </div>
              )}
              {label && <span className="text-[11px] sm:text-[13px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</span>}
            </div>
          )}
          <h2 className="font-black tracking-tight leading-tight text-[26px] sm:text-[36px] md:text-[46px]">
            <span className="text-slate-900">{title} </span>
            {gradientWord && (
              <span style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text', backgroundImage: `linear-gradient(135deg, ${grad})` }}>
                {gradientWord}
              </span>
            )}
          </h2>
        </div>
        {linkTo && (
          <Link href={linkTo} className="flex-shrink-0 hidden sm:block">
            <div className="flex items-center gap-1.5 text-[13px] sm:text-[14px] font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer hover:-translate-y-0.5">
              {linkLabel} <span className="text-[15px]">←</span>
            </div>
          </Link>
        )}
      </div>
      {description && <p className="text-[13px] sm:text-[15px] text-slate-400 mt-2 leading-relaxed">{description}</p>}
      {linkTo && (
        <Link href={linkTo} className="sm:hidden inline-flex mt-3">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-primary-600 bg-primary-50 border border-primary-200 px-3 py-1.5 rounded-lg whitespace-nowrap">
            {linkLabel} <span className="text-[13px]">←</span>
          </div>
        </Link>
      )}
    </div>
  )
}
