'use client'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function PublicChrome({ children }) {
  const pathname = usePathname()
  const isBare = pathname?.startsWith('/admin') || pathname === '/login' || pathname === '/register' || pathname?.startsWith('/auth/')
  if (isBare) return <>{children}</>
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
