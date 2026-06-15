import productService from '@/services/productService'
import ProductCard from '@/components/product/ProductCard'

export const revalidate = 120

// Metadata dynamique selon les filtres (kosher, sale, category)
export async function generateMetadata({ searchParams }) {
  if (searchParams.isKosher === 'true')
    return { title: 'מכשירים כשרים', description: 'כל המכשירים הכשרים המאושרים שלנו.' }
  if (searchParams.sale === 'true')
    return { title: 'מבצעים חמים', description: 'הנחות גדולות על מגוון מוצרים — לזמן מוגבל.' }
  if (searchParams.category)
    return { title: searchParams.category, description: `כל המוצרים בקטגוריית ${searchParams.category}.` }
  return { title: 'כל המוצרים', description: 'גלה את כל המוצרים הכשרים שלנו — סמארטפונים, אוזניות, מצלמות ועוד.' }
}

export default async function ProductsPage({ searchParams }) {
  // Construit les params API depuis l'URL
  const params = {}
  if (searchParams.isKosher) params.isKosher = searchParams.isKosher
  if (searchParams.sale) params.sale = searchParams.sale
  if (searchParams.category) params.category = searchParams.category
  if (searchParams.sort) params.sort = searchParams.sort
  params.limit = 48

  const { products = [] } = await productService.getAll(params)

  const title = searchParams.isKosher === 'true' ? '✡ מכשירים כשרים'
    : searchParams.sale === 'true' ? '🔥 מבצעים'
    : searchParams.category ? searchParams.category
    : 'כל המוצרים'

  return (
    <main className="min-h-screen max-w-7xl mx-auto px-2 sm:px-6 lg:px-10 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="sh-bar" />
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{title}</h1>
        <span className="text-sm text-slate-400">({products.length})</span>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <p className="text-lg">אין מוצרים להצגה כרגע.</p>
          <p className="text-sm mt-1">ודא שה-backend (Flask) פועל על פורט 5001.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 items-stretch">
          {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
        </div>
      )}
    </main>
  )
}
