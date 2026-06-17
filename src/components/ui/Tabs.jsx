import { cn } from '@/lib/cn'

export const Tabs = ({ tabs, value, onChange, className }) => (
  <div className={cn('flex gap-1 overflow-x-auto rounded-xl bg-sand-200 p-1 no-scrollbar', className)}>
    {tabs.map((t) => (
      <button
        key={t.value}
        onClick={() => onChange(t.value)}
        className={cn(
          'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-all',
          value === t.value ? 'bg-white text-forest-700 shadow-soft' : 'text-ink-muted hover:text-ink',
        )}
      >
        {t.icon && <t.icon className="h-4 w-4" />}
        {t.label}
        {typeof t.count === 'number' && (
          <span className={cn('rounded-full px-1.5 text-[11px]', value === t.value ? 'bg-forest-100 text-forest-700' : 'bg-sand-300 text-ink-soft')}>
            {t.count}
          </span>
        )}
      </button>
    ))}
  </div>
)
