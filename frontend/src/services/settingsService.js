import api from './api'

const settingsService = {
  get: async () => (await api.get('/settings')).data,
  update: async (data) => (await api.put('/settings', data)).data,
}

export default settingsService

// Helper partagé : calcule la livraison selon les settings (même logique que le backend)
export function computeShipping(productsTotal, settings) {
  if (!settings || productsTotal <= 0) return 0
  if (settings.freeShippingEnabled && productsTotal >= Number(settings.freeShippingThreshold || 0)) return 0
  if (settings.shippingType === 'percent') {
    return Math.round((productsTotal * Number(settings.shippingValue || 0) / 100) * 100) / 100
  }
  return Number(settings.shippingValue || 0)
}