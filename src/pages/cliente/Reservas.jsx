import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, MapPin, Star, CreditCard, Receipt, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Card, Avatar, Button, Tabs, CitaBadge, PageLoader, EmptyState, Badge } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services'
import { useAuth } from '@/hooks/useAuth'
import { ESTADO_CITA } from '@/lib/constants'
import { formatDateTime, formatCLP } from '@/lib/format'

export default function Reservas() {
  const { user } = useAuth()
  const { data: reservas, loading } = useAsync(() => api.listReservasCliente(user.id), [user.id])
  const [tab, setTab] = useState('todas')

  if (loading) return <PageLoader />

  const filtradas = (reservas || []).filter((r) => {
    if (tab === 'proximas') return [ESTADO_CITA.CONFIRMADA, ESTADO_CITA.PENDIENTE_PAGO].includes(r.estado_cita)
    if (tab === 'historial') return [ESTADO_CITA.EJECUTADA, ESTADO_CITA.CANCELADA].includes(r.estado_cita)
    return true
  })

  const count = (estados) => (reservas || []).filter((r) => estados.includes(r.estado_cita)).length

  return (
    <div>
      <PageHeader title="Mis reservas" subtitle="Gestiona tus citas y deja tus reseñas." />

      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-6 max-w-md"
        tabs={[
          { value: 'todas', label: 'Todas', count: reservas?.length },
          { value: 'proximas', label: 'Próximas', count: count([ESTADO_CITA.CONFIRMADA, ESTADO_CITA.PENDIENTE_PAGO]) },
          { value: 'historial', label: 'Historial', count: count([ESTADO_CITA.EJECUTADA, ESTADO_CITA.CANCELADA]) },
        ]}
      />

      {filtradas.length ? (
        <div className="space-y-3">
          {filtradas.map((r) => (
            <Card key={r.id_reserva} className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={r.artista?.avatar} name={r.artista?.nombre} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink">{r.artista?.nombre}</p>
                      <CitaBadge estado={r.estado_cita} size="sm" />
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-ink-muted">
                      <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> {formatDateTime(r.fecha_hora_inicio)}</span>
                      <Badge tone="sand" size="sm">{r.estilo}</Badge>
                      {r.estudio && (
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {r.estudio.nombre_fantasia}</span>
                      )}
                    </p>
                    {r.pago && (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-muted">
                        <Receipt className="h-3 w-3" /> Seña {formatCLP(r.pago.monto_sena)} · {r.pago.token_transbank}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {r.estado_cita === ESTADO_CITA.PENDIENTE_PAGO && (
                    <Button as={Link} to={`/pago/${r.id_reserva}`} size="sm">
                      <CreditCard className="h-4 w-4" /> Pagar seña
                    </Button>
                  )}
                  {r.estado_cita === ESTADO_CITA.EJECUTADA && !r.resena && (
                    <Button as={Link} to={`/resena/${r.id_reserva}`} size="sm">
                      <Star className="h-4 w-4" /> Dejar reseña
                    </Button>
                  )}
                  {r.resena && (
                    <Badge tone="forest" icon={Star} size="sm">Reseñada</Badge>
                  )}
                  <Button as={Link} to={`/artista/${r.id_artista}`} variant="ghost" size="sm">
                    Ver artista
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No hay reservas aquí"
          description="Cuando agendes una cita aparecerá en esta lista."
          action={<Button as={Link} to="/buscar">Buscar artistas</Button>}
        />
      )}
    </div>
  )
}
