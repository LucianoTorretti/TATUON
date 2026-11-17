// =============================================================
// Adaptador SUPABASE (en construcción — Fase 3 del plan de migración).
// Debe replicar las MISMAS firmas que el adaptador mock (auth, storage, api).
// =============================================================

const notImplemented = (name) => () => {
  throw new Error(`[Supabase] "${name}" aún no está implementado (Fase 3).`)
}

export const auth = {
  getCurrentUser: async () => null,
  onAuthChange: (cb) => {
    cb(null)
    return () => {}
  },
  login: notImplemented('auth.login'),
  logout: notImplemented('auth.logout'),
  register: notImplemented('auth.register'),
  resetPassword: notImplemented('auth.resetPassword'),
  updateProfile: notImplemented('auth.updateProfile'),
}

export const storage = {
  upload: notImplemented('storage.upload'),
}

export const api = new Proxy(
  {},
  { get: (_t, prop) => notImplemented(`api.${String(prop)}`) },
)
