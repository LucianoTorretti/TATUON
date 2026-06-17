// =============================================================
// Constantes globales del dominio TATU ON
// =============================================================

export const ROLES = {
  CLIENTE: 'cliente',
  ARTISTA: 'artista',
  ESTUDIO: 'estudio',
  ADMIN: 'admin',
}

export const ROLE_LABELS = {
  [ROLES.CLIENTE]: 'Cliente',
  [ROLES.ARTISTA]: 'Artista',
  [ROLES.ESTUDIO]: 'Estudio',
  [ROLES.ADMIN]: 'Administrador',
}

// Ruta de inicio (home) por rol tras iniciar sesión
export const ROLE_HOME = {
  [ROLES.CLIENTE]: '/cliente',
  [ROLES.ARTISTA]: '/artista',
  [ROLES.ESTUDIO]: '/estudio',
  [ROLES.ADMIN]: '/admin',
}

// Estados de verificación sanitaria (RF-01, RS-01, CU-07)
export const VERIFICACION = {
  PENDIENTE: 'Pendiente de Validación',
  VERIFICADO: 'Verificado',
  RECHAZADO: 'Rechazado',
  SIN_DOCUMENTO: 'Sin Documento',
}

// Estados de la reserva (modelo de datos: estado_cita)
export const ESTADO_CITA = {
  PENDIENTE_PAGO: 'Pendiente_Pago',
  CONFIRMADA: 'Confirmada',
  EJECUTADA: 'Ejecutada',
  CANCELADA: 'Cancelada',
}

export const ESTADO_CITA_LABEL = {
  [ESTADO_CITA.PENDIENTE_PAGO]: 'Pendiente de pago',
  [ESTADO_CITA.CONFIRMADA]: 'Confirmada',
  [ESTADO_CITA.EJECUTADA]: 'Ejecutada',
  [ESTADO_CITA.CANCELADA]: 'Cancelada',
}

// Estados de pago (modelo de datos: estado_pago)
export const ESTADO_PAGO = {
  PROCESANDO: 'Procesando',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
}

// Catálogo de estilos artísticos (modelo de datos: ESTILO_ARTISTICO)
export const ESTILOS = [
  'Realismo',
  'Neotradicional',
  'Blackwork',
  'Puntillismo',
  'Fineline',
  'Tradicional',
  'Acuarela',
  'Geométrico',
]

// Comisión y seña (modelo de negocio del informe)
export const COMISION_PLATAFORMA = 0.1 // 10%
export const PORCENTAJE_SENA = 0.1 // 10%

// Suscripción premium artistas
export const PRECIO_PREMIUM_MENSUAL = 15000 // CLP

// Tiempo de bloqueo temporal del bloque horario durante el pago (BPMN Proceso 2)
export const MINUTOS_BLOQUEO_RESERVA = 15

export const COLECCIONES = {
  USUARIOS: 'usuarios',
  ARTISTAS: 'artistas',
  ESTUDIOS: 'estudios',
  BOXES: 'boxes',
  RESERVAS: 'reservas',
  PAGOS: 'pagos',
  RESENAS: 'resenas',
  NOTIFICACIONES: 'notificaciones',
  PORTAFOLIO: 'portafolio',
}
