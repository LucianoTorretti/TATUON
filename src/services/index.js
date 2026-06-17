// =============================================================
// Selector de adaptador de backend (mock | firebase)
// Las pantallas SOLO importan desde aquí. Cambiar de backend es
// transparente para la UI (arquitectura limpia y desacoplada).
// =============================================================
import * as mock from './mock'
import * as firebase from './firebase'

const USE_FIREBASE = import.meta.env.VITE_USE_FIREBASE === 'true'

const adapter = USE_FIREBASE ? firebase : mock

export const auth = adapter.auth
export const storage = adapter.storage
export const api = adapter.api
export const BACKEND = USE_FIREBASE ? 'firebase' : 'mock'

// Reset del demo (solo mock)
export { resetSeed } from './mock/seed'
