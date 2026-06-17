import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { MobileBottomNav } from './MobileBottomNav'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationStore } from '@/store/notificationStore'

// Layout protegido para usuarios autenticados
export const AppShell = () => {
  const { user } = useAuth()
  const { load } = useNotificationStore()
  const location = useLocation()

  useEffect(() => {
    if (user?.id) load(user.id)
  }, [user?.id, location.pathname, load])

  return (
    <div className="flex min-h-screen bg-sand-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <main className="flex-1 pb-24 lg:pb-10">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="container-app py-6"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
