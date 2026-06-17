import { Calendar, Star, ShieldCheck, Bell } from 'lucide-react'
import { cn } from '@/lib/cn'
import { timeAgo } from '@/lib/format'

const icons = {
  reserva: { icon: Calendar, tone: 'bg-blue-50 text-blue-600' },
  resena: { icon: Star, tone: 'bg-amber-50 text-amber-600' },
  moderacion: { icon: ShieldCheck, tone: 'bg-forest-50 text-forest-600' },
  default: { icon: Bell, tone: 'bg-sand-200 text-ink-soft' },
}

export const NotificationItem = ({ noti, onClick }) => {
  const cfg = icons[noti.tipo] || icons.default
  const Icon = cfg.icon
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-sand-100',
        !noti.leida && 'bg-forest-50/50',
      )}
    >
      <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', cfg.tone)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{noti.titulo}</p>
        <p className="text-sm text-ink-muted">{noti.mensaje}</p>
        <p className="mt-0.5 text-xs text-ink-muted">{timeAgo(noti.fecha)}</p>
      </div>
      {!noti.leida && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-clay-500" />}
    </button>
  )
}
