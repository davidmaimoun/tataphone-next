const MAP = {
  'שחור':'#1a1a1a', 'לבן':'#ffffff', 'כסף':'#C0C0C0', 'אפור':'#808080',
  'זהב':'#D4AF37', 'ורוד':'#FFC0CB', 'אדום':'#DC2626', 'כחול':'#2563EB',
  'ירוק':'#16A34A', 'סגול':'#7C3AED', 'כתום':'#EA580C', 'צהוב':'#FACC15',
  'חום':'#92400E', 'טיטניום':'#878681', 'שמפניה':'#F7E7CE', 'תכלת':'#7DD3FC',
  'בז׳':'#E8D9C0', 'נייבי':'#1E3A8A', 'בורדו':'#7F1D1D',
}
export function colorToCss(name) {
  if (!name) return null
  const k = String(name).trim()
  if (MAP[k]) return MAP[k]
  // accept direct CSS (#hex or english)
  if (/^#[0-9A-Fa-f]{3,8}$/.test(k)) return k
  if (/^[a-z]+$/i.test(k)) return k.toLowerCase()
  return null
}
export function isLight(css) {
  if (!css) return false
  let hex = css
  if (hex === 'white' || hex === '#ffffff' || hex === '#fff') return true
  if (!hex.startsWith('#')) return ['white','silver','beige','ivory','khaki','gold','yellow','pink'].includes(hex)
  hex = hex.replace('#','')
  if (hex.length === 3) hex = hex.split('').map(c => c+c).join('')
  const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16)
  return (0.299*r + 0.587*g + 0.114*b) > 186
}
