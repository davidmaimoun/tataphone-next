'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'
import authService from '@/services/authService'
import toast from 'react-hot-toast'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      init: () => {
        const { token, user } = get()
        if (!token) return
        try {
          const decoded = jwtDecode(token)
          if (decoded.exp * 1000 < Date.now()) { set({ user: null, token: null }); return }
          if (user) return
          let userId = decoded.sub, role = decoded.role || 'user', name = decoded.name || '', email = decoded.email || ''
          if (typeof decoded.sub === 'string' && decoded.sub.startsWith('{')) {
            try { const old = JSON.parse(decoded.sub); userId = old.id || old._id || decoded.sub; role = old.role || 'user'; name = old.name || ''; email = old.email || '' } catch {}
          }
          set({ user: { id: userId, name, email, role } })
        } catch { set({ token: null, user: null }) }
      },
      login: async (email, password) => {
        const { token, user } = await authService.login(email, password)
        set({ token, user }); return user
      },
      loginWithGoogle: async (credential) => {
        const { token, user } = await authService.loginWithGoogle(credential)
        set({ token, user }); return user
      },
      register: async (data) => {
        const { token, user } = await authService.register(data)
        set({ token, user }); return user
      },
      logout: () => {
        const name = get().user?.name
        set({ user: null, token: null })
        toast('להתראות' + (name ? `, ${name} 👋` : ' 👋'), { icon: '🔐', style: { fontFamily: 'Rubik, sans-serif', direction: 'rtl' } })
      },
      isAdmin: () => get().user?.role === 'admin',
    }),
    { name: 'tataphone-auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
)

export default useAuthStore
