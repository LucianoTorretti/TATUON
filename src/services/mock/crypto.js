// =============================================================
// Hash de contraseña simulado (NO criptográficamente seguro —
// representa el almacenamiento de contrasena_hash del modelo de datos,
// que en producción usaría Bcrypt según el diccionario de datos).
// =============================================================
export const hashPassword = (plain = '') => {
  let h = 0
  const salted = `tatuon::${plain}`
  for (let i = 0; i < salted.length; i++) {
    h = (h << 5) - h + salted.charCodeAt(i)
    h |= 0
  }
  return `bcrypt$mock$${(h >>> 0).toString(16)}`
}

export const verifyPassword = (plain, hash) => hashPassword(plain) === hash
