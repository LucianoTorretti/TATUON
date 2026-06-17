// =============================================================
// notificationStore — notificaciones del usuario (zustand)
// =============================================================
import { create } from 'zustand'
import { api } from '@/services'

export const useNotificationStore = create((set, get) => ({
  items: [],
  loading: false,

  load: async (usuarioId) => {
    if (!usuarioId) return
    set({ loading: true })
    const items = await api.listNotificaciones(usuarioId)
    set({ items, loading: false })
  },

  unreadCount: () => get().items.filter((n) => !n.leida).length,

  markRead: async (id) => {
    await api.marcarLeida(id)
    set({ items: get().items.map((n) => (n.id === id ? { ...n, leida: true } : n)) })
  },

  markAllRead: async (usuarioId) => {
    await api.marcarTodasLeidas(usuarioId)
    set({ items: get().items.map((n) => ({ ...n, leida: true })) })
  },
}))
