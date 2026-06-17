// =============================================================
// Helpers de formato (CLP, fechas, distancias, texto)
// =============================================================

const CLP = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export const formatCLP = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '$0'
  return CLP.format(Number(value))
}

export const formatNumber = (value) =>
  new Intl.NumberFormat('es-CL').format(Number(value || 0))

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export const formatDate = (input) => {
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

export const formatDateShort = (input) => {
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const formatDateTime = (input) => {
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  return `${d.getDate()} ${MESES[d.getMonth()].slice(0, 3)}, ${formatTime(d)}`
}

export const formatTime = (input) => {
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export const formatDayName = (input) => {
  const d = new Date(input)
  return DIAS[d.getDay()]
}

// "hace 3 días", "hace 2 h" — tiempo relativo
export const timeAgo = (input) => {
  const d = new Date(input)
  const diff = Date.now() - d.getTime()
  const sec = Math.round(diff / 1000)
  const min = Math.round(sec / 60)
  const hr = Math.round(min / 60)
  const day = Math.round(hr / 24)
  if (sec < 60) return 'recién'
  if (min < 60) return `hace ${min} min`
  if (hr < 24) return `hace ${hr} h`
  if (day < 30) return `hace ${day} ${day === 1 ? 'día' : 'días'}`
  return formatDateShort(input)
}

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('')

export const truncate = (str = '', n = 120) =>
  str.length > n ? `${str.slice(0, n).trim()}…` : str

export const formatDistance = (km) => {
  if (km === null || km === undefined) return ''
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}
