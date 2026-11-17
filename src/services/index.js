// =============================================================
// Selector de adaptador de backend (mock | supabase)
// Las pantallas SOLO importan desde aquí. Cambiar de backend es
// transparente para la UI (arquitectura limpia y desacoplada).
// =============================================================
import * as mock from './mock'
import * as supabase from './supabase'

export const BACKEND = import.meta.env.VITE_BACKEND === 'supabase' ? 'supabase' : 'mock'

const adapter = BACKEND === 'supabase' ? supabase : mock

export const auth = adapter.auth
export const storage = adapter.storage
export const api = adapter.api

// Reset del demo (solo mock)
export { resetSeed } from './mock/seed'
