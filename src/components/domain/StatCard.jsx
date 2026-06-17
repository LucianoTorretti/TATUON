import { Card } from '@/components/ui'
import { cn } from '@/lib/cn'

export const StatCard = ({ icon: Icon, label, value, trend, tone = 'forest', className }) => {
  const tones = {
    forest: 'bg-forest-50 text-forest-600',
    clay: 'bg-clay-400/15 text-clay-500',
    amber: 'bg-amber-50 text-amber-600',
    sand: 'bg-sand-200 text-ink-soft',
  }
  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-muted">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">{value}</p>
          {trend && <p className="mt-1 text-xs font-medium text-forest-600">{trend}</p>}
        </div>
        {Icon && (
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  )
}
