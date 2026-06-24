import api from './api'

const paymentService = {
  // ── PayPal ──
  paypalCreate: (amount, returnUrl, cancelUrl) =>
    api.post('/orders/paypal/create', { amount, returnUrl, cancelUrl }).then(r => r.data),

  paypalCapture: (paypalOrderId, orderId) =>
    api.post('/orders/paypal/capture', { paypalOrderId, orderId }).then(r => r.data),

  // ── Grow (via Make) ──
  // Crée le lien de paiement Grow et renvoie { paymentUrl, processId }
  growCreate: (orderId, amount, customer) =>
    api.post('/orders/grow/create', { orderId, amount, customer }).then(r => r.data),
}

export default paymentService