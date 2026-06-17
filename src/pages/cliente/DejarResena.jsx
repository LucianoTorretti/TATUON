import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { PageLoader, Card, Avatar, Badge, Button } from '@/components/ui'
import { ReviewForm } from '@/components/domain'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services'
import { formatDateTime } from '@/lib/format'

export default function DejarResena() {
  const { reservaId } = useParams()
  const navigate = useNavigate()
  const { data: reserva, loading } = useAsync(() => api.getReserva(reservaId), [reservaId])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  if (loading) return <PageLoader />
  if (!reserva) return <p className="text-center text-ink-muted">Reserva no encontrada.</p>

  const permitido = api.puedeResenar(reserva)

  const submit = async ({ puntaje, comentario }) => {
    setSubmitting(true)
    try {
      await api.crearResena(reservaId, { puntaje, comentario })
      setDone(true)
      toast.success('¡Gracias por tu reseña verificada!')
      setTimeout(() => navigate('/cliente/reservas'), 1400)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Evaluar experiencia" subtitle="Tu opinión ayuda a toda la comunidad." back />

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-sand-200 pb-5">
          <Avatar src={reserva.artista?.avatar} name={reserva.artista?.nombre} size="lg" />
          <div>
            <p className="font-semibold text-ink">{reserva.artista?.nombre}</p>
            <p className="text-sm text-ink-muted">{reserva.estilo} · {formatDateTime(reserva.fecha_hora_inicio)}</p>
          </div>
        </div>

        {done ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-forest-500" />
            <p className="mt-3 font-semibold text-ink">Reseña publicada</p>
          </div>
        ) : permitido ? (
          <ReviewForm onSubmit={submit} submitting={submitting} />
        ) : (
          // Validación lógica fallida (CU-06 3.a)
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-amber-500" />
            <h3 className="mt-3 font-semibold text-ink">No puedes evaluar esta cita</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-amber-800">
              Las reseñas solo se habilitan para citas en estado <Badge tone="forest" size="sm">Ejecutada</Badge> con
              la seña pagada, y que aún no hayan sido evaluadas. Esto garantiza reseñas verificadas y evita el fraude.
            </p>
            <Button as={Link} to="/cliente/reservas" variant="outline" className="mt-5">
              <ArrowLeft className="h-4 w-4" /> Volver a mis reservas
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
