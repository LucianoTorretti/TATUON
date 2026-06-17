// =============================================================
// Utilidades de geolocalización (RF-02 / CU-02)
// =============================================================

// Coordenada por defecto: Plaza de Armas, Santiago (fallback si no hay GPS)
export const DEFAULT_CENTER = { lat: -33.4372, lng: -70.6506 }

// Comunas con coordenadas reales (para ubicación manual — flujo alternativo CU-02 2.a)
export const COMUNAS = [
  { nombre: 'Santiago Centro', lat: -33.4372, lng: -70.6506 },
  { nombre: 'Providencia', lat: -33.4264, lng: -70.6189 },
  { nombre: 'Ñuñoa', lat: -33.4569, lng: -70.5994 },
  { nombre: 'Las Condes', lat: -33.4085, lng: -70.5673 },
  { nombre: 'Bellavista', lat: -33.4326, lng: -70.6347 },
  { nombre: 'Valparaíso', lat: -33.0472, lng: -71.6127 },
]

// Distancia Haversine en km
export const haversine = (a, b) => {
  if (!a || !b) return null
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(x))
}

const toRad = (deg) => (deg * Math.PI) / 180
