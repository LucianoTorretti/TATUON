import { NavLink } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { bottomNavByRole } from './navConfig'
import { cn } from '@/lib/cn'

export const MobileBottomNav = () => {
  const { user } = useAuth()
  const items = bottomNavByRole[user?.tipo_rol] || []
  const all = [...items, { to: '/configuracion', label: 'Cuenta', icon: Settings }]

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-sand-50/95 backdrop-blur-md lg:hidden">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${all.length}, 1fr)` }}>
        {all.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors',
                isActive ? 'text-forest-600' : 'text-ink-muted',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg transition', isActive && 'bg-forest-100')}>
                  <item.icon className="h-4.5 w-4.5" />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
