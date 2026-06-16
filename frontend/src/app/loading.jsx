export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      <div className="h-0.5 bg-primary-200 overflow-hidden">
        <div className="h-full bg-primary-600" style={{ width:'40%', animation:'loadbar 1s ease-in-out infinite' }} />
      </div>
    </div>
  )
}
