import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Card, Button, EmptyState, PageLoader } from '@/components/ui'
import { NotificationItem } from '@/components/domain'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationStore } from '@/store/notificationStore'
import { ROLES } from '@/lib/constants'

export default function Notificaciones() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { items, loading, load, markRead, markAllRead, unreadCount } = useNotificationStore()

  useEffect(() => { load(user.id) }, [user.id, load])

  if (loading) return <PageLoader />

  const handleClick = (n) => {
    markRead(n.id)
    if (n.data?.reserva && user.tipo_rol === ROLES.CLIENTE) navigate('/cliente/reservas')
    else if (n.data?.artista && user.tipo_rol === ROLES.ADMIN) navigate('/admin/documentos')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Notificaciones"
        subtitle="Mantente al día con tus reservas y actividad."
        action={
          unreadCount() > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllRead(user.id)}>
              <CheckCheck className="h-4 w-4" /> Marcar todas
            </Button>
          )
        }
      />

      {items.length ? (
        <Card className="p-2">
          <div className="space-y-1">
            {items.map((n) => (
              <NotificationItem key={n.id} noti={n} onClick={() => handleClick(n)} />
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState icon={Bell} title="Sin notificaciones" description="Aquí verás avisos de reservas, pagos y verificaciones." />
      )}
    </div>
  )
}
