import { ESTILOS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { Check } from 'lucide-react'

// Selector de estilos artísticos (RF-03). multi o single.
export const StyleSelector = ({ value = [], onChange, multi = true, options = ESTILOS }) => {
  const selected = Array.isArray(value) ? value : value ? [value] : []

  const toggle = (estilo) => {
    if (multi) {
      onChange(selected.includes(estilo) ? selected.filter((s) => s !== estilo) : [...selected, estilo])
    } else {
      onChange(selected.includes(estilo) ? '' : estilo)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((estilo) => {
        const active = selected.includes(estilo)
        return (
          <button
            key={estilo}
            type="button"
            onClick={() => toggle(estilo)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all',
              active
                ? 'border-forest-500 bg-forest-500 text-sand-50'
                : 'border-sand-300 bg-white text-ink-soft hover:border-forest-300 hover:text-forest-600',
            )}
          >
            {active && <Check className="h-3.5 w-3.5" />}
            {estilo}
          </button>
        )
      })}
    </div>
  )
}
