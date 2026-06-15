// Next génère automatiquement /sitemap.xml à partir de ce fichier.
// Pour l'instant : pages statiques. On ajoutera les produits dynamiquement après.
export default async function sitemap() {
  const base = 'https://tataphone.co.il'
  const now = new Date()

  const staticPages = [
    { url: `${base}/`,                       lastModified: now, changeFrequency: 'daily',  priority: 1.0 },
    { url: `${base}/products`,               lastModified: now, changeFrequency: 'daily',  priority: 0.9 },
    { url: `${base}/products?isKosher=true`, lastModified: now, changeFrequency: 'daily',  priority: 0.9 },
    { url: `${base}/contact`,                lastModified: now, changeFrequency: 'monthly',priority: 0.5 },
  ]

  // TODO (étape future) : fetch des produits pour générer 2000+ URLs
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=9999`)
  // const { products } = await res.json()
  // const productPages = products.map(p => ({
  //   url: `${base}/products/${p._id}`,
  //   lastModified: new Date(p.updatedAt || now),
  //   changeFrequency: 'weekly', priority: 0.7,
  // }))
  // return [...staticPages, ...productPages]

  return staticPages
}
