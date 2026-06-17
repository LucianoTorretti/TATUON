import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  MapPin, Star, Instagram, Zap, ShieldCheck, CalendarPlus, Building2, ChevronLeft,
} from 'lucide-react'
import { PageHeader } from '@/components/layout'
import {
  Avatar, Badge, Button, Stars, VerificationBadge, Tabs, PageLoader, Card,
} from '@/components/ui'
import { PortfolioGrid, ReviewList } from '@/components/domain'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services'
import { formatCLP } from '@/lib/format'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/lib/constants'

export default function PerfilArtista() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: artista, loading } = useAsync(() => api.getArtista(id), [id])
  const [tab, setTab] = useState('portafolio')
  const [estiloFiltro, setEstiloFiltro] = useState('')

  if (loading) return <PageLoader />
  if (!artista) return <p className="text-center text-ink-muted">Artista no encontrado.</p>

  const cover = artista.portafolio?.[0]?.url || `https://picsum.photos/seed/${id}-cover/1200/400`

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition hover:text-forest-600"
      >
        <ChevronLeft className="h-4 w-4" /> Volver
      </button>

      {/* Cover + cabecera */}
      <div className="overflow-hidden rounded-3xl border border-sand-200 bg-white">
        <div className="relative h-40 sm:h-56">
          <img src={cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
        </div>
        <div className="px-5 pb-5 sm:px-8">
          {/* Avatar sobresale de la foto de portada; nombre y CTA van abajo */}
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <Avatar src={artista.avatar} name={artista.nombre} size="xl" ring className="-mt-12" />
              <div className="sm:pb-2">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-ink">{artista.nombre}</h1>
                  <VerificationBadge estado={artista.estado_verificacion} size="sm" />
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {artista.comuna}</span>
                  {artista.rating > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {artista.rating.toFixed(1)} ({artista.total_resenas})
                    </span>
                  )}
                  {artista.instagram && (
                    <span className="inline-flex items-center gap-1"><Instagram className="h-3.5 w-3.5" /> {artista.instagram}</span>
                  )}
                </p>
              </div>
            </div>

            {user?.tipo_rol === ROLES.CLIENTE && (
              <Button as={Link} to={`/reservar/${artista.id_artista}`} size="lg" className="shrink-0">
                <CalendarPlus className="h-4 w-4" /> Reservar cita
              </Button>
            )}
          </div>

          {/* Meta */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {artista.estilos.map((e) => <Badge key={e} tone="sand">{e}</Badge>)}
            {artista.flash_disponible && <Badge tone="clay" icon={Zap}>Flash disponible</Badge>}
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">{artista.biografia}</p>

          {/* Tarifa + estudio */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl bg-sand-100 px-4 py-3">
              <span className="text-sm text-ink-muted">Tarifa media</span>
              <span className="font-display text-lg font-bold text-forest-700">{formatCLP(artista.tarifa_media)}</span>
            </div>
            {artista.estudio && (
              <Link
                to="#"
                className="flex items-center gap-3 rounded-2xl bg-sand-100 px-4 py-3"
              >
                <Building2 className="h-5 w-5 text-forest-600" />
                <div>
                  <p className="text-sm font-medium text-ink">{artista.estudio.nombre_fantasia}</p>
                  <p className="text-xs text-ink-muted">{artista.estudio.comuna} · Box certificado</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'portafolio', label: 'Portafolio', count: artista.portafolio?.length },
            { value: 'resenas', label: 'Reseñas', count: artista.resenas?.length },
          ]}
        />

        <div className="mt-5">
          {tab === 'portafolio' && (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setEstiloFiltro('')}
                  className={`rounded-full border px-3 py-1 text-sm ${!estiloFiltro ? 'border-forest-500 bg-forest-500 text-sand-50' : 'border-sand-300 text-ink-soft'}`}
                >
                  Todos
                </button>
                {artista.estilos.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEstiloFiltro(e)}
                    className={`rounded-full border px-3 py-1 text-sm ${estiloFiltro === e ? 'border-forest-500 bg-forest-500 text-sand-50' : 'border-sand-300 text-ink-soft'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <PortfolioGrid items={artista.portafolio || []} filterEstilo={estiloFiltro} />
            </>
          )}

          {tab === 'resenas' && (
            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
              <Card className="h-fit p-5 text-center">
                <p className="font-display text-5xl font-bold text-ink">{artista.rating?.toFixed(1) || '0.0'}</p>
                <div className="mt-2 flex justify-center"><Stars value={artista.rating} size="md" /></div>
                <p className="mt-1 text-sm text-ink-muted">{artista.total_resenas} reseñas verificadas</p>
                <div className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-forest-50 py-2 text-xs font-medium text-forest-700">
                  <ShieldCheck className="h-3.5 w-3.5" /> Solo citas ejecutadas
                </div>
              </Card>
              <ReviewList resenas={artista.resenas || []} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
