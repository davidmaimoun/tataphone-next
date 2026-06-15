import './globals.css'
import { Rubik, Space_Grotesk } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import PublicChrome from '@/components/layout/PublicChrome'

const rubik = Rubik({
  subsets: ['hebrew', 'latin'],
  weight: ['300','400','500','600','700','800','900'],
  variable: '--font-rubik',
  display: 'swap',
})
const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500','600','700'],
  variable: '--font-grotesk',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://tataphone.co.il'),
  title: {
    default: 'טאטעפון — חנות טכנולוגיה כשרה',
    template: '%s | טאטעפון',
  },
  description: 'חנות הטכנולוגיה הכשרה המובילה בישראל — סמארטפונים כשרים, אוזניות, מצלמות ואביזרים. משלוח חינם מעל ₪500.',
  keywords: ['טלפון כשר','סמארטפון כשר','מכשירים כשרים','אוזניות','מצלמות','טאטעפון'],
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    siteName: 'טאטעפון',
    title: 'טאטעפון — חנות טכנולוגיה כשרה',
    description: 'סמארטפונים כשרים, אוזניות ומצלמות במחירים הטובים ביותר.',
    url: 'https://tataphone.co.il',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}

export const viewport = { themeColor: '#CC785C' }

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" data-theme="orange" className={`${rubik.variable} ${grotesk.variable}`}>
      <body className="flex flex-col min-h-screen">
        <PublicChrome>{children}</PublicChrome>
        <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
      </body>
    </html>
  )
}
