import productService from '@/services/productService'
import ProductCard from './ProductCard'

// SERVER COMPONENT — fetch related products
export default async function RelatedProducts({ productId }) {
  let related = []
  try {
    const data = await productService.getRelated(productId)
    related = data?.products || data || []
  } catch {}
  if (!related.length) return null

  return (
    <div className="mt-8 pt-8 border-t-2 border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 rounded-full bg-primary-600" />
        <h2 className="font-black text-2xl text-slate-900">מוצרים דומים</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 items-stretch">
        {related.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}
      </div>
    </div>
  )
}
