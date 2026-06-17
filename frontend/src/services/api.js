'use client'
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
})

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('tataphone-auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      const token = parsed?.state?.token
      // n'envoie le header QUE si le token ressemble à un JWT (3 segments)
      if (token && typeof token === 'string' && token.split('.').length === 3) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
  } catch {}
  if (config.data instanceof FormData) delete config.headers['Content-Type']
  return config
})

api.interceptors.response.use(
  r => r,
  (error) => {
    const status = error?.response?.status
    // 401/422 = token invalide/expiré → on nettoie sans crasher
    if (status === 401 || status === 422) {
      try {
        const raw = localStorage.getItem('tataphone-auth')
        if (raw) {
          const parsed = JSON.parse(raw)
          // garde le user mais purge le token cassé
          parsed.state = { ...(parsed.state || {}), token: null }
          localStorage.setItem('tataphone-auth', JSON.stringify(parsed))
        }
      } catch {}
    }
    return Promise.reject(error)
  }
)

export default api
