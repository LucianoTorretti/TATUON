import { useState } from 'react'
import { Avatar, Stars, RatingInput, Button, Textarea, EmptyState } from '@/components/ui'
import { MessageSquareQuote } from 'lucide-react'
import { timeAgo } from '@/lib/format'

// Formulario de reseña (RF-06 / CU-06)
export const ReviewForm = ({ onSubmit, submitting }) => {
  const [puntaje, setPuntaje] = useState(0)
  const [comentario, setComentario] = useState('')
  const [error, setError] = useState(null)

  const handle = (e) => {
    e.preventDefault()
    if (puntaje === 0) return setError('Selecciona una puntuación de 1 a 5 estrellas.')
    if (comentario.trim().length < 10) return setError('Escribe un comentario de al menos 10 caracteres.')
    setError(null)
    onSubmit({ puntaje, comentario: comentario.trim() })
  }

  return (
    <form onSubmit={handle} className="space-y-4">
      <div className="text-center">
        <p className="mb-2 text-sm font-medium text-ink-soft">¿Cómo fue tu experiencia?</p>
        <div className="flex justify-center">
          <RatingInput value={puntaje} onChange={setPuntaje} />
        </div>
      </div>
      <Textarea
        label="Tu reseña"
        placeholder="Cuéntanos sobre el resultado, la atención y el espacio de trabajo…"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        error={error}
      />
      <Button type="submit" className="w-full" loading={submitting}>
        Publicar reseña verificada
      </Button>
    </form>
  )
}

export const ReviewList = ({ resenas = [] }) => {
  if (!resenas.length) {
    return (
      <EmptyState
        icon={MessageSquareQuote}
        title="Aún no hay reseñas"
        description="Las reseñas se habilitan solo tras una cita ejecutada y pagada (verificadas)."
      />
    )
  }
  return (
    <div className="space-y-4">
      {resenas.map((r) => (
        <div key={r.id_resena} className="rounded-2xl border border-sand-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={r.cliente?.avatar} name={r.cliente?.nombre} size="sm" />
              <div>
                <p className="text-sm font-semibold text-ink">{r.cliente?.nombre || 'Cliente'}</p>
                <p className="text-xs text-ink-muted">{timeAgo(r.fecha_publicacion)}</p>
              </div>
            </div>
            <Stars value={r.puntaje_estrellas} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{r.comentario}</p>
        </div>
      ))}
    </div>
  )
}
