import api from './api'

const authService = {
  login: async (email, password) => (await api.post('/auth/login', { email, password })).data,
  loginWithGoogle: async (credential) => (await api.post('/auth/google', { credential })).data,
  register: async (data) => (await api.post('/auth/register', data)).data,
  me: async () => (await api.get('/auth/me')).data,
  verifyEmail: (token) => api.post('/auth/verify-email', { token }).then(r => r.data),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }).then(r => r.data),
}
export default authService
