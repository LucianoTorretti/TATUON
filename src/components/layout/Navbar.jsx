import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Search, Check } from 'lucide-react'
import { Logo, Avatar } from '@/components/ui'
import { NotificationItem } from '@/components/domain'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationStore } from '@/store/notificationStore'
import { ROLES } from '@/lib/constants'
import { cn } from '@/lib/cn'

const useClickOutside = (ref, onClose) => {
  useEffect(() => {
    const handler = (e) => ref.current && !ref.current.contains(e.target) && onClose()
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onClose])
}

export const Navbar = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { items, unreadCount, markRead, markAllRead } = useNotificationStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useClickOutside(ref, () => setOpen(false))

  const unread = unreadCount()

  const handleNotiClick = (n) => {
    markRead(n.id)
    setOpen(false)
    if (n.data?.reserva && user?.tipo_rol === ROLES.CLIENTE) navigate('/cliente/reservas')
    else if (n.data?.artista) navigate('/admin/documentos')
    else navigate('/notificaciones')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-sand-200 bg-sand-50/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        {/* Logo (móvil) */}
        <Link to={`/${user?.tipo_rol}`} className="lg:hidden">
          <Logo showText={false} />
        </Link>

        {/* Buscador rápido (cliente) */}
        {user?.tipo_rol === ROLES.CLIENTE ? (
          <Link
            to="/buscar"
            className="flex flex-1 items-center gap-2 rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-sm text-ink-muted transition hover:border-forest-300 sm:max-w-md"
          >
            <Search className="h-4 w-4" />
            Buscar artistas, estilos, estudios…
          </Link>
        ) : (
          <div className="hidden flex-1 lg:block" />
        )}

        <div className="flex items-center gap-2">
          {/* Notificaciones */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="relative rounded-xl border border-sand-200 bg-white p-2.5 text-ink-soft transition hover:bg-sand-100"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay-500 px-1 text-[10px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-80 origin-top-right animate-fade-in rounded-2xl border border-sand-200 bg-white p-2 shadow-card">
                <div className="flex items-center justify-between px-2 py-2">
                  <p className="font-semibold text-ink">Notificaciones</p>
                  {unread > 0 && (
                    <button
                      onClick={() => markAllRead(user.id)}
                      className="flex items-center gap-1 text-xs font-medium text-forest-600 hover:text-forest-700"
                    >
                      <Check className="h-3 w-3" /> Marcar todas
                    </button>
                  )}
                </div>
                <div className="max-h-80 space-y-0.5 overflow-y-auto">
                  {items.length ? (
                    items.slice(0, 6).map((n) => (
                      <NotificationItem key={n.id} noti={n} onClick={() => handleNotiClick(n)} />
                    ))
                  ) : (
                    <p className="px-3 py-8 text-center text-sm text-ink-muted">Sin notificaciones</p>
                  )}
                </div>
                <Link
                  to="/notificaciones"
                  onClick={() => setOpen(false)}
                  className="mt-1 block rounded-xl py-2 text-center text-sm font-medium text-forest-600 hover:bg-sand-100"
                >
                  Ver todas
                </Link>
              </div>
            )}
          </div>

          {/* Avatar */}
          <Link to="/configuracion" className="rounded-full transition hover:opacity-90">
            <Avatar src={user?.avatar} name={user?.nombre} size="md" />
          </Link>
        </div>
      </div>
    </header>
  )
}
