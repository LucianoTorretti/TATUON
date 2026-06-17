// =============================================================
// mockAuth — simula Firebase Auth (Auth/Storage del informe)
// =============================================================
import { COLECCIONES, ROLES, VERIFICACION } from '@/lib/constants'
import * as db from './mockDb'
import { hashPassword, verifyPassword } from './crypto'
import { readValue, writeValue, removeValue, delay, genId } from './persistence'
import { ensureSeed } from './seed'

const SESSION_KEY = 'session:uid'
const listeners = new Set()

const notify = (user) => listeners.forEach((cb) => cb(user))

// Devuelve el usuario "hidratado" con su detalle de artista/estudio
const hydrate = (usuario) => {
  if (!usuario) return null
  const { passwordHash, ...safe } = usuario
  let detalle = null
  if (usuario.tipo_rol === ROLES.ARTISTA) {
    detalle = db.findById(COLECCIONES.ARTISTAS, 'id_artista', usuario.id)
  } else if (usuario.tipo_rol === ROLES.ESTUDIO) {
    detalle = db.findById(COLECCIONES.ESTUDIOS, 'id_estudio', usuario.id)
  }
  return { ...safe, detalle }
}

export const getCurrentUser = () => {
  ensureSeed()
  const uid = readValue(SESSION_KEY)
  if (!uid) return null
  return hydrate(db.findById(COLECCIONES.USUARIOS, 'id', uid))
}

export const onAuthChange = (cb) => {
  listeners.add(cb)
  cb(getCurrentUser())
  return () => listeners.delete(cb)
}

export const login = async (email, password) => {
  ensureSeed()
  await delay(450)
  const user = db.findOne(COLECCIONES.USUARIOS, (u) => u.email.toLowerCase() === email.trim().toLowerCase())
  if (!user) throw new Error('No existe una cuenta con ese correo.')
  if (!verifyPassword(password, user.passwordHash)) throw new Error('Contraseña incorrecta.')
  writeValue(SESSION_KEY, user.id)
  const hydrated = hydrate(user)
  notify(hydrated)
  return hydrated
}

export const logout = async () => {
  await delay(150)
  removeValue(SESSION_KEY)
  notify(null)
}

export const register = async (payload) => {
  ensureSeed()
  await delay(600)
  const { nombre, email, password, telefono, tipo_rol, comuna, extra = {} } = payload

  const exists = db.findOne(COLECCIONES.USUARIOS, (u) => u.email.toLowerCase() === email.trim().toLowerCase())
  if (exists) throw new Error('Ya existe una cuenta con ese correo.')

  const id = genId('u')
  const usuario = {
    id,
    nombre,
    email: email.trim(),
    passwordHash: hashPassword(password),
    telefono: telefono || '',
    tipo_rol,
    comuna: comuna || 'Santiago Centro',
    avatar: `https://i.pravatar.cc/300?u=${encodeURIComponent(email)}`,
    fecha_registro: new Date().toISOString(),
  }
  db.insert(COLECCIONES.USUARIOS, usuario)

  // Crear detalle según rol (RF-01: verificación segmentada)
  if (tipo_rol === ROLES.ARTISTA) {
    db.insert(COLECCIONES.ARTISTAS, {
      id_artista: id,
      nombre,
      avatar: usuario.avatar,
      estilos: extra.estilos || [],
      tarifa_media: extra.tarifa_media || 0,
      comuna: usuario.comuna,
      coords: extra.coords || null,
      estudio_id: null,
      biografia: extra.biografia || '',
      // Si subió PDF -> pendiente de validación; si no -> sin documento
      estado_verificacion: extra.resolucion_sanitaria_url
        ? VERIFICACION.PENDIENTE
        : VERIFICACION.SIN_DOCUMENTO,
      resolucion_sanitaria_url: extra.resolucion_sanitaria_url || null,
      flash_disponible: false,
      rating: 0,
      total_resenas: 0,
      instagram: extra.instagram || '',
    })
  } else if (tipo_rol === ROLES.ESTUDIO) {
    db.insert(COLECCIONES.ESTUDIOS, {
      id_estudio: id,
      nombre_fantasia: extra.nombre_fantasia || nombre,
      avatar: usuario.avatar,
      direccion: extra.direccion || '',
      comuna: usuario.comuna,
      lat: extra.coords?.lat || null,
      lng: extra.coords?.lng || null,
      seremi_resolucion_url: extra.seremi_resolucion_url || null,
      estado_certificacion: extra.seremi_resolucion_url
        ? VERIFICACION.PENDIENTE
        : VERIFICACION.SIN_DOCUMENTO,
      rating: 0,
      total_resenas: 0,
      descripcion: extra.descripcion || '',
      cover: `https://picsum.photos/seed/${id}/800/800`,
    })
  }

  writeValue(SESSION_KEY, id)
  const hydrated = hydrate(usuario)
  notify(hydrated)
  return hydrated
}

export const resetPassword = async (email) => {
  await delay(500)
  const user = db.findOne(COLECCIONES.USUARIOS, (u) => u.email.toLowerCase() === email.trim().toLowerCase())
  // Por seguridad, no revelamos si el correo existe (buena práctica).
  return { ok: true, exists: Boolean(user) }
}

export const updateProfile = async (id, patch) => {
  await delay(300)
  const updated = db.update(COLECCIONES.USUARIOS, 'id', id, patch)
  // Reflejar nombre/avatar en el detalle
  const u = db.findById(COLECCIONES.USUARIOS, 'id', id)
  if (u?.tipo_rol === ROLES.ARTISTA) {
    db.update(COLECCIONES.ARTISTAS, 'id_artista', id, {
      ...(patch.nombre ? { nombre: patch.nombre } : {}),
      ...(patch.avatar ? { avatar: patch.avatar } : {}),
      ...(patch.comuna ? { comuna: patch.comuna } : {}),
    })
  }
  const hydrated = hydrate(updated)
  notify(hydrated)
  return hydrated
}

export const auth = {
  getCurrentUser,
  onAuthChange,
  login,
  logout,
  register,
  resetPassword,
  updateProfile,
}
