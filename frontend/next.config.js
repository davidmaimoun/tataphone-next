/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    // Autorise les domaines d'images externes (Unsplash + ton API/CDN plus tard)
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.r2.dev' },   // Cloudflare R2 (public dev URL)
      // Ajoute ici le domaine de ton backend Flask quand il servira des images
      // { protocol: 'https', hostname: 'api.tataphone.co.il' },
    ],
  },
  // L'URL de ton backend Flask — pour les appels API
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
}

module.exports = nextConfig