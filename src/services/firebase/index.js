// =============================================================
// Adaptador FIREBASE real (esqueleto).
// Activable con VITE_USE_FIREBASE=true + credenciales en .env
//
// Replica las MISMAS firmas que el adaptador mock (auth, storage, api),
// de modo que las pantallas no cambian al migrar a producción.
//
// La implementación completa se conecta con:
//   - Firebase Auth      -> auth.login/register/logout/onAuthChange
//   - Cloud Firestore    -> api.* (colecciones del modelo de datos relacional)
//   - Firebase Storage   -> storage.upload (PDF sanitarios y portafolio)
//
// Para el prototipo de evaluación se usa el adaptador mock por defecto.
// =============================================================

const notImplemented = (name) => () => {
  throw new Error(
    `[Firebase] "${name}" aún no está implementado. Completa src/services/firebase para usar el backend real ` +
      `(VITE_USE_FIREBASE=true).`,
  )
}

export const auth = {
  getCurrentUser: () => null,
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
