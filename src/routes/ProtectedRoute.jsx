import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { PageLoader } from '@/components/ui'

// Exige sesión iniciada (rutas privadas)
export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader label="Verificando sesión…" />
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return children
}
