import { forwardRef } from 'react'
import { cn } from '@/lib/cn'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'bg-forest-500 text-sand-50 hover:bg-forest-600 active:bg-forest-700 shadow-soft',
  secondary: 'bg-sand-200 text-ink hover:bg-sand-300 active:bg-sand-400',
  outline: 'border border-forest-500 text-forest-600 hover:bg-forest-50',
  ghost: 'text-ink-soft hover:bg-sand-200',
  danger: 'bg-clay-500 text-white hover:bg-clay-400',
  white: 'bg-white text-forest-700 hover:bg-sand-50 shadow-soft',
}

const sizes = {
  sm: 'h-9 px-3.5 text-sm rounded-lg gap-1.5',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-12 px-7 text-base rounded-xl gap-2',
  icon: 'h-10 w-10 rounded-xl justify-center',
}

const Button = forwardRef(
  (
    { children, variant = 'primary', size = 'md', className, loading, disabled, as, ...props },
    ref,
  ) => {
    const Comp = as || 'button'
    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-200',
          'focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
          'active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    )
  },
)
Button.displayName = 'Button'
export default Button
