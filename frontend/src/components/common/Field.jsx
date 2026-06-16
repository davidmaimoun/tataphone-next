export default function Field({ label, icon: Icon, ...props }) {
  return (
    <div>
      <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">{label}</label>
      <div className="relative" dir="rtl">
        {Icon && <Icon className="absolute top-1/2 -translate-y-1/2 start-3.5 w-4 h-4 text-slate-400 pointer-events-none" />}
        <input {...props} className={`input w-full ${Icon ? '!ps-10' : ''}`} />
      </div>
    </div>
  )
}
