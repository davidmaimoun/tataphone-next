// ════════════════════════════════════════════════════════════
// Service API — parle au backend Flask.
// Note : le backend exige un slash final (/products/) sinon il
// renvoie une redirection 308. On met donc les slashs ici.
// ════════════════════════════════════════════════════════════

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

async function apiGet(path, { revalidate = 60 } = {}) {
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate } })
    if (!res.ok) throw new Error(`API ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('API error:', path, err.message)
    return null
  }
}

// Construit une query string en gardant le slash final avant le ?
function withQuery(base, params = {}) {
  const qs = new URLSearchParams(params).toString()
  return qs ? `${base}?${qs}` : base
}

const productService = {
  async getAll(params = {}) {
    const data = await apiGet(withQuery('/products/', params))
    return data || { products: [] }
  },

  async getById(id) {
    const data = await apiGet(`/products/${id}`)
    if (!data) return null
    // Robuste : accepte { product: {...} } OU le produit directement {...}
    return data.product || data
  },

  async getRecommended(ids = []) {
    if (!ids.length) return { products: [] }
    const data = await apiGet(withQuery('/products/recommended/', { ids: ids.join(',') }))
    return data || { products: [] }
  },

  async getAllIds() {
    const data = await apiGet(withQuery('/products/', { limit: 9999 }), { revalidate: 3600 })
    return data?.products?.map(p => p._id) || []
  },
}

export default productService
