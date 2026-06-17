import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CalendarPlus, MapPin, Building2, Home, Zap, Info } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import {
  PageLoader, Card, Button, Avatar, Badge, Textarea, Select, Input,
} from '@/components/ui'
import { BookingCalendar } from '@/components/domain'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services'
import { useAuth } from '@/hooks/useAuth'
import { formatCLP, formatDateTime } from '@/lib/format'
import { PORCENTAJE_SENA } from '@/lib/constants'

export default function ReservaCita() {
  const { artistaId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: artista, loading } = useAsync(() => api.getArtista(artistaId), [artistaId])
  const { data: reservasArtista } = useAsync(() => api.listReservasArtista(artistaId), [artistaId])

  const [slot, setSlot] = useState(null)
  const [estilo, setEstilo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [valor, setValor] = useState('')
  const [boxId, setBoxId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return <PageLoader />
  if (!artista) return <p className="text-center text-ink-muted">Artista no encontrado.</p>

  const takenSlots = (reservasArtista || [])
    .filter((r) => r.estado_cita !== 'Cancelada')
    .map((r) => r.fecha_hora_inicio)

  const boxes = artista.estudio?.boxes?.filter((b) => b.estado_disponibilidad) || []
  const valorNum = Number(valor) || artista.tarifa_media
  const sena = Math.round(valorNum * PORCENTAJE_SENA)

  const confirmar = async () => {
    if (!slot) return toast.error('Selecciona un bloque horario.')
    if (!estilo) return toast.error('Selecciona el estilo del tatuaje.')
    setSubmitting(true)
    try {
      const fin = new Date(slot)
      fin.setHours(fin.getHours() + 2)
      const reserva = await api.createReserva({
        id_cliente: user.id,
        id_artista: artistaId,
        id_box: boxId || null,
        fecha_hora_inicio: slot,
        fecha_hora_fin: fin.toISOString(),
        valor_total_estimado: valorNum,
        estilo,
        descripcion,
      })
      toast.success('Bloque reservado. Procede al pago de la seña.')
      navigate(`/pago/${reserva.id_reserva}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Reservar cita" subtitle={`Agenda tu sesión con ${artista.nombre}`} back />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Formulario */}
        <div className="space-y-5">
          {/* Calendario */}
          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-ink">
              <CalendarPlus className="h-5 w-5 text-forest-600" /> Elige día y bloque
            </h3>
            <BookingCalendar takenSlots={takenSlots} value={slot} onSelect={setSlot} />
          </Card>

          {/* Detalle del tatuaje */}
          <Card className="p-5">
            <h3 className="mb-4 font-semibold text-ink">Detalle del tatuaje</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Estilo" value={estilo} onChange={(e) => setEstilo(e.target.value)}>
                <option value="">Selecciona…</option>
                {artista.estilos.map((e) => <option key={e} value={e}>{e}</option>)}
              </Select>
              <Input
                label="Valor estimado (CLP)"
                type="number"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder={String(artista.tarifa_media)}
                hint={`Tarifa media: ${formatCLP(artista.tarifa_media)}`}
              />
            </div>
            <div className="mt-4">
              <Textarea
                label="Describe tu idea"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Tamaño, zona del cuerpo, referencias, color o negro…"
              />
            </div>
          </Card>

          {/* Espacio de trabajo (CU-04 vinculación de box) */}
          <Card className="p-5">
            <h3 className="mb-1 font-semibold text-ink">Espacio de trabajo</h3>
            <p className="mb-4 text-sm text-ink-muted">
              Selecciona un box certificado o deja que el artista use su base habitual.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setBoxId('')}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${!boxId ? 'border-forest-500 bg-forest-50' : 'border-sand-300'}`}
              >
                <Home className="h-5 w-5 text-forest-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">Base habitual del artista</p>
                  <p className="text-xs text-ink-muted">{artista.comuna}</p>
                </div>
              </button>
              {boxes.map((b) => (
                <button
                  key={b.id_box}
                  onClick={() => setBoxId(b.id_box)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${boxId === b.id_box ? 'border-forest-500 bg-forest-50' : 'border-sand-300'}`}
                >
                  <Building2 className="h-5 w-5 text-forest-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">{b.nombre_identificador}</p>
                    <p className="text-xs text-ink-muted">{artista.estudio?.nombre_fantasia} · {formatCLP(b.tarifa_hora)}/h</p>
                  </div>
                  <Badge tone="forest" size="sm">Certificado</Badge>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Resumen */}
        <div>
          <div className="sticky top-24 space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <Avatar src={artista.avatar} name={artista.nombre} size="lg" />
                <div>
                  <p className="font-semibold text-ink">{artista.nombre}</p>
                  <p className="flex items-center gap-1 text-xs text-ink-muted">
                    <MapPin className="h-3 w-3" /> {artista.comuna}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-sand-200 pt-4 text-sm">
                <Row label="Fecha y hora" value={slot ? formatDateTime(slot) : 'Sin seleccionar'} />
                <Row label="Estilo" value={estilo || '—'} />
                <Row label="Valor estimado" value={formatCLP(valorNum)} />
                <div className="flex items-center justify-between border-t border-sand-200 pt-3">
                  <span className="font-medium text-ink">Seña a pagar (10%)</span>
                  <span className="font-display text-xl font-bold text-forest-700">{formatCLP(sena)}</span>
                </div>
              </div>

              <Button className="mt-5 w-full" size="lg" onClick={confirmar} loading={submitting} disabled={!slot}>
                Proceder al pago de seña
              </Button>

              <div className="mt-3 flex gap-2 rounded-xl bg-sand-100 p-3 text-xs text-ink-muted">
                <Info className="h-4 w-4 shrink-0 text-forest-600" />
                El bloque se reserva temporalmente. Tu cita se confirma solo al pagar la seña.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-ink-muted">{label}</span>
    <span className="font-medium text-ink">{value}</span>
  </div>
)
