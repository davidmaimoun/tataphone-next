'use client'
import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// Affiche Navbar/Footer SAUF sur les pages admin et login
export default function PublicChrome({ children }) {
  const pathname = usePathname()
  const isBare = pathname?.startsWith('/admin') || pathname === '/login'

  if (isBare) return <>{children}</>

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
