import { useAuthStore } from '@/store/authStore'

// Atajo de acceso a la sesión
export const useAuth = () => {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const logout = useAuthStore((s) => s.logout)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const refresh = useAuthStore((s) => s.refresh)
  return { user, loading, login, register, logout, updateProfile, refresh, isAuth: Boolean(user) }
}
