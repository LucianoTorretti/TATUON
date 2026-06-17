import { Link } from 'react-router-dom'
import {
  Users, Palette, Building2, CalendarCheck, CircleDollarSign, Star,
  ShieldCheck, FileCheck2, TrendingUp, AlertTriangle,
} from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Card, Button, PageLoader, Badge } from '@/components/ui'
import { StatCard } from '@/components/domain'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services'
import { formatCLP, formatNumber } from '@/lib/format'
import { cn } from '@/lib/cn'

const estadoColors = {
  Pendiente: 'bg-amber-400',
  Confirmada: 'bg-blue-500',
  Ejecutada: 'bg-forest-500',
  Cancelada: 'bg-clay-500',
}

export default function AdminDashboard() {
  const { data: m, loading } = useAsync(() => api.getMetricas(), [])
  if (loading) return <PageLoader />

  const maxBar = Math.max(...m.reservasPorEstado.map((e) => e.valor), 1)

  return (
    <div>
      <PageHeader
        title="Dashboard de métricas"
        subtitle="Visión general del marketplace y la salud del ecosistema."
        action={
          m.pendientesValidacion > 0 && (
            <Button as={Link} to="/admin/documentos" variant="outline">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> {m.pendientesValidacion} por revisar
            </Button>
          )
        }
      />

      {/* KPIs principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Usuarios totales" value={formatNumber(m.totalUsuarios)} trend={`${m.totalClientes} clientes`} />
        <StatCard icon={CalendarCheck} label="Reservas" value={formatNumber(m.totalReservas)} tone="amber" trend={`${m.reservasEjecutadas} ejecutadas`} />
        <StatCard icon={CircleDollarSign} label="Comisión acumulada" value={formatCLP(m.comisionAcumulada)} tone="clay" trend="Señas 10%" />
        <StatCard icon={Star} label="Rating promedio" value={m.ratingPromedio || '—'} trend="del ecosistema" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Gráfico reservas por estado */}
        <Card className="p-5">
          <h3 className="mb-5 flex items-center gap-2 font-semibold text-ink">
            <TrendingUp className="h-5 w-5 text-forest-600" /> Reservas por estado
          </h3>
          <div className="space-y-4">
            {m.reservasPorEstado.map((e) => (
              <div key={e.estado}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-ink-soft">{e.estado}</span>
                  <span className="font-semibold text-ink">{e.valor}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-sand-200">
                  <div
                    className={cn('h-full rounded-full transition-all', estadoColors[e.estado])}
                    style={{ width: `${(e.valor / maxBar) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-sand-200 pt-5">
            <Mini icon={Palette} label="Artistas" value={m.totalArtistas} />
            <Mini icon={Building2} label="Estudios" value={m.totalEstudios} />
            <Mini icon={CircleDollarSign} label="Transacciones" value={m.totalTransado} />
          </div>
        </Card>

        {/* Estado de verificación + accesos */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-ink">
              <ShieldCheck className="h-5 w-5 text-forest-600" /> Verificación
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-forest-50 p-3">
                <span className="text-sm text-forest-800">Artistas verificados</span>
                <span className="font-bold text-forest-700">{m.artistasVerificados}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-amber-50 p-3">
                <span className="text-sm text-amber-800">Pendientes de validación</span>
                <Badge tone="amber">{m.pendientesValidacion}</Badge>
              </div>
            </div>
            <Button as={Link} to="/admin/documentos" className="mt-4 w-full">
              <FileCheck2 className="h-4 w-4" /> Revisar documentos
            </Button>
          </Card>

          <Card className="p-5">
            <h3 className="mb-2 font-semibold text-ink">Moderación</h3>
            <p className="text-sm text-ink-muted">Audita usuarios, resuelve disputas y controla la calidad.</p>
            <Button as={Link} to="/admin/usuarios" variant="outline" className="mt-4 w-full">
              <Users className="h-4 w-4" /> Gestionar usuarios
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

const Mini = ({ icon: Icon, label, value }) => (
  <div className="text-center">
    <Icon className="mx-auto h-5 w-5 text-ink-muted" />
    <p className="mt-1 font-display text-xl font-bold text-ink">{value}</p>
    <p className="text-xs text-ink-muted">{label}</p>
  </div>
)
