import api from './api'

const promotionService = {
  getAll: () => api.get('/promotions/').then(r => r.data),
  create: (data) => api.post('/promotions/', data).then(r => r.data),
  update: (id, data) => api.put(`/promotions/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/promotions/${id}`).then(r => r.data),
  applyDiscount: (data) => api.post('/promotions/apply', data).then(r => r.data),
}
export default promotionService
