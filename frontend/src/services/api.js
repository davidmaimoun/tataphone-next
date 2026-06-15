'use client'
import useAuthStore from '@/stores/authStore'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Fetch authentifié (ajoute le token automatiquement)
async function authFetch(path, options = {}) {
  const token = useAuthStore.getState().token
  const headers = { ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(`${API}${path}`, { ...options, headers })
  if (res.status === 401) {
    useAuthStore.getState().logout()
    throw new Error('unauthorized')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `API ${res.status}`)
  }
  return res.json().catch(() => ({}))
}

export const api = {
  get:  (p)      => authFetch(p),
  post: (p, body)=> authFetch(p, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put:  (p, body)=> authFetch(p, { method: 'PUT',  body: JSON.stringify(body) }),
  del:  (p)      => authFetch(p, { method: 'DELETE' }),
  API,
}

export default api
