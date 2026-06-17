import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle2, MapPin, CalendarClock, ArrowRight, Receipt } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { PageLoader, Card, Avatar, Badge, Button } from '@/components/ui'
import { PaymentWebpay } from '@/components/domain'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services'
import { formatCLP, formatDateTime } from '@/lib/format'
import { PORCENTAJE_SENA } from '@/lib/constants'

export default function PagoSena() {
  const { reservaId } = useParams()
  const navigate = useNavigate()
  const { data: reserva, loading, reload } = useAsync(() => api.getReserva(reservaId), [reservaId])
  const [done, setDone] = useState(false)
  const [result, setResult] = useState(null)

  if (loading) return <PageLoader />
  if (!reserva) return <p className="text-center text-ink-muted">Reserva no encontrada.</p>

  const sena = Math.round(reserva.valor_total_estimado * PORCENTAJE_SENA)

  const handleResult = async (exito) => {
    try {
      const res = await api.procesarPago(reservaId, { exito })
      setResult(res)
      setDone(true)
      toast.success('¡Cita confirmada! Notificamos al artista.')
    } catch (err) {
      toast.error(err.message)
      reload()
      // Tras rechazo, el bloque se libera (CU-05 5.a)
      setTimeout(() => navigate('/cliente/reservas'), 1500)
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg py-8">
        <Card className="overflow-hidden">
          <div className="bg-forest-600 px-6 py-10 text-center text-sand-50">
            <CheckCircle2 className="mx-auto h-16 w-16" />
            <h1 className="mt-4 font-display text-2xl font-bold">¡Reserva confirmada!</h1>
            <p className="mt-1 text-forest-100">Tu seña fue procesada con éxito.</p>
          </div>
          <div className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <Avatar src={reserva.artista?.avatar} name={reserva.artista?.nombre} size="lg" />
              <div>
                <p className="font-semibold text-ink">{reserva.artista?.nombre}</p>
                <p className="text-sm text-ink-muted">{reserva.estilo}</p>
              </div>
            </div>
            <div className="space-y-2 rounded-2xl bg-sand-100 p-4 text-sm">
              <Row icon={CalendarClock} label="Fecha" value={formatDateTime(reserva.fecha_hora_inicio)} />
              <Row icon={Receipt} label="Seña pagada" value={formatCLP(result?.montoSena || sena)} />
              <Row icon={MapPin} label="Comprobante" value={result?.pago?.token_transbank} />
            </div>
            <div className="flex gap-3">
              <Button as={Link} to="/cliente/reservas" className="flex-1">
                Ver mis reservas <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as={Link} to="/buscar" variant="outline">Explorar más</Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Pago de seña" subtitle="Confirma tu cita con un depósito del 10%." back />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Pasarela */}
        <div>
          <PaymentWebpay monto={sena} onResult={handleResult} />
        </div>

        {/* Resumen */}
        <Card className="h-fit p-5">
          <h3 className="mb-4 font-semibold text-ink">Resumen de la reserva</h3>
          <div className="flex items-center gap-3">
            <Avatar src={reserva.artista?.avatar} name={reserva.artista?.nombre} size="md" />
            <div>
              <p className="font-semibold text-ink">{reserva.artista?.nombre}</p>
              <Badge tone="sand" size="sm">{reserva.estilo}</Badge>
            </div>
          </div>
          <div className="mt-4 space-y-2 border-t border-sand-200 pt-4 text-sm">
            <Row label="Fecha y hora" value={formatDateTime(reserva.fecha_hora_inicio)} />
            <Row label="Valor total estimado" value={formatCLP(reserva.valor_total_estimado)} />
            {reserva.box && <Row label="Box" value={reserva.box.nombre_identificador} />}
            <div className="flex items-center justify-between border-t border-sand-200 pt-2">
              <span className="font-medium text-ink">Seña (10%)</span>
              <span className="font-display text-lg font-bold text-forest-700">{formatCLP(sena)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

const Row = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between">
    <span className="flex items-center gap-1.5 text-ink-muted">
      {Icon && <Icon className="h-3.5 w-3.5" />} {label}
    </span>
    <span className="font-medium text-ink">{value}</span>
  </div>
)
