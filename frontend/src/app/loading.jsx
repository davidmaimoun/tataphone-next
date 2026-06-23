export default function Loading() {
  return (
    <>
      {/* Barre de progression en haut */}
      <div className="fixed top-0 left-0 right-0 z-[100]">
        <div className="h-0.5 bg-primary-200 overflow-hidden">
          <div className="h-full bg-primary-600" style={{ width:'40%', animation:'loadbar 1s ease-in-out infinite' }} />
        </div>
      </div>

      {/* Loader centré — occupe l'écran pour éviter que le footer remonte */}
      <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: '70vh' }}>
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-[3px] border-primary-100" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary-600 animate-spin" />
        </div>
        <p className="text-[14px] font-bold text-primary-600">טוען...</p>
      </div>
    </>
  )
}