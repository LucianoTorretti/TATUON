// =============================================================
// API de dominio (mock) — funciones que consumen las pantallas.
// El adaptador Firebase replica estas mismas firmas.
// =============================================================
import {
  COLECCIONES, ROLES, VERIFICACION, ESTADO_CITA, ESTADO_PAGO,
  PORCENTAJE_SENA,
} from '@/lib/constants'
import * as db from './mockDb'
import { delay, genId } from './persistence'
import { ensureSeed } from './seed'
import { haversine } from '@/lib/geo'

const init = () => ensureSeed()

// -------------------- USUARIOS --------------------
export const getUsuario = async (id) => {
  init()
  return db.findById(COLECCIONES.USUARIOS, 'id', id)
}

// -------------------- ARTISTAS (RF-02 / CU-02) --------------------
const overlaps = (a, b) => a.some((x) => b.includes(x))

export const listArtistas = async (filtros = {}) => {
  init()
  await delay(400)
  const {
    estilo, comuna, maxTarifa, minTarifa = 0, flash, q,
    onlyVerified = true, origin, sort = 'relevancia',
  } = filtros

  let rows = db.all(COLECCIONES.ARTISTAS)

  // RS-01: solo perfiles verificados son visibles públicamente
  if (onlyVerified) rows = rows.filter((a) => a.estado_verificacion === VERIFICACION.VERIFICADO)

  if (estilo) rows = rows.filter((a) => a.estilos.includes(estilo))
  if (comuna) rows = rows.filter((a) => a.comuna === comuna)
  if (typeof maxTarifa === 'number') rows = rows.filter((a) => a.tarifa_media <= maxTarifa)
  if (minTarifa) rows = rows.filter((a) => a.tarifa_media >= minTarifa)
  if (flash) rows = rows.filter((a) => a.flash_disponible)
  if (q) {
    const term = q.toLowerCase()
    rows = rows.filter(
      (a) =>
        a.nombre.toLowerCase().includes(term) ||
        a.estilos.some((e) => e.toLowerCase().includes(term)) ||
        (a.biografia || '').toLowerCase().includes(term),
    )
  }

  // Distancia geográfica (CU-02)
  rows = rows.map((a) => ({
    ...a,
    distancia: origin && a.coords ? haversine(origin, a.coords) : null,
  }))

  if (sort === 'distancia') rows.sort((a, b) => (a.distancia ?? 1e9) - (b.distancia ?? 1e9))
  else if (sort === 'rating') rows.sort((a, b) => b.rating - a.rating)
  else if (sort === 'precio_asc') rows.sort((a, b) => a.tarifa_media - b.tarifa_media)
  else if (sort === 'precio_desc') rows.sort((a, b) => b.tarifa_media - a.tarifa_media)
  else rows.sort((a, b) => b.rating * b.total_resenas - a.rating * a.total_resenas)

  return rows
}

export const getArtista = async (id) => {
  init()
  await delay(250)
  const artista = db.findById(COLECCIONES.ARTISTAS, 'id_artista', id)
  if (!artista) return null
  const usuario = db.findById(COLECCIONES.USUARIOS, 'id', id)
  const portafolio = db.find(COLECCIONES.PORTAFOLIO, (p) => p.id_artista === id)
  const resenas = db
    .find(COLECCIONES.RESENAS, (r) => r.id_artista === id)
    .map((r) => ({ ...r, cliente: db.findById(COLECCIONES.USUARIOS, 'id', r.id_cliente) }))
    .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion))
  const estudio = artista.estudio_id
    ? db.findById(COLECCIONES.ESTUDIOS, 'id_estudio', artista.estudio_id)
    : null
  return { ...artista, usuario, portafolio, resenas, estudio }
}

export const getArtistaByUser = async (userId) => getArtista(userId)

export const updateArtista = async (id, patch) => {
  init()
  await delay(300)
  return db.update(COLECCIONES.ARTISTAS, 'id_artista', id, patch)
}

// -------------------- ESTUDIOS --------------------
export const listEstudios = async ({ onlyCertified = false } = {}) => {
  init()
  await delay(300)
  let rows = db.all(COLECCIONES.ESTUDIOS)
  if (onlyCertified) rows = rows.filter((e) => e.estado_certificacion === VERIFICACION.VERIFICADO)
  return rows
}

export const getEstudio = async (id) => {
  init()
  const estudio = db.findById(COLECCIONES.ESTUDIOS, 'id_estudio', id)
  if (!estudio) return null
  const boxes = db.find(COLECCIONES.BOXES, (b) => b.id_estudio === id)
  return { ...estudio, boxes }
}

export const updateEstudio = async (id, patch) => {
  init()
  await delay(300)
  return db.update(COLECCIONES.ESTUDIOS, 'id_estudio', id, patch)
}

// -------------------- BOXES (BPMN Proceso 1) --------------------
export const listBoxes = async (estudioId) => {
  init()
  return db.find(COLECCIONES.BOXES, (b) => b.id_estudio === estudioId)
}

export const createBox = async (estudioId, data) => {
  init()
  await delay(400)
  const box = {
    id_box: genId('box'),
    id_estudio: estudioId,
    nombre_identificador: data.nombre_identificador,
    tarifa_hora: Number(data.tarifa_hora) || 0,
    estado_disponibilidad: true,
    equipamiento: data.equipamiento || '',
  }
  return db.insert(COLECCIONES.BOXES, box)
}

export const updateBox = async (id, patch) => {
  init()
  await delay(200)
  return db.update(COLECCIONES.BOXES, 'id_box', id, patch)
}

export const removeBox = async (id) => {
  init()
  await delay(200)
  db.remove(COLECCIONES.BOXES, 'id_box', id)
}

// -------------------- PORTAFOLIO (RF-03 / CU-03) --------------------
export const listPortafolio = async (artistaId) => {
  init()
  return db.find(COLECCIONES.PORTAFOLIO, (p) => p.id_artista === artistaId)
}

export const addPortafolioItem = async (artistaId, { url, estilo, titulo }) => {
  init()
  await delay(300)
  // RF-03: indexación por estilo obligatoria (validado también en UI)
  if (!estilo) throw new Error('Debes indexar la imagen con un estilo artístico.')
  const item = {
    id: genId('pf'),
    id_artista: artistaId,
    estilo,
    url,
    titulo: titulo || estilo,
    fecha: new Date().toISOString(),
  }
  return db.insert(COLECCIONES.PORTAFOLIO, item)
}

export const removePortafolioItem = async (id) => {
  init()
  await delay(150)
  db.remove(COLECCIONES.PORTAFOLIO, 'id', id)
}

// -------------------- RESERVAS (RF-04 / CU-04) --------------------
const enrichReserva = (r) => {
  const artista = db.findById(COLECCIONES.ARTISTAS, 'id_artista', r.id_artista)
  const cliente = db.findById(COLECCIONES.USUARIOS, 'id', r.id_cliente)
  const box = r.id_box ? db.findById(COLECCIONES.BOXES, 'id_box', r.id_box) : null
  const estudio = box ? db.findById(COLECCIONES.ESTUDIOS, 'id_estudio', box.id_estudio) : null
  const pago = db.findOne(COLECCIONES.PAGOS, (p) => p.id_reserva === r.id_reserva)
  const resena = db.findOne(COLECCIONES.RESENAS, (rv) => rv.id_reserva === r.id_reserva)
  return { ...r, artista, cliente, box, estudio, pago, resena }
}

export const listReservasCliente = async (clienteId) => {
  init()
  await delay(350)
  return db
    .find(COLECCIONES.RESERVAS, (r) => r.id_cliente === clienteId)
    .map(enrichReserva)
    .sort((a, b) => new Date(b.fecha_hora_inicio) - new Date(a.fecha_hora_inicio))
}

export const listReservasArtista = async (artistaId) => {
  init()
  await delay(350)
  return db
    .find(COLECCIONES.RESERVAS, (r) => r.id_artista === artistaId)
    .map(enrichReserva)
    .sort((a, b) => new Date(a.fecha_hora_inicio) - new Date(b.fecha_hora_inicio))
}

export const getReserva = async (id) => {
  init()
  const r = db.findById(COLECCIONES.RESERVAS, 'id_reserva', id)
  return r ? enrichReserva(r) : null
}

// CU-04 5.a: control de concurrencia — ¿el bloque ya está tomado?
export const isSlotTaken = (artistaId, startISO) => {
  const start = new Date(startISO).getTime()
  return db
    .find(COLECCIONES.RESERVAS, (r) => r.id_artista === artistaId)
    .some(
      (r) =>
        r.estado_cita !== ESTADO_CITA.CANCELADA &&
        new Date(r.fecha_hora_inicio).getTime() === start,
    )
}

export const createReserva = async (data) => {
  init()
  await delay(400)
  // Verificación anti-colisión (CU-04)
  if (isSlotTaken(data.id_artista, data.fecha_hora_inicio)) {
    const err = new Error('Ese bloque acaba de ser tomado. Elige otro horario.')
    err.code = 'SLOT_TAKEN'
    throw err
  }
  const reserva = {
    id_reserva: genId('res'),
    id_cliente: data.id_cliente,
    id_artista: data.id_artista,
    id_box: data.id_box || null,
    fecha_hora_inicio: data.fecha_hora_inicio,
    fecha_hora_fin: data.fecha_hora_fin,
    estado_cita: ESTADO_CITA.PENDIENTE_PAGO, // bloqueo temporal hasta el pago
    valor_total_estimado: Number(data.valor_total_estimado) || 0,
    estilo: data.estilo || '',
    descripcion: data.descripcion || '',
    creada: new Date().toISOString(),
  }
  return db.insert(COLECCIONES.RESERVAS, reserva)
}

export const updateReservaEstado = async (id, estado_cita) => {
  init()
  await delay(250)
  return db.update(COLECCIONES.RESERVAS, 'id_reserva', id, { estado_cita })
}

// -------------------- PAGOS (RF-05 / CU-05) --------------------
export const procesarPago = async (reservaId, { exito = true } = {}) => {
  init()
  await delay(1100) // simula la pasarela Webpay
  const reserva = db.findById(COLECCIONES.RESERVAS, 'id_reserva', reservaId)
  if (!reserva) throw new Error('Reserva no encontrada.')

  const montoSena = Math.round(reserva.valor_total_estimado * PORCENTAJE_SENA)

  if (!exito) {
    // Ruta transacción fallida (BPMN Proceso 2): libera el bloque
    db.update(COLECCIONES.RESERVAS, 'id_reserva', reservaId, { estado_cita: ESTADO_CITA.CANCELADA })
    db.insert(COLECCIONES.PAGOS, {
      id_pago: genId('pay'),
      id_reserva: reservaId,
      token_transbank: `TBK-${genId('').slice(0, 8).toUpperCase()}`,
      monto_sena: montoSena,
      fecha_pago: new Date().toISOString(),
      estado_pago: ESTADO_PAGO.RECHAZADO,
    })
    throw new Error('La transacción fue rechazada por el banco.')
  }

  // Ruta exitosa
  const pago = {
    id_pago: genId('pay'),
    id_reserva: reservaId,
    token_transbank: `TBK-${genId('').slice(0, 8).toUpperCase()}`,
    monto_sena: montoSena,
    fecha_pago: new Date().toISOString(),
    estado_pago: ESTADO_PAGO.APROBADO,
  }
  db.insert(COLECCIONES.PAGOS, pago)
  db.update(COLECCIONES.RESERVAS, 'id_reserva', reservaId, { estado_cita: ESTADO_CITA.CONFIRMADA })

  // Notificaciones push automáticas a cliente y artista (CU-05)
  const artista = db.findById(COLECCIONES.ARTISTAS, 'id_artista', reserva.id_artista)
  await crearNotificacion(reserva.id_cliente, {
    tipo: 'reserva', titulo: 'Cita confirmada',
    mensaje: `Tu seña fue procesada. Cita con ${artista?.nombre} confirmada.`,
    data: { reserva: reservaId },
  })
  await crearNotificacion(reserva.id_artista, {
    tipo: 'reserva', titulo: 'Nueva reserva confirmada',
    mensaje: 'Un cliente confirmó y pagó la seña de una nueva cita.',
    data: { reserva: reservaId },
  })

  return { pago, montoSena }
}

export const getPagoByReserva = async (reservaId) => {
  init()
  return db.findOne(COLECCIONES.PAGOS, (p) => p.id_reserva === reservaId)
}

// -------------------- RESEÑAS (RF-06 / CU-06) --------------------
// CU-06: solo se permite reseñar citas Ejecutadas + pagadas
export const puedeResenar = (reserva) => {
  if (!reserva) return false
  const pagada = reserva.pago?.estado_pago === ESTADO_PAGO.APROBADO
  const ejecutada = reserva.estado_cita === ESTADO_CITA.EJECUTADA
  const yaResenada = Boolean(reserva.resena)
  return ejecutada && pagada && !yaResenada
}

export const crearResena = async (reservaId, { puntaje, comentario }) => {
  init()
  await delay(400)
  const reserva = await getReserva(reservaId)
  // Validación lógica (CU-06 3.a): bloquea fraude / manipulación
  if (!puedeResenar(reserva)) {
    const err = new Error('No puedes evaluar esta cita.')
    err.code = 'NOT_ALLOWED'
    throw err
  }
  const resena = {
    id_resena: genId('rev'),
    id_reserva: reservaId,
    id_artista: reserva.id_artista,
    id_cliente: reserva.id_cliente,
    puntaje_estrellas: Number(puntaje),
    comentario,
    fecha_publicacion: new Date().toISOString(),
  }
  db.insert(COLECCIONES.RESENAS, resena)

  // Recalcular promedio del artista
  const todas = db.find(COLECCIONES.RESENAS, (r) => r.id_artista === reserva.id_artista)
  const prom = todas.reduce((s, r) => s + r.puntaje_estrellas, 0) / todas.length
  db.update(COLECCIONES.ARTISTAS, 'id_artista', reserva.id_artista, {
    rating: Math.round(prom * 10) / 10,
    total_resenas: todas.length,
  })
  return resena
}

export const listResenasArtista = async (artistaId) => {
  init()
  const resenas = db.find(COLECCIONES.RESENAS, (r) => r.id_artista === artistaId)
  return resenas
    .map((r) => ({ ...r, cliente: db.findById(COLECCIONES.USUARIOS, 'id', r.id_cliente) }))
    .sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion))
}

// -------------------- NOTIFICACIONES (CU-05) --------------------
export const crearNotificacion = async (usuarioId, { tipo, titulo, mensaje, data }) => {
  init()
  const noti = {
    id: genId('not'),
    id_usuario: usuarioId,
    tipo, titulo, mensaje,
    data: data || {},
    leida: false,
    fecha: new Date().toISOString(),
  }
  return db.insert(COLECCIONES.NOTIFICACIONES, noti)
}

export const listNotificaciones = async (usuarioId) => {
  init()
  return db
    .find(COLECCIONES.NOTIFICACIONES, (n) => n.id_usuario === usuarioId)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
}

export const marcarLeida = async (id) => {
  init()
  return db.update(COLECCIONES.NOTIFICACIONES, 'id', id, { leida: true })
}

export const marcarTodasLeidas = async (usuarioId) => {
  init()
  db.find(COLECCIONES.NOTIFICACIONES, (n) => n.id_usuario === usuarioId && !n.leida).forEach((n) =>
    db.update(COLECCIONES.NOTIFICACIONES, 'id', n.id, { leida: true }),
  )
}

// -------------------- ADMIN (RF-07 / CU-07) --------------------
export const getDocumentosPendientes = async () => {
  init()
  await delay(300)
  const artistas = db
    .find(COLECCIONES.ARTISTAS, (a) => a.estado_verificacion === VERIFICACION.PENDIENTE)
    .map((a) => ({ tipo: ROLES.ARTISTA, id: a.id_artista, nombre: a.nombre, avatar: a.avatar, doc: a.resolucion_sanitaria_url, comuna: a.comuna, estado: a.estado_verificacion }))
  const estudios = db
    .find(COLECCIONES.ESTUDIOS, (e) => e.estado_certificacion === VERIFICACION.PENDIENTE)
    .map((e) => ({ tipo: ROLES.ESTUDIO, id: e.id_estudio, nombre: e.nombre_fantasia, avatar: e.avatar, doc: e.seremi_resolucion_url, comuna: e.comuna, estado: e.estado_certificacion }))
  return [...artistas, ...estudios]
}

export const aprobarDocumento = async (tipo, id) => {
  init()
  await delay(400)
  if (tipo === ROLES.ARTISTA) {
    db.update(COLECCIONES.ARTISTAS, 'id_artista', id, { estado_verificacion: VERIFICACION.VERIFICADO })
  } else {
    db.update(COLECCIONES.ESTUDIOS, 'id_estudio', id, { estado_certificacion: VERIFICACION.VERIFICADO })
  }
  await crearNotificacion(id, {
    tipo: 'moderacion', titulo: 'Perfil verificado ✓',
    mensaje: 'Tu documentación sanitaria fue aprobada. Ya eres visible en el marketplace.',
    data: {},
  })
}

export const rechazarDocumento = async (tipo, id, motivo) => {
  init()
  await delay(400)
  if (tipo === ROLES.ARTISTA) {
    db.update(COLECCIONES.ARTISTAS, 'id_artista', id, { estado_verificacion: VERIFICACION.RECHAZADO })
  } else {
    db.update(COLECCIONES.ESTUDIOS, 'id_estudio', id, { estado_certificacion: VERIFICACION.RECHAZADO })
  }
  await crearNotificacion(id, {
    tipo: 'moderacion', titulo: 'Documentación rechazada',
    mensaje: `Tu documento fue rechazado. Motivo: ${motivo || 'No cumple la normativa SEREMI.'} Vuelve a subirlo.`,
    data: {},
  })
}

export const listUsuariosAdmin = async () => {
  init()
  await delay(300)
  return db.all(COLECCIONES.USUARIOS).map(({ passwordHash, ...u }) => u)
}

export const getMetricas = async () => {
  init()
  await delay(400)
  const usuarios = db.all(COLECCIONES.USUARIOS)
  const artistas = db.all(COLECCIONES.ARTISTAS)
  const estudios = db.all(COLECCIONES.ESTUDIOS)
  const reservas = db.all(COLECCIONES.RESERVAS)
  const pagos = db.all(COLECCIONES.PAGOS).filter((p) => p.estado_pago === ESTADO_PAGO.APROBADO)
  const resenas = db.all(COLECCIONES.RESENAS)

  const totalSenas = pagos.reduce((s, p) => s + p.monto_sena, 0)
  const comisionAcumulada = totalSenas // la seña 10% representa la comisión recaudada en el demo

  return {
    totalUsuarios: usuarios.length,
    totalClientes: usuarios.filter((u) => u.tipo_rol === ROLES.CLIENTE).length,
    totalArtistas: artistas.length,
    totalEstudios: estudios.length,
    artistasVerificados: artistas.filter((a) => a.estado_verificacion === VERIFICACION.VERIFICADO).length,
    pendientesValidacion:
      artistas.filter((a) => a.estado_verificacion === VERIFICACION.PENDIENTE).length +
      estudios.filter((e) => e.estado_certificacion === VERIFICACION.PENDIENTE).length,
    totalReservas: reservas.length,
    reservasConfirmadas: reservas.filter((r) => r.estado_cita === ESTADO_CITA.CONFIRMADA).length,
    reservasEjecutadas: reservas.filter((r) => r.estado_cita === ESTADO_CITA.EJECUTADA).length,
    totalTransado: pagos.length,
    montoSenas: totalSenas,
    comisionAcumulada,
    ratingPromedio:
      resenas.length > 0
        ? Math.round((resenas.reduce((s, r) => s + r.puntaje_estrellas, 0) / resenas.length) * 10) / 10
        : 0,
    // Serie para gráfico: reservas por mes (últimos 6 meses simplificado)
    reservasPorEstado: [
      { estado: 'Pendiente', valor: reservas.filter((r) => r.estado_cita === ESTADO_CITA.PENDIENTE_PAGO).length },
      { estado: 'Confirmada', valor: reservas.filter((r) => r.estado_cita === ESTADO_CITA.CONFIRMADA).length },
      { estado: 'Ejecutada', valor: reservas.filter((r) => r.estado_cita === ESTADO_CITA.EJECUTADA).length },
      { estado: 'Cancelada', valor: reservas.filter((r) => r.estado_cita === ESTADO_CITA.CANCELADA).length },
    ],
  }
}
