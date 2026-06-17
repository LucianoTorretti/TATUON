import { Link } from 'react-router-dom'
import { Box, MapPin, ShieldCheck, CircleDollarSign, Star, Plus, Building2 } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Card, Button, Badge, PageLoader, VerificationBadge } from '@/components/ui'
import { StatCard, VerificationBanner, BoxCard } from '@/components/domain'
import { useAuth } from '@/hooks/useAuth'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services'
import { formatCLP } from '@/lib/format'

export default function EstudioDashboard() {
  const { user } = useAuth()
  const estado = user.detalle?.estado_certificacion
  const { data: estudio, loading } = useAsync(() => api.getEstudio(user.id), [user.id])

  if (loading) return <PageLoader />

  const boxes = estudio?.boxes || []
  const disponibles = boxes.filter((b) => b.estado_disponibilidad).length
  const tarifaProm = boxes.length ? Math.round(boxes.reduce((s, b) => s + b.tarifa_hora, 0) / boxes.length) : 0

  return (
    <div>
      <PageHeader
        title={estudio?.nombre_fantasia || user.nombre}
        subtitle="Panel del estudio: boxes, certificación y rendimiento."
        action={<Button as={Link} to="/estudio/boxes"><Plus className="h-4 w-4" /> Gestionar boxes</Button>}
      />

      <VerificationBanner estado={estado} to="/estudio/verificacion" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Box} label="Boxes totales" value={boxes.length} trend={`${disponibles} disponibles`} />
        <StatCard icon={CircleDollarSign} label="Tarifa promedio" value={formatCLP(tarifaProm)} tone="clay" trend="por hora" />
        <StatCard icon={Star} label="Reputación" value={estudio?.rating > 0 ? estudio.rating.toFixed(1) : '—'} tone="amber" trend={`${estudio?.total_resenas || 0} reseñas`} />
        <StatCard icon={ShieldCheck} label="Certificación" value={estado === 'Verificado' ? 'Activa' : 'Pendiente'} tone="sand" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Tus boxes</h2>
            <Link to="/estudio/boxes" className="text-sm font-medium text-forest-600 hover:text-forest-700">Administrar</Link>
          </div>
          {boxes.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {boxes.slice(0, 4).map((b) => <BoxCard key={b.id_box} box={b} />)}
            </div>
          ) : (
            <Card className="p-8 text-center text-sm text-ink-muted">
              Aún no registras boxes. Crea tu primer espacio para empezar a recibir artistas.
            </Card>
          )}
        </div>

        <Card className="h-fit p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-ink">
            <Building2 className="h-5 w-5 text-forest-600" /> Datos del estudio
          </h3>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-ink-soft"><MapPin className="h-4 w-4 text-ink-muted" /> {estudio?.direccion}, {estudio?.comuna}</p>
            <div className="pt-1"><VerificationBadge estado={estado} /></div>
          </div>
          <p className="mt-4 text-sm text-ink-muted">{estudio?.descripcion}</p>
        </Card>
      </div>
    </div>
  )
}
