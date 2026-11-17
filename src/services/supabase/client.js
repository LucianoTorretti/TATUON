// =============================================================
// Cliente Supabase (solo se crea si VITE_BACKEND=supabase)
// La anon key es pública por diseño: la seguridad real vive en
// las políticas RLS y funciones de supabase/migrations.
// =============================================================
import { createClient } from '@supabase/supabase-js'

let client = null

export const getSupabase = () => {
  if (client) return client
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error(
      '[Supabase] Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Revisa tu .env (ver .env.example).',
    )
  }
  client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  })
  return client
}
