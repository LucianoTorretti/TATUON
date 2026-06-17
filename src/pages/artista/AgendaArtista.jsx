import { useState } from 'react'
import toast from 'react-hot-toast'
import { CalendarClock, Clock, Check, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Card, Avatar, Button, Tabs, CitaBadge, PageLoader, EmptyState, Badge } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services'
import { ESTADO_CITA } from '@/lib/constants'
import { formatDateTime, formatCLP } from '@/lib/format'

export default function AgendaArtista() {
  const { user } = useAuth()
  const { data: reservas, loading, reload } = useAsync(() => api.listReservasArtista(user.id), [user.id])
  const [tab, setTab] = useState('proximas')
  const [busy, setBusy] = useState(null)

  if (loading) return <PageLoader />

  const lista = reservas || []
  const filtradas = lista.filter((r) => {
    if (tab === 'proximas') return [ESTADO_CITA.CONFIRMADA, ESTADO_CITA.PENDIENTE_PAGO].includes(r.estado_cita)
    return [ESTADO_CITA.EJECUTADA, ESTADO_CITA.CANCELADA].includes(r.estado_cita)
  })

  // El artista marca la cita como ejecutada al finalizar (habilita la reseña)
  const marcarEjecutada = async (r) => {
    setBusy(r.id_reserva)
    await api.updateReservaEstado(r.id_reserva, ESTADO_CITA.EJECUTADA)
    await reload()
    setBusy(null)
    toast.success('Cita marcada como ejecutada. El cliente ya puede dejar su reseña.')
  }

  return (
    <div>
      <PageHeader title="Mi agenda" subtitle="Gestiona tus citas confirmadas y su ejecución." />

      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-6 max-w-xs"
        tabs={[
          { value: 'proximas', label: 'Próximas', count: lista.filter((r) => [ESTADO_CITA.CONFIRMADA, ESTADO_CITA.PENDIENTE_PAGO].includes(r.estado_cita)).length },
          { value: 'historial', label: 'Historial', count: lista.filter((r) => [ESTADO_CITA.EJECUTADA, ESTADO_CITA.CANCELADA].includes(r.estado_cita)).length },
        ]}
      />

      {filtradas.length ? (
        <div className="space-y-3">
          {filtradas.map((r) => (
            <Card key={r.id_reserva} className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={r.cliente?.avatar} name={r.cliente?.nombre} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink">{r.cliente?.nombre}</p>
                      <CitaBadge estado={r.estado_cita} size="sm" />
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-ink-muted">
                      <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formatDateTime(r.fecha_hora_inicio)}</span>
                      <Badge tone="sand" size="sm">{r.estilo}</Badge>
                      {r.box && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {r.box.nombre_identificador}</span>}
                    </p>
                    {r.descripcion && <p className="mt-1 text-sm text-ink-soft">{r.descripcion}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-right">
                    <span className="block text-xs text-ink-muted">Valor</span>
                    <span className="block font-semibold text-forest-700">{formatCLP(r.valor_total_estimado)}</span>
                  </span>
                  {r.estado_cita === ESTADO_CITA.CONFIRMADA && (
                    <Button size="sm" onClick={() => marcarEjecutada(r)} loading={busy === r.id_reserva}>
                      <Check className="h-4 w-4" /> Marcar ejecutada
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon={CalendarClock} title="Sin citas en esta vista" description="Tus reservas aparecerán aquí cuando los clientes agenden." />
      )}
    </div>
  )
}
