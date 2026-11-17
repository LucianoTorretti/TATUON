import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

export const Input = forwardRef(
  ({ label, error, hint, icon: Icon, className, id, ...props }, ref) => {
    const inputId = id || props.name
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-soft">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-muted" />
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input-base',
              Icon && 'pl-10',
              error && 'border-clay-500 focus:border-clay-500 focus:ring-clay-500/30',
              className,
            )}
            aria-invalid={error ? true : undefined}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs font-medium text-clay-500">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'

export const Textarea = forwardRef(({ label, error, className, id, ...props }, ref) => {
  const inputId = id || props.name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-soft">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={cn('input-base min-h-[110px] resize-y', error && 'border-clay-500', className)}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-medium text-clay-500">{error}</p>}
    </div>
  )
})
Textarea.displayName = 'Textarea'

export const Select = forwardRef(({ label, error, children, className, id, ...props }, ref) => {
  const inputId = id || props.name
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-soft">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={inputId}
        className={cn('input-base appearance-none bg-white pr-9', error && 'border-clay-500', className)}
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs font-medium text-clay-500">{error}</p>}
    </div>
  )
})
Select.displayName = 'Select'
