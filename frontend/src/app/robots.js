// Next génère automatiquement /robots.txt à partir de ce fichier
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/checkout', '/cart', '/login', '/register', '/my-orders', '/wishlist'],
    },
    sitemap: 'https://tataphone.co.il/sitemap.xml',
  }
}
