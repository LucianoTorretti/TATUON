// =============================================================
// Validación del registro / completar perfil (cliente).
// Los mismos límites se exigen en SQL (migración validacion_registro):
// si cambias uno aquí, cámbialo allá.
// =============================================================
import { ROLES } from './constants'
import { COMUNAS } from './geo'

export const LIMITES = {
  NOMBRE_MIN: 3,
  NOMBRE_MAX: 80,
  PASSWORD_MIN: 8,
  BIO_MAX: 1000,
  DIRECCION_MAX: 200,
  TARIFA_MAX: 10_000_000, // CLP
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INSTAGRAM_RE = /^@?[A-Za-z0-9._]{1,30}$/
const MOVIL_CL_RE = /^(?:\+?56)?(9\d{8})$/

/** Devuelve el móvil chileno en formato +569XXXXXXXX, o null si no es válido. */
export const normalizePhone = (telefono = '') => {
  const match = String(telefono).replace(/[\s-]/g, '').match(MOVIL_CL_RE)
  return match ? `+56${match[1]}` : null
}

/**
 * Paso "Datos". Con requireCredenciales=false (perfil de Google) no valida correo ni contraseña.
 * @returns {Record<string, string>} errores por campo; vacío si es válido
 */
export const validateDatos = (form, { requireCredenciales = true } = {}) => {
  const e = {}
  const nombre = (form.nombre || '').trim()
  if (nombre.length < LIMITES.NOMBRE_MIN) e.nombre = 'Ingresa tu nombre completo.'
  else if (nombre.length > LIMITES.NOMBRE_MAX) e.nombre = `Máximo ${LIMITES.NOMBRE_MAX} caracteres.`

  if (requireCredenciales) {
    if (!EMAIL_RE.test((form.email || '').trim())) e.email = 'Correo no válido.'
    const pw = form.password || ''
    if (pw.length < LIMITES.PASSWORD_MIN || !/[A-Za-z]/.test(pw) || !/\d/.test(pw)) {
      e.password = `Mínimo ${LIMITES.PASSWORD_MIN} caracteres, con al menos una letra y un número.`
    }
  }

  if (!form.telefono?.trim()) e.telefono = 'Ingresa tu teléfono.'
  else if (!normalizePhone(form.telefono)) e.telefono = 'Usa un móvil chileno: +56 9 1234 5678.'

  if (!COMUNAS.some((c) => c.nombre === form.comuna)) e.comuna = 'Selecciona una comuna.'
  return e
}

/** Paso "Verificación" (solo artista / estudio). */
export const validateVerificacion = (form, rol) => {
  const e = {}
  if ((form.biografia || '').length > LIMITES.BIO_MAX) e.biografia = `Máximo ${LIMITES.BIO_MAX} caracteres.`

  if (rol === ROLES.ARTISTA) {
    if (!form.estilos?.length) e.estilos = 'Elige al menos un estilo.'
    const tarifa = String(form.tarifa_media ?? '').trim()
    if (tarifa && (!/^\d+$/.test(tarifa) || Number(tarifa) > LIMITES.TARIFA_MAX)) {
      e.tarifa_media = 'Ingresa un monto en pesos, sin puntos ni decimales.'
    }
    const ig = (form.instagram || '').trim()
    if (ig && !INSTAGRAM_RE.test(ig)) e.instagram = 'Usuario de Instagram no válido (ej: @tu.usuario).'
  } else if (rol === ROLES.ESTUDIO) {
    const dir = (form.direccion || '').trim()
    if (!dir) e.direccion = 'Ingresa la dirección del estudio.'
    else if (dir.length > LIMITES.DIRECCION_MAX) e.direccion = `Máximo ${LIMITES.DIRECCION_MAX} caracteres.`
  }
  return e
}
