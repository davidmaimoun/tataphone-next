// Statuts stockés en ANGLAIS dans la DB. Affichés en HÉBREU au front.
// Source de vérité unique — utilisée par Orders, Dashboard, Accounting.

export const ORDER_STATUSES = ['pending', 'approved', 'shipped', 'completed', 'cancelled']

export const STATUS_LABEL = {
  pending:   'ממתין',
  approved:  'אושר',
  shipped:   'נשלח',
  completed: 'הושלם',
  cancelled: 'בוטל',
}

export const STATUS_STYLE = {
  pending:   { bg:'#FEF3C7', color:'#B45309' },
  approved:  { bg:'#FAF3EF', color:'var(--primary-deep)' },
  shipped:   { bg:'#EDE9FE', color:'#6D28D9' },
  completed: { bg:'#D1FAE5', color:'#065F46' },
  cancelled: { bg:'#FEE2E2', color:'#B91C1C' },
}

// Compat : si une vieille commande a encore un statut hébreu en base,
// on le reconvertit en clé anglaise pour l'affichage.
const LEGACY_HE_TO_EN = {
  'ממתין':'pending', 'אושר':'approved', 'נשלח':'shipped', 'הושלם':'completed', 'בוטל':'cancelled',
}
export function normalizeStatus(s) {
  if (!s) return 'pending'
  if (ORDER_STATUSES.includes(s)) return s
  return LEGACY_HE_TO_EN[s] || 'pending'
}
export function statusLabel(s) { return STATUS_LABEL[normalizeStatus(s)] || s }
export function statusStyle(s) { return STATUS_STYLE[normalizeStatus(s)] || { bg:'#F1F5F9', color:'#64748B' } }

// Format date léger (remplace dayjs)
export function fmtDate(d, withTime = false) {
  if (!d) return '—'
  try {
    const date = new Date(d)
    const opts = withTime
      ? { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' }
      : { day:'2-digit', month:'2-digit', year:'2-digit' }
    return date.toLocaleDateString('he-IL', opts)
  } catch { return '—' }
}
