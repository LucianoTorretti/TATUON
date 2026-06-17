import { cn } from '@/lib/cn'
import { VERIFICACION, ESTADO_CITA } from '@/lib/constants'
import { ShieldCheck, Clock, ShieldX, ShieldAlert, CheckCircle2, XCircle, CircleDot } from 'lucide-react'

const tones = {
  forest: 'bg-forest-50 text-forest-700 border-forest-200',
  sand: 'bg-sand-200 text-ink-soft border-sand-300',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  clay: 'bg-clay-400/15 text-clay-500 border-clay-400/30',
  red: 'bg-red-50 text-red-600 border-red-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
}

export const Badge = ({ children, tone = 'sand', icon: Icon, className, size = 'md' }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
      tones[tone],
      className,
    )}
  >
    {Icon && <Icon className="h-3.5 w-3.5" />}
    {children}
  </span>
)

// Badge de verificación sanitaria (RF-01, RS-01)
export const VerificationBadge = ({ estado, size = 'md' }) => {
  const map = {
    [VERIFICACION.VERIFICADO]: { tone: 'forest', icon: ShieldCheck, label: 'Verificado' },
    [VERIFICACION.PENDIENTE]: { tone: 'amber', icon: Clock, label: 'Pendiente' },
    [VERIFICACION.RECHAZADO]: { tone: 'red', icon: ShieldX, label: 'Rechazado' },
    [VERIFICACION.SIN_DOCUMENTO]: { tone: 'sand', icon: ShieldAlert, label: 'Sin documento' },
  }
  const cfg = map[estado] || map[VERIFICACION.SIN_DOCUMENTO]
  return <Badge tone={cfg.tone} icon={cfg.icon} size={size}>{cfg.label}</Badge>
}

// Badge de estado de cita
export const CitaBadge = ({ estado, size = 'md' }) => {
  const map = {
    [ESTADO_CITA.PENDIENTE_PAGO]: { tone: 'amber', icon: Clock, label: 'Pendiente de pago' },
    [ESTADO_CITA.CONFIRMADA]: { tone: 'blue', icon: CircleDot, label: 'Confirmada' },
    [ESTADO_CITA.EJECUTADA]: { tone: 'forest', icon: CheckCircle2, label: 'Ejecutada' },
    [ESTADO_CITA.CANCELADA]: { tone: 'red', icon: XCircle, label: 'Cancelada' },
  }
  const cfg = map[estado] || map[ESTADO_CITA.PENDIENTE_PAGO]
  return <Badge tone={cfg.tone} icon={cfg.icon} size={size}>{cfg.label}</Badge>
}
