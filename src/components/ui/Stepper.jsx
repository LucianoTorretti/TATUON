import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export const Stepper = ({ steps, current }) => (
  <div className="flex items-center justify-center gap-2 sm:gap-3">
    {steps.map((label, i) => {
      const done = i < current
      const active = i === current
      return (
        <div key={label} className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all',
                done && 'bg-forest-500 text-white',
                active && 'bg-forest-500 text-white ring-4 ring-forest-100',
                !done && !active && 'bg-sand-200 text-ink-muted',
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                'hidden text-sm font-medium sm:block',
                active ? 'text-ink' : 'text-ink-muted',
              )}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn('h-px w-6 sm:w-10', done ? 'bg-forest-400' : 'bg-sand-300')} />
          )}
        </div>
      )
    })}
  </div>
)
