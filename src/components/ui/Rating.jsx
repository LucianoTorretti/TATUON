import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/cn'

// Estrellas de solo lectura
export const Stars = ({ value = 0, size = 'sm', className }) => {
  const px = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'
  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(px, i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-sand-300')}
        />
      ))}
    </div>
  )
}

// Selector interactivo de estrellas (RF-06 / CU-06)
export const RatingInput = ({ value, onChange }) => {
  const [hover, setHover] = useState(0)
  return (
    <div className="inline-flex items-center gap-1.5" role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} estrella${i > 1 ? 's' : ''}`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              'h-8 w-8',
              i <= (hover || value) ? 'fill-amber-400 text-amber-400' : 'text-sand-300',
            )}
          />
        </button>
      ))}
    </div>
  )
}
