import { cn } from '@/lib/cn'

export const Logo = ({ className, variant = 'dark', showText = true }) => {
  const text = variant === 'light' ? 'text-sand-50' : 'text-ink'
  return (
    <span className={cn('inline-flex items-center gap-2 font-display', className)}>
      <img
        src="/images/logo.webp"
        alt="TATU ON logo"
        className="h-8 w-8 rounded-xl object-cover"
      />
      {showText && (
        <span className={cn('text-lg font-bold tracking-tight', text)}>
          TATU<span className="text-forest-500">ON</span>
        </span>
      )}
    </span>
  )
}
