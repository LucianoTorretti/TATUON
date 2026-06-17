import { useState, useEffect } from 'react'
import { Navigation, MapPin, Crosshair } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Button, Select, Badge, Avatar } from '@/components/ui'
import { MapView, StyleSelector } from '@/components/domain'
import { useGeolocation } from '@/hooks/useGeolocation'
import { api } from '@/services'
import { COMUNAS } from '@/lib/geo'
import { Link } from 'react-router-dom'
import { formatCLP, formatDistance } from '@/lib/format'

export default function MapaGeo() {
  const { coords, status, request, setManual } = useGeolocation()
  const [artistas, setArtistas] = useState([])
  const [estilo, setEstilo] = useState('')

  useEffect(() => { request() }, [request])

  useEffect(() => {
    api.listArtistas({ estilo: estilo || undefined, origin: coords, sort: 'distancia' }).then(setArtistas)
  }, [estilo, coords])

  const markers = artistas
    .filter((a) => a.coords)
    .map((a) => ({
      id: a.id_artista,
      coords: a.coords,
      nombre: a.nombre,
      comuna: a.comuna,
      avatar: a.avatar,
      rating: a.rating,
      tarifa: a.tarifa_media,
      distancia: a.distancia,
      label: a.nombre[0],
      to: `/artista/${a.id_artista}`,
      color: '#2F4A3C',
    }))

  return (
    <div>
      <PageHeader
        title="Mapa de artistas"
        subtitle="Encuentra talento verificado cerca de ti."
        action={
          <Button onClick={request} variant="outline">
            <Crosshair className="h-4 w-4" /> Usar mi ubicación
          </Button>
        }
      />

      {/* Controles */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <StyleSelector multi={false} value={estilo} onChange={setEstilo} />
        </div>
        <div className="flex items-center gap-2">
          {status === 'denied' && (
            <Select
              value=""
              onChange={(e) => {
                const c = COMUNAS.find((x) => x.nombre === e.target.value)
                if (c) setManual({ lat: c.lat, lng: c.lng })
              }}
              className="w-44"
            >
              <option value="">Elegir comuna…</option>
              {COMUNAS.map((c) => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
            </Select>
          )}
          <Badge tone={status === 'granted' ? 'forest' : 'amber'} icon={Navigation}>
            {status === 'granted' ? 'Ubicación activa' : status === 'denied' ? 'Ubicación manual' : 'Localizando…'}
          </Badge>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        {/* Mapa */}
        <div className="h-[420px] lg:h-[600px]">
          <MapView center={coords} userLocation={status === 'granted' ? coords : null} markers={markers} height="100%" />
        </div>

        {/* Lista lateral */}
        <div className="space-y-3 lg:max-h-[600px] lg:overflow-y-auto lg:pr-1">
          <p className="text-sm font-medium text-ink-soft">{markers.length} artistas en el mapa</p>
          {artistas.map((a) => (
            <Link
              key={a.id_artista}
              to={`/artista/${a.id_artista}`}
              className="flex items-center gap-3 rounded-2xl border border-sand-200 bg-white p-3 transition hover:border-forest-300 hover:shadow-soft"
            >
              <Avatar src={a.avatar} name={a.nombre} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{a.nombre}</p>
                <p className="flex items-center gap-1 text-xs text-ink-muted">
                  <MapPin className="h-3 w-3" /> {a.comuna}
                  {a.distancia != null && <span>· {formatDistance(a.distancia)}</span>}
                </p>
              </div>
              <span className="text-sm font-bold text-forest-700">{formatCLP(a.tarifa_media)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
