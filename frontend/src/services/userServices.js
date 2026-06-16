import api from './api'

const userServices = {
  getAll: () => api.get('/users/').then(r => r.data),
  getStats: (range = '30d') => api.get(`/users/analytics/stats?range=${range}`).then(r => r.data),
  updateRole: (id, role) => api.put(`/users/${id}`, { role }).then(r => r.data),
  delete: (id) => api.delete(`/users/${id}`).then(r => r.data),
}
export default userServices
