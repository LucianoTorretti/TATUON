// =============================================================
// authStore — sesión global (zustand)
// =============================================================
import { create } from 'zustand'
import { auth } from '@/services'

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  // Inicializa el listener de sesión
  init: () => {
    const unsub = auth.onAuthChange((user) => {
      set({ user, loading: false })
    })
    return unsub
  },

  login: async (email, password) => {
    const user = await auth.login(email, password)
    set({ user })
    return user
  },

  register: async (payload) => {
    const user = await auth.register(payload)
    set({ user })
    return user
  },

  logout: async () => {
    await auth.logout()
    set({ user: null })
  },

  updateProfile: async (patch) => {
    const { user } = get()
    if (!user) return
    const updated = await auth.updateProfile(user.id, patch)
    set({ user: updated })
    return updated
  },

  // Refresca el usuario desde el backend (p. ej. tras cambiar estado de verificación)
  refresh: () => {
    const current = auth.getCurrentUser()
    set({ user: current })
  },
}))
