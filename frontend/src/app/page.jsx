import { Sparkles, TrendingUp, Award, BadgeCheck, Truck, Shield, RotateCcw } from 'lucide-react'
import HeroBanner from '@/components/ui/HeroBanner'
import CategoryBar from '@/components/ui/CategoryBar'
import SectionHeader from '@/components/ui/SectionHeader'
import ProductCarousel from '@/components/ui/ProductCarousel'
import productService from '@/services/productService'

export const revalidate = 120

const W = 'max-w-7xl mx-auto px-2 sm:px-6 lg:px-10'

export default async function HomePage() {
  // Fetch parallèle de toutes les sections (côté serveur = SEO + rapide)
  const [newP, kosherP, saleP, bestP] = await Promise.all([
    productService.getAll({ sort: '-createdAt', limit: 10 }),
    productService.getAll({ isKosher: 'true', limit: 10 }),
    productService.getAll({ sale: 'true', limit: 10 }),
    productService.getAll({ sort: '-reviewCount', limit: 10 }),
  ])

  const newProducts = newP?.products || []
  const kosherProducts = kosherP?.products || []
  const saleProducts = saleP?.products || []
  const bestSellers = bestP?.products || []

  return (
    <div className="min-h-screen">
      <HeroBanner />
      <CategoryBar />

      {/* New arrivals */}
      <section className="py-14">
        <div className={W}>
          <SectionHeader icon={Sparkles} label="מה חדש" title="מוצרים" gradientWord="חדשים"
            description="הגיעו עכשיו למחסן שלנו" linkTo="/products?sort=-createdAt" linkLabel="כל המוצרים" />
          <ProductCarousel products={newProducts} forceNew />
        </div>
      </section>

      {/* Kosher */}
      {kosherProducts.length > 0 && (
        <section className="py-14" style={{ background: 'linear-gradient(to bottom,#F0FDF4,white)' }}>
          <div className={W}>
            <SectionHeader icon={BadgeCheck} iconColor="text-emerald-600" label="מוצרים כשרים" title="הכל" gradientWord="כשר"
              gradientColors="#059669, #34D399" description="כל המוצרים מאושרים ומוסמכים"
              linkTo="/products?isKosher=true" linkLabel="כל הכשרים" />
            <ProductCarousel products={kosherProducts} />
          </div>
        </section>
      )}

      {/* Best sellers */}
      {bestSellers.length > 0 && (
        <section className="py-14">
          <div className={W}>
            <SectionHeader icon={Award} iconColor="text-orange-500" label="הנמכרים ביותר" title="רב" gradientWord="מכר"
              gradientColors="#F97316, #EF4444" description="המוצרים שהכי אוהבים לקנות"
              linkTo="/products?sort=-reviewCount" linkLabel="כל הרב-מכרים" />
            <ProductCarousel products={bestSellers} />
          </div>
        </section>
      )}

      {/* Sale */}
      {saleProducts.length > 0 && (
        <section className="py-14" style={{ background: 'linear-gradient(to bottom,#FFF5F5,white)' }}>
          <div className={W}>
            <SectionHeader icon={TrendingUp} iconColor="text-red-500" label="מבצעים חמים" title="מחיר" gradientWord="מיוחד 🔥"
              gradientColors="#EF4444, #F97316" description="הנחות גדולות לזמן מוגבל"
              linkTo="/products?sale=true" linkLabel="כל המבצעים" />
            <ProductCarousel products={saleProducts} />
          </div>
        </section>
      )}

      {/* Trust */}
      <section className="py-10">
        <div className={W}>
          <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary-deep) 0%, var(--primary) 60%, var(--primary-light) 100%)' }}>
            <div className="grid grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Truck, title: 'משלוח חינם', sub: 'מעל ₪500' },
                { icon: BadgeCheck, title: 'כשרות מוסמכת', sub: 'כל המוצרים' },
                { icon: Shield, title: 'תשלום מאובטח', sub: 'SSL מוצפן' },
                { icon: RotateCcw, title: 'החזרה 14 יום', sub: 'ללא שאלות' },
              ].map(({ icon: Icon, title, sub }, i) => (
                <div key={title} className={`flex items-center gap-3 px-4 py-5 ${i % 2 === 0 ? 'border-r border-white/10' : ''} ${i < 2 ? 'border-b lg:border-b-0 border-white/10' : ''}`}>
                  <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-[13px] sm:text-[14px] text-white">{title}</p>
                    <p className="text-[11px] text-white/70">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
