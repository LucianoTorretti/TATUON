import { NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { Logo, Avatar, VerificationBadge } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { navByRole, commonNav } from './navConfig'
import { ROLE_LABELS, ROLES } from '@/lib/constants'
import { cn } from '@/lib/cn'

const linkClass = ({ isActive }) =>
  cn(
    'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all',
    isActive
      ? 'bg-forest-500 text-sand-50 shadow-soft'
      : 'text-ink-soft hover:bg-sand-200 hover:text-ink',
  )

export const Sidebar = () => {
  const { user, logout } = useAuth()
  const items = navByRole[user?.tipo_rol] || []
  const estado = user?.detalle?.estado_verificacion || user?.detalle?.estado_certificacion

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sand-200 bg-sand-50 px-4 py-5 lg:flex">
      <div className="px-2">
        <NavLink to={`/${user?.tipo_rol}`}>
          <Logo />
        </NavLink>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </NavLink>
        ))}

        <div className="my-3 h-px bg-sand-200" />

        {commonNav.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Tarjeta de usuario */}
      <div className="rounded-2xl border border-sand-200 bg-white p-3">
        <div className="flex items-center gap-3">
          <Avatar src={user?.avatar} name={user?.nombre} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{user?.nombre}</p>
            <p className="text-xs text-ink-muted">{ROLE_LABELS[user?.tipo_rol]}</p>
          </div>
        </div>
        {estado && (user?.tipo_rol === ROLES.ARTISTA || user?.tipo_rol === ROLES.ESTUDIO) && (
          <div className="mt-2.5">
            <VerificationBadge estado={estado} size="sm" />
          </div>
        )}
        <button
          onClick={logout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-sand-200 py-2 text-sm font-medium text-ink-soft transition hover:bg-sand-100"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
