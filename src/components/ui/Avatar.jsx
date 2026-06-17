import { cn } from '@/lib/cn'
import { initials } from '@/lib/format'

const sizes = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
}

export const Avatar = ({ src, name = '', size = 'md', className, ring }) => (
  <div
    className={cn(
      'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest-100 font-semibold text-forest-700',
      sizes[size],
      ring && 'ring-2 ring-white ring-offset-2 ring-offset-sand-100',
      className,
    )}
  >
    {src ? (
      <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" />
    ) : (
      <span>{initials(name)}</span>
    )}
  </div>
)
