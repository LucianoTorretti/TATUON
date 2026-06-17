import { Link } from 'react-router-dom'
import {
  CalendarClock, Star, CircleDollarSign, Images, TrendingUp, Eye, ArrowRight, Clock,
} from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Card, Avatar, Button, Badge, CitaBadge, PageLoader } from '@/components/ui'
import { StatCard, VerificationBanner } from '@/components/domain'
import { useAuth } from '@/hooks/useAuth'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services'
import { ESTADO_CITA, ESTADO_PAGO } from '@/lib/constants'
import { formatCLP, formatDateTime } from '@/lib/format'

export default function ArtistaDashboard() {
  const { user } = useAuth()
  const estado = user.detalle?.estado_verificacion
  const { data: artista, loading } = useAsync(() => api.getArtista(user.id), [user.id])
  const { data: reservas } = useAsync(() => api.listReservasArtista(user.id), [user.id])

  if (loading) return <PageLoader />

  const lista = reservas || []
  const proximas = lista.filter((r) => [ESTADO_CITA.CONFIRMADA, ESTADO_CITA.PENDIENTE_PAGO].includes(r.estado_cita))
  const ingresos = lista
    .filter((r) => r.pago?.estado_pago === ESTADO_PAGO.APROBADO)
    .reduce((s, r) => s + r.pago.monto_sena, 0)

  return (
    <div>
      <PageHeader
        title={`Hola, ${user.nombre.split(' ')[0]}`}
        subtitle="Tu panel de artista: agenda, ingresos y reputación."
        action={
          <Button as={Link} to="/artista/portafolio" variant="outline">
            <Images className="h-4 w-4" /> Mi portafolio
          </Button>
        }
      />

      <VerificationBanner estado={estado} />

      {/* Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Star} label="Reputación" value={artista?.rating > 0 ? artista.rating.toFixed(1) : '—'} trend={`${artista?.total_resenas || 0} reseñas`} />
        <StatCard icon={CalendarClock} label="Próximas citas" value={proximas.length} tone="amber" />
        <StatCard icon={CircleDollarSign} label="Señas recibidas" value={formatCLP(ingresos)} tone="clay" trend="Acumulado" />
        <StatCard icon={Images} label="Portafolio" value={artista?.portafolio?.length || 0} trend="piezas publicadas" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Próximas citas */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Próximas citas</h2>
            <Link to="/artista/agenda" className="text-sm font-medium text-forest-600 hover:text-forest-700">Ver agenda</Link>
          </div>
          {proximas.length ? (
            <div className="space-y-3">
              {proximas.map((r) => (
                <Card key={r.id_reserva} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={r.cliente?.avatar} name={r.cliente?.nombre} size="md" />
                    <div>
                      <p className="font-semibold text-ink">{r.cliente?.nombre}</p>
                      <p className="flex items-center gap-1 text-sm text-ink-muted">
                        <Clock className="h-3.5 w-3.5" /> {formatDateTime(r.fecha_hora_inicio)} · {r.estilo}
                      </p>
                    </div>
                  </div>
                  <CitaBadge estado={r.estado_cita} size="sm" />
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-sm text-ink-muted">
              No tienes citas próximas. Mantén tu portafolio y disponibilidad al día para atraer clientes.
            </Card>
          )}
        </div>

        {/* Perfil resumen */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Avatar src={user.avatar} name={user.nombre} size="lg" />
              <div>
                <p className="font-semibold text-ink">{user.nombre}</p>
                <p className="text-sm text-ink-muted">{artista?.comuna}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {(artista?.estilos || []).map((e) => <Badge key={e} tone="sand" size="sm">{e}</Badge>)}
            </div>
            <Button as={Link} to={`/artista/${user.id}`} variant="outline" size="sm" className="mt-4 w-full">
              <Eye className="h-4 w-4" /> Ver mi perfil público
            </Button>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
              <TrendingUp className="h-4 w-4 text-forest-600" /> Consejos para crecer
            </h3>
            <ul className="space-y-2 text-sm text-ink-muted">
              <li>· Sube al menos 6 trabajos por estilo.</li>
              <li>· Mantén tu disponibilidad actualizada.</li>
              <li>· Responde rápido para mejorar tu reputación.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
