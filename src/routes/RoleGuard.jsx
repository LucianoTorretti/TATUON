import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_HOME } from '@/lib/constants'

// Exige uno de los roles permitidos; si no, redirige a su home
export const RoleGuard = ({ roles, children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.tipo_rol)) {
    return <Navigate to={ROLE_HOME[user.tipo_rol] || '/'} replace />
  }
  return children
}
