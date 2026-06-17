import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { formatCLP, formatDistance } from '@/lib/format'
import { DEFAULT_CENTER } from '@/lib/geo'

// Iconos personalizados (divIcon) para evitar el problema de assets de Leaflet en Vite
const pinIcon = (color = '#2F4A3C', label = 'T') =>
  L.divIcon({
    className: 'tatuon-pin',
    html: `<div style="
        background:${color};color:#F5EFE6;width:34px;height:34px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 10px rgba(38,36,31,.35);border:2px solid #fff;">
        <span style="transform:rotate(45deg);font-weight:700;font-size:13px;font-family:Inter,sans-serif;">${label}</span>
      </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  })

const userIcon = L.divIcon({
  className: 'tatuon-user',
  html: `<div style="position:relative;width:18px;height:18px;">
      <span style="position:absolute;inset:0;background:#46715B;opacity:.3;border-radius:50%;animation:pulse 1.6s infinite;"></span>
      <span style="position:absolute;inset:4px;background:#2F4A3C;border:2px solid #fff;border-radius:50%;"></span>
    </div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const Recenter = ({ center }) => {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], map.getZoom())
  }, [center, map])
  return null
}

export const MapView = ({ center, userLocation, markers = [], height = '100%', zoom = 12 }) => {
  const c = center || userLocation || DEFAULT_CENTER
  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200" style={{ height }}>
      <MapContainer center={[c.lat, c.lng]} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>Tu ubicación</Popup>
          </Marker>
        )}

        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.coords.lat, m.coords.lng]}
            icon={pinIcon(m.color, m.label)}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="flex items-center gap-2">
                  {m.avatar && (
                    <img src={m.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-ink">{m.nombre}</p>
                    <p className="text-xs text-ink-muted">{m.comuna}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  {m.rating > 0 && (
                    <span className="inline-flex items-center gap-1 font-medium text-ink">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {m.rating.toFixed(1)}
                    </span>
                  )}
                  {m.tarifa != null && <span className="font-semibold text-forest-700">{formatCLP(m.tarifa)}</span>}
                </div>
                {m.distancia != null && (
                  <p className="mt-1 text-xs text-ink-muted">A {formatDistance(m.distancia)}</p>
                )}
                {m.to && (
                  <Link
                    to={m.to}
                    className="mt-2 block rounded-lg bg-forest-500 px-3 py-1.5 text-center text-xs font-semibold text-sand-50"
                  >
                    Ver perfil
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
