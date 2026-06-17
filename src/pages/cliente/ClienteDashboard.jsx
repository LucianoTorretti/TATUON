import { Link } from 'react-router-dom'
import { Search, Map, CalendarClock, Star, Zap, ArrowRight, Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Card, Button, Avatar, Skeleton, Badge } from '@/components/ui'
import { ArtistCard, StatCard } from '@/components/domain'
import { useAuth } from '@/hooks/useAuth'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services'
import { ESTADO_CITA } from '@/lib/constants'
import { formatDateTime } from '@/lib/format'

export default function ClienteDashboard() {
  const { user } = useAuth()
  const { data: artistas, loading } = useAsync(() => api.listArtistas({ sort: 'rating' }), [])
  const { data: reservas } = useAsync(() => api.listReservasCliente(user.id), [user.id])

  const proximas = (reservas || []).filter(
    (r) => r.estado_cita === ESTADO_CITA.CONFIRMADA || r.estado_cita === ESTADO_CITA.PENDIENTE_PAGO,
  )
  const destacados = (artistas || []).slice(0, 4)

  return (
    <div>
      <PageHeader
        title={`Hola, ${user.nombre.split(' ')[0]} 👋`}
        subtitle="Descubre artistas, agenda tu próxima sesión y gestiona tus reservas."
        action={
          <Button as={Link} to="/buscar">
            <Search className="h-4 w-4" /> Buscar artistas
          </Button>
        }
      />

      {/* Accesos rápidos */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/buscar">
          <StatCard icon={Search} label="Explorar" value="Buscador" trend="Filtra por estilo y precio" />
        </Link>
        <Link to="/mapa">
          <StatCard icon={Map} label="Cerca de ti" value="Mapa" tone="clay" trend="Estudios certificados" />
        </Link>
        <Link to="/cliente/reservas">
          <StatCard icon={CalendarClock} label="Tus citas" value={reservas?.length ?? '—'} tone="amber" trend="Ver historial" />
        </Link>
      </div>

      {/* Próximas citas */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Próximas citas</h2>
          <Link to="/cliente/reservas" className="text-sm font-medium text-forest-600 hover:text-forest-700">
            Ver todas
          </Link>
        </div>
        {proximas.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {proximas.slice(0, 2).map((r) => (
              <Card key={r.id_reserva} className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar src={r.artista?.avatar} name={r.artista?.nombre} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{r.artista?.nombre}</p>
                    <p className="text-sm text-ink-muted">{r.estilo} · {formatDateTime(r.fecha_hora_inicio)}</p>
                  </div>
                  {r.estado_cita === ESTADO_CITA.PENDIENTE_PAGO ? (
                    <Button as={Link} to={`/pago/${r.id_reserva}`} size="sm">Pagar seña</Button>
                  ) : (
                    <Badge tone="blue">Confirmada</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-ink">Aún no tienes citas próximas</p>
                <p className="text-sm text-ink-muted">Encuentra a tu artista ideal y reserva hoy.</p>
              </div>
            </div>
            <Button as={Link} to="/buscar" variant="outline" size="sm" className="hidden sm:inline-flex">
              Explorar <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        )}
      </div>

      {/* Artistas destacados */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-ink">
            <Star className="h-5 w-5 text-amber-500" /> Artistas destacados
          </h2>
          <Link to="/buscar" className="text-sm font-medium text-forest-600 hover:text-forest-700">
            Ver más
          </Link>
        </div>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-72" />)}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {destacados.map((a) => <ArtistCard key={a.id_artista} artista={a} />)}
          </div>
        )}
      </div>
    </div>
  )
}
