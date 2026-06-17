import { cn } from '@/lib/cn'

export const Card = ({ children, className, hover, ...props }) => (
  <div
    className={cn(
      'card',
      hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-card',
      className,
    )}
    {...props}
  >
    {children}
  </div>
)

export const CardBody = ({ children, className }) => (
  <div className={cn('p-5 sm:p-6', className)}>{children}</div>
)

export const CardHeader = ({ title, subtitle, action, className }) => (
  <div className={cn('flex items-start justify-between gap-4 border-b border-sand-200 p-5 sm:p-6', className)}>
    <div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      {subtitle && <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>}
    </div>
    {action}
  </div>
)
