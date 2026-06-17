// =============================================================
// Carga inicial de datos semilla en localStorage (primer arranque)
// =============================================================
import { COLECCIONES } from '@/lib/constants'
import { hashPassword } from './crypto'
import { readValue, writeValue, writeCollection, readCollection } from './persistence'
import {
  usuarios, artistas, estudios, boxes, portafolio,
  reservas, pagos, resenas, notificaciones,
} from '@/data/seedData'

const SEED_FLAG = 'seeded:v2'

export const ensureSeed = () => {
  if (readValue(SEED_FLAG)) return

  // Usuarios: convertir password en claro -> passwordHash
  const usuariosHasheados = usuarios.map(({ password, ...u }) => ({
    ...u,
    passwordHash: hashPassword(password),
  }))

  writeCollection(COLECCIONES.USUARIOS, usuariosHasheados)
  writeCollection(COLECCIONES.ARTISTAS, artistas)
  writeCollection(COLECCIONES.ESTUDIOS, estudios)
  writeCollection(COLECCIONES.BOXES, boxes)
  writeCollection(COLECCIONES.PORTAFOLIO, portafolio)
  writeCollection(COLECCIONES.RESERVAS, reservas)
  writeCollection(COLECCIONES.PAGOS, pagos)
  writeCollection(COLECCIONES.RESENAS, resenas)
  writeCollection(COLECCIONES.NOTIFICACIONES, notificaciones)

  writeValue(SEED_FLAG, true)
}

// Permite reiniciar el demo a su estado inicial
export const resetSeed = () => {
  Object.values(COLECCIONES).forEach((c) => writeCollection(c, []))
  writeValue(SEED_FLAG, false)
  ensureSeed()
}

// Utilidad de depuración
export const isSeeded = () => Boolean(readValue(SEED_FLAG)) && readCollection(COLECCIONES.USUARIOS).length > 0
