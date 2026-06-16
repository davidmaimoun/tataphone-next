import api from './api'

const metaService = {
  get: (col) => api.get(`/meta/${col}`).then(r => r.data[col] || r.data || []).catch(() => []),
  add: (col, name) => api.post(`/meta/${col}`, { name }).then(r => r.data),
  delete: (col, name) => api.delete(`/meta/${col}/${encodeURIComponent(name)}`).then(r => r.data),
  getColors: () => api.get('/products/meta/colors').then(r => r.data.colors || r.data || []).catch(() => []),
}
export default metaService
