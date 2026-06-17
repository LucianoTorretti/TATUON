import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

export const Spinner = ({ className }) => (
  <Loader2 className={cn('h-6 w-6 animate-spin text-forest-500', className)} />
)

export const PageLoader = ({ label = 'Cargando…' }) => (
  <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink-muted">
    <Spinner className="h-8 w-8" />
    <p className="text-sm">{label}</p>
  </div>
)

export const Skeleton = ({ className }) => (
  <div className={cn('relative overflow-hidden rounded-xl bg-sand-200', className)}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/50 to-transparent" />
  </div>
)

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-sand-300 bg-sand-50/60 px-6 py-14 text-center">
    {Icon && (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-500">
        <Icon className="h-7 w-7" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-ink">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
)
