import api from './api'

const wishlistService = {
  getAll: () => api.get('/wishlist/').then(r => r.data),
  getIds: () => api.get('/wishlist/ids').then(r => r.data),
  toggle: (productId) => api.post('/wishlist/toggle', { productId }).then(r => r.data),
}
export default wishlistService
