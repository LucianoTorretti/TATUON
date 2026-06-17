// =============================================================
// Datos semilla realistas — contexto chileno (Santiago / Valparaíso)
// Se cargan en localStorage en el primer arranque (ver services/mock/seed.js)
// =============================================================
import { ROLES, VERIFICACION, ESTADO_CITA, ESTADO_PAGO } from '@/lib/constants'

const img = (seed) => `https://picsum.photos/seed/${seed}/800/800`
const avatar = (seed) => `https://i.pravatar.cc/300?img=${seed}`

// Fechas relativas a "ahora" para que el demo siempre se vea vigente
const now = Date.now()
const days = (n) => new Date(now + n * 86400000).toISOString()
const at = (n, hour) => {
  const d = new Date(now + n * 86400000)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

// -------------------------------------------------------------
// USUARIOS (incluye las 4 cuentas demo)
// password en claro solo en seed; el loader lo convierte a hash
// -------------------------------------------------------------
export const usuarios = [
  // --- Cuentas demo ---
  {
    id: 'u-cliente',
    nombre: 'Valentina Rojas',
    email: 'cliente@tatuon.cl',
    password: 'demo1234',
    telefono: '+56 9 8123 4567',
    tipo_rol: ROLES.CLIENTE,
    avatar: avatar(45),
    comuna: 'Providencia',
    fecha_registro: days(-120),
  },
  {
    id: 'u-art-1',
    nombre: 'Camilo Fuentes',
    email: 'artista@tatuon.cl',
    password: 'demo1234',
    telefono: '+56 9 9876 5432',
    tipo_rol: ROLES.ARTISTA,
    avatar: avatar(12),
    comuna: 'Providencia',
    fecha_registro: days(-300),
  },
  {
    id: 'u-est-1',
    nombre: 'Black Lotus Studio',
    email: 'estudio@tatuon.cl',
    password: 'demo1234',
    telefono: '+56 2 2345 6789',
    tipo_rol: ROLES.ESTUDIO,
    avatar: '/images/estudio.webp',
    comuna: 'Providencia',
    fecha_registro: days(-400),
  },
  {
    id: 'u-admin',
    nombre: 'Equipo TATU ON',
    email: 'admin@tatuon.cl',
    password: 'demo1234',
    telefono: '+56 2 2000 0000',
    tipo_rol: ROLES.ADMIN,
    avatar: avatar(68),
    comuna: 'Santiago Centro',
    fecha_registro: days(-500),
  },

  // --- Artistas adicionales ---
  { id: 'u-art-2', nombre: 'Antonia Vera', email: 'antonia.vera@mail.cl', password: 'demo1234', telefono: '+56 9 5544 3322', tipo_rol: ROLES.ARTISTA, avatar: avatar(31), comuna: 'Ñuñoa', fecha_registro: days(-280) },
  { id: 'u-art-3', nombre: 'Joaquín Salas', email: 'joaquin.salas@mail.cl', password: 'demo1234', telefono: '+56 9 4433 2211', tipo_rol: ROLES.ARTISTA, avatar: avatar(13), comuna: 'Bellavista', fecha_registro: days(-210) },
  { id: 'u-art-4', nombre: 'Fernanda Lillo', email: 'fer.lillo@mail.cl', password: 'demo1234', telefono: '+56 9 3322 1100', tipo_rol: ROLES.ARTISTA, avatar: avatar(47), comuna: 'Las Condes', fecha_registro: days(-190) },
  { id: 'u-art-5', nombre: 'Diego Carrasco', email: 'diego.carrasco@mail.cl', password: 'demo1234', telefono: '+56 9 2211 0099', tipo_rol: ROLES.ARTISTA, avatar: avatar(15), comuna: 'Valparaíso', fecha_registro: days(-160) },
  { id: 'u-art-6', nombre: 'Catalina Méndez', email: 'cata.mendez@mail.cl', password: 'demo1234', telefono: '+56 9 1100 9988', tipo_rol: ROLES.ARTISTA, avatar: avatar(48), comuna: 'Providencia', fecha_registro: days(-140) },
  { id: 'u-art-7', nombre: 'Sebastián Toro', email: 'seba.toro@mail.cl', password: 'demo1234', telefono: '+56 9 9988 7766', tipo_rol: ROLES.ARTISTA, avatar: avatar(33), comuna: 'Santiago Centro', fecha_registro: days(-95) },
  { id: 'u-art-8', nombre: 'Javiera Núñez', email: 'javi.nunez@mail.cl', password: 'demo1234', telefono: '+56 9 8877 6655', tipo_rol: ROLES.ARTISTA, avatar: avatar(49), comuna: 'Ñuñoa', fecha_registro: days(-40) },
  { id: 'u-art-9', nombre: 'Matías Herrera', email: 'matias.herrera@mail.cl', password: 'demo1234', telefono: '+56 9 7766 5544', tipo_rol: ROLES.ARTISTA, avatar: avatar(51), comuna: 'Las Condes', fecha_registro: days(-12) },

  // --- Estudios adicionales ---
  { id: 'u-est-2', nombre: 'Sagrado Ink', email: 'contacto@sagradoink.cl', password: 'demo1234', telefono: '+56 2 2444 5566', tipo_rol: ROLES.ESTUDIO, avatar: avatar(64), comuna: 'Ñuñoa', fecha_registro: days(-350) },
  { id: 'u-est-3', nombre: 'Norte Tattoo Lab', email: 'hola@nortetattoo.cl', password: 'demo1234', telefono: '+56 2 2777 8899', tipo_rol: ROLES.ESTUDIO, avatar: avatar(65), comuna: 'Las Condes', fecha_registro: days(-220) },
  { id: 'u-est-4', nombre: 'Puerto Ink', email: 'puerto@puertoink.cl', password: 'demo1234', telefono: '+56 32 2123 456', tipo_rol: ROLES.ESTUDIO, avatar: avatar(66), comuna: 'Valparaíso', fecha_registro: days(-80) },

  // --- Clientes adicionales (para reseñas/métricas) ---
  { id: 'u-cli-2', nombre: 'Tomás Aravena', email: 'tomas.a@mail.cl', password: 'demo1234', telefono: '+56 9 6655 4433', tipo_rol: ROLES.CLIENTE, avatar: avatar(53), comuna: 'Ñuñoa', fecha_registro: days(-70) },
  { id: 'u-cli-3', nombre: 'Isidora Pinto', email: 'isidora.p@mail.cl', password: 'demo1234', telefono: '+56 9 5566 7788', tipo_rol: ROLES.CLIENTE, avatar: avatar(44), comuna: 'Las Condes', fecha_registro: days(-30) },
]

// -------------------------------------------------------------
// ARTISTA_DETALLE  (RF-01, RF-03)
// coords = base habitual del artista (para el mapa y búsqueda)
// -------------------------------------------------------------
export const artistas = [
  {
    id_artista: 'u-art-1', nombre: 'Camilo Fuentes', avatar: avatar(12),
    estilos: ['Realismo', 'Blackwork'], tarifa_media: 95000, comuna: 'Providencia',
    coords: { lat: -33.4264, lng: -70.6189 }, estudio_id: 'u-est-1',
    biografia: 'Especialista en realismo en negro y gris con más de 8 años de trayectoria. Cada pieza es un proyecto único trabajado a partir de tus referencias.',
    estado_verificacion: VERIFICACION.VERIFICADO, resolucion_sanitaria_url: 'seremi_camilo_fuentes.pdf',
    flash_disponible: true, rating: 4.9, total_resenas: 124, instagram: '@camilo.ink',
    portafolioCover: '/images/portfolio/realismo-1.webp',
  },
  {
    id_artista: 'u-art-2', nombre: 'Antonia Vera', avatar: avatar(31),
    estilos: ['Fineline', 'Puntillismo'], tarifa_media: 70000, comuna: 'Ñuñoa',
    coords: { lat: -33.4569, lng: -70.5994 }, estudio_id: 'u-est-2',
    biografia: 'Fineline y micro-realismo. Diseños delicados, botánicos y minimalistas pensados para piel sensible.',
    estado_verificacion: VERIFICACION.VERIFICADO, resolucion_sanitaria_url: 'seremi_antonia_vera.pdf',
    flash_disponible: true, rating: 4.8, total_resenas: 89, instagram: '@anto.fineline',
  },
  {
    id_artista: 'u-art-3', nombre: 'Joaquín Salas', avatar: avatar(13),
    estilos: ['Neotradicional', 'Tradicional'], tarifa_media: 85000, comuna: 'Bellavista',
    coords: { lat: -33.4326, lng: -70.6347 }, estudio_id: null,
    biografia: 'Neotradicional de alto contraste y color saturado. Animales, dagas y flores con identidad propia.',
    estado_verificacion: VERIFICACION.VERIFICADO, resolucion_sanitaria_url: 'seremi_joaquin_salas.pdf',
    flash_disponible: false, rating: 4.7, total_resenas: 67, instagram: '@joaco.neotrad',
  },
  {
    id_artista: 'u-art-4', nombre: 'Fernanda Lillo', avatar: avatar(47),
    estilos: ['Acuarela', 'Geométrico'], tarifa_media: 110000, comuna: 'Las Condes',
    coords: { lat: -33.4085, lng: -70.5673 }, estudio_id: 'u-est-3',
    biografia: 'Acuarela y geometría sagrada. Composiciones vibrantes que combinan trazo fino y manchas de color.',
    estado_verificacion: VERIFICACION.VERIFICADO, resolucion_sanitaria_url: 'seremi_fernanda_lillo.pdf',
    flash_disponible: true, rating: 5.0, total_resenas: 142, instagram: '@fer.watercolor',
    portafolioCover: '/images/portfolio/acuarela-1.webp',
  },
  {
    id_artista: 'u-art-5', nombre: 'Diego Carrasco', avatar: avatar(15),
    estilos: ['Blackwork', 'Geométrico'], tarifa_media: 80000, comuna: 'Valparaíso',
    coords: { lat: -33.0472, lng: -71.6127 }, estudio_id: 'u-est-4',
    biografia: 'Blackwork ornamental y dotwork geométrico. Mandalas, líneas y patrones inspirados en el mar de Valparaíso.',
    estado_verificacion: VERIFICACION.VERIFICADO, resolucion_sanitaria_url: 'seremi_diego_carrasco.pdf',
    flash_disponible: true, rating: 4.6, total_resenas: 51, instagram: '@diego.blackwork',
  },
  {
    id_artista: 'u-art-6', nombre: 'Catalina Méndez', avatar: avatar(48),
    estilos: ['Realismo', 'Fineline'], tarifa_media: 100000, comuna: 'Providencia',
    coords: { lat: -33.4264, lng: -70.6189 }, estudio_id: 'u-est-1',
    biografia: 'Retrato realista y lettering fino. Trabajo cada cita como una sesión de arte personalizada.',
    estado_verificacion: VERIFICACION.VERIFICADO, resolucion_sanitaria_url: 'seremi_catalina_mendez.pdf',
    flash_disponible: false, rating: 4.9, total_resenas: 96, instagram: '@cata.realismo',
  },
  {
    id_artista: 'u-art-7', nombre: 'Sebastián Toro', avatar: avatar(33),
    estilos: ['Tradicional', 'Neotradicional'], tarifa_media: 65000, comuna: 'Santiago Centro',
    coords: { lat: -33.4372, lng: -70.6506 }, estudio_id: null,
    biografia: 'Old school tradicional con paleta clásica. Bold lines que envejecen bien con el tiempo.',
    estado_verificacion: VERIFICACION.VERIFICADO, resolucion_sanitaria_url: 'seremi_sebastian_toro.pdf',
    flash_disponible: true, rating: 4.5, total_resenas: 38, instagram: '@seba.oldschool',
  },
  {
    id_artista: 'u-art-8', nombre: 'Javiera Núñez', avatar: avatar(49),
    estilos: ['Puntillismo', 'Geométrico'], tarifa_media: 75000, comuna: 'Ñuñoa',
    coords: { lat: -33.4569, lng: -70.5994 }, estudio_id: 'u-est-2',
    // Pendiente de validación -> NO debe aparecer en el buscador (RS-01)
    biografia: 'Puntillismo y dotwork. Recién llegada a TATU ON, en proceso de verificación sanitaria.',
    estado_verificacion: VERIFICACION.PENDIENTE, resolucion_sanitaria_url: 'seremi_javiera_nunez.pdf',
    flash_disponible: false, rating: 0, total_resenas: 0, instagram: '@javi.dots',
  },
  {
    id_artista: 'u-art-9', nombre: 'Matías Herrera', avatar: avatar(51),
    estilos: ['Acuarela'], tarifa_media: 90000, comuna: 'Las Condes',
    coords: { lat: -33.4085, lng: -70.5673 }, estudio_id: null,
    // Rechazado -> NO aparece en el buscador (RS-01, CU-07)
    biografia: 'Acuarela abstracta. Documentación sanitaria rechazada, pendiente de subsanar.',
    estado_verificacion: VERIFICACION.RECHAZADO, resolucion_sanitaria_url: 'seremi_matias_herrera.pdf',
    flash_disponible: false, rating: 0, total_resenas: 0, instagram: '@matias.water',
  },
]

// -------------------------------------------------------------
// ESTUDIO_DETALLE  (RF-01, BPMN Proceso 1)
// -------------------------------------------------------------
export const estudios = [
  {
    id_estudio: 'u-est-1', nombre_fantasia: 'Black Lotus Studio', avatar: '/images/estudio.webp',
    direccion: 'Av. Providencia 1234', comuna: 'Providencia',
    lat: -33.4264, lng: -70.6189, seremi_resolucion_url: 'seremi_black_lotus.pdf',
    estado_certificacion: VERIFICACION.VERIFICADO, rating: 4.8, total_resenas: 210,
    descripcion: 'Estudio boutique con 4 boxes certificados, esterilización en autoclave y ambiente cálido.',
    cover: img('blacklotus'),
  },
  {
    id_estudio: 'u-est-2', nombre_fantasia: 'Sagrado Ink', avatar: avatar(64),
    direccion: 'Irarrázaval 4567', comuna: 'Ñuñoa',
    lat: -33.4569, lng: -70.5994, seremi_resolucion_url: 'seremi_sagrado_ink.pdf',
    estado_certificacion: VERIFICACION.VERIFICADO, rating: 4.7, total_resenas: 156,
    descripcion: 'Colectivo de artistas con foco en blackwork y fineline. Boxes amplios y luz natural.',
    cover: img('sagradoink'),
  },
  {
    id_estudio: 'u-est-3', nombre_fantasia: 'Norte Tattoo Lab', avatar: avatar(65),
    direccion: 'Apoquindo 8900', comuna: 'Las Condes',
    lat: -33.4085, lng: -70.5673, seremi_resolucion_url: 'seremi_norte_lab.pdf',
    estado_certificacion: VERIFICACION.VERIFICADO, rating: 4.9, total_resenas: 98,
    descripcion: 'Laboratorio creativo premium. Boxes con equipamiento de última generación.',
    cover: img('nortelab'),
  },
  {
    id_estudio: 'u-est-4', nombre_fantasia: 'Puerto Ink', avatar: avatar(66),
    direccion: 'Cerro Alegre 321', comuna: 'Valparaíso',
    lat: -33.0472, lng: -71.6127, seremi_resolucion_url: 'seremi_puerto_ink.pdf',
    // Pendiente -> el estudio aún no certificado (CU-07)
    estado_certificacion: VERIFICACION.PENDIENTE, rating: 0, total_resenas: 0,
    descripcion: 'Estudio porteño en proceso de certificación SEREMI. Vista al mar.',
    cover: img('puertoink'),
  },
]

// -------------------------------------------------------------
// BOX_ESPACIO
// -------------------------------------------------------------
export const boxes = [
  { id_box: 'box-1', id_estudio: 'u-est-1', nombre_identificador: 'Box A — Privado', tarifa_hora: 12000, estado_disponibilidad: true, equipamiento: 'Camilla hidráulica, autoclave, aire acondicionado' },
  { id_box: 'box-2', id_estudio: 'u-est-1', nombre_identificador: 'Box B — Ventanal', tarifa_hora: 10000, estado_disponibilidad: true, equipamiento: 'Luz natural, camilla regulable, esterilizador' },
  { id_box: 'box-3', id_estudio: 'u-est-2', nombre_identificador: 'Box Norte', tarifa_hora: 9000, estado_disponibilidad: true, equipamiento: 'Camilla, autoclave compartido' },
  { id_box: 'box-4', id_estudio: 'u-est-3', nombre_identificador: 'Suite Premium', tarifa_hora: 18000, estado_disponibilidad: true, equipamiento: 'Sala privada, sonido, frigobar, autoclave dedicado' },
  { id_box: 'box-5', id_estudio: 'u-est-3', nombre_identificador: 'Box Creativo', tarifa_hora: 14000, estado_disponibilidad: false, equipamiento: 'Camilla, mesa de diseño digital' },
]

// -------------------------------------------------------------
// PORTAFOLIO (RF-03) — imágenes indexadas por estilo
// Imágenes locales para portafolios de Camilo Fuentes (u-art-1) y Fernanda Lillo (u-art-4)
const LOCAL_PORTFOLIO = {
  'u-art-1': {
    'Realismo': [
      '/images/portfolio/realismo-1.webp',
      '/images/portfolio/realismo-2.webp',
      '/images/portfolio/realismo-3.webp',
    ],
    'Blackwork': [
      '/images/portfolio/blackwork-1.webp',
      '/images/portfolio/blackwork-2.webp',
      '/images/portfolio/blackwork-3.webp',
    ],
  },
  'u-art-4': {
    'Acuarela': [
      '/images/portfolio/acuarela-1.webp',
      '/images/portfolio/acuarela-2.webp',
      '/images/portfolio/acuarela-3.webp',
    ],
    'Geométrico': [
      '/images/portfolio/geometrico-1.webp',
      '/images/portfolio/geometrico-2.webp',
      '/images/portfolio/geometrico-3.webp',
    ],
  },
}

// -------------------------------------------------------------
const buildPortfolio = () => {
  const items = []
  artistas.forEach((a) => {
    if (a.estado_verificacion !== VERIFICACION.VERIFICADO) return
    a.estilos.forEach((estilo, i) => {
      for (let k = 0; k < 3; k++) {
        const localUrl = LOCAL_PORTFOLIO[a.id_artista]?.[estilo]?.[k]
        items.push({
          id: `pf-${a.id_artista}-${i}-${k}`,
          id_artista: a.id_artista,
          estilo,
          url: localUrl ?? img(`${a.id_artista}-${estilo}-${k}`),
          titulo: `${estilo} · pieza ${k + 1}`,
          fecha: days(-(10 + k * 7 + i * 3)),
        })
      }
    })
  })
  return items
}
export const portafolio = buildPortfolio()

// -------------------------------------------------------------
// RESERVA_CITA — varios estados para historial y reseñas
// -------------------------------------------------------------
export const reservas = [
  {
    id_reserva: 'res-1', id_cliente: 'u-cliente', id_artista: 'u-art-1', id_box: 'box-1',
    fecha_hora_inicio: at(-25, 16), fecha_hora_fin: at(-25, 19),
    estado_cita: ESTADO_CITA.EJECUTADA, valor_total_estimado: 180000, estilo: 'Realismo',
    descripcion: 'Retrato realista antebrazo (continuación de manga).', creada: days(-40),
  },
  {
    id_reserva: 'res-2', id_cliente: 'u-cliente', id_artista: 'u-art-4', id_box: 'box-4',
    fecha_hora_inicio: at(-10, 15), fecha_hora_fin: at(-10, 17),
    estado_cita: ESTADO_CITA.EJECUTADA, valor_total_estimado: 120000, estilo: 'Acuarela',
    descripcion: 'Acuarela floral tobillo.', creada: days(-20),
  },
  {
    id_reserva: 'res-3', id_cliente: 'u-cliente', id_artista: 'u-art-2', id_box: 'box-3',
    fecha_hora_inicio: at(4, 17), fecha_hora_fin: at(4, 18),
    estado_cita: ESTADO_CITA.CONFIRMADA, valor_total_estimado: 70000, estilo: 'Fineline',
    descripcion: 'Fineline botánico muñeca.', creada: days(-2),
  },
  {
    id_reserva: 'res-4', id_cliente: 'u-cli-2', id_artista: 'u-art-1', id_box: 'box-2',
    fecha_hora_inicio: at(-5, 12), fecha_hora_fin: at(-5, 15),
    estado_cita: ESTADO_CITA.EJECUTADA, valor_total_estimado: 150000, estilo: 'Blackwork',
    descripcion: 'Blackwork geométrico hombro.', creada: days(-15),
  },
  {
    id_reserva: 'res-5', id_cliente: 'u-cli-3', id_artista: 'u-art-4', id_box: 'box-4',
    fecha_hora_inicio: at(7, 11), fecha_hora_fin: at(7, 13),
    estado_cita: ESTADO_CITA.PENDIENTE_PAGO, valor_total_estimado: 110000, estilo: 'Geométrico',
    descripcion: 'Mandala geométrico espalda.', creada: days(-1),
  },
  {
    id_reserva: 'res-6', id_cliente: 'u-cliente', id_artista: 'u-art-6', id_box: null,
    fecha_hora_inicio: at(-2, 18), fecha_hora_fin: at(-2, 19),
    estado_cita: ESTADO_CITA.CANCELADA, valor_total_estimado: 60000, estilo: 'Fineline',
    descripcion: 'Lettering antebrazo (cancelada por el cliente).', creada: days(-6),
  },
]

// -------------------------------------------------------------
// PAGO_TRANSACCION
// -------------------------------------------------------------
export const pagos = [
  { id_pago: 'pay-1', id_reserva: 'res-1', token_transbank: 'TBK-9X2K7A1', monto_sena: 18000, fecha_pago: days(-40), estado_pago: ESTADO_PAGO.APROBADO },
  { id_pago: 'pay-2', id_reserva: 'res-2', token_transbank: 'TBK-4P8L3M9', monto_sena: 12000, fecha_pago: days(-20), estado_pago: ESTADO_PAGO.APROBADO },
  { id_pago: 'pay-3', id_reserva: 'res-3', token_transbank: 'TBK-1Q5R6T2', monto_sena: 7000, fecha_pago: days(-2), estado_pago: ESTADO_PAGO.APROBADO },
  { id_pago: 'pay-4', id_reserva: 'res-4', token_transbank: 'TBK-7B3N8V4', monto_sena: 15000, fecha_pago: days(-15), estado_pago: ESTADO_PAGO.APROBADO },
]

// -------------------------------------------------------------
// RESENA_CALIFICACION (RF-06) — solo de citas Ejecutadas
// -------------------------------------------------------------
export const resenas = [
  { id_resena: 'rev-1', id_reserva: 'res-1', id_artista: 'u-art-1', id_cliente: 'u-cliente', puntaje_estrellas: 5, comentario: 'Camilo es un crack. El realismo quedó impecable y el box súper limpio. 100% recomendado.', fecha_publicacion: days(-23) },
  { id_resena: 'rev-2', id_reserva: 'res-2', id_artista: 'u-art-4', id_cliente: 'u-cliente', puntaje_estrellas: 5, comentario: 'Fernanda interpretó justo lo que quería. Los colores de la acuarela son hermosos.', fecha_publicacion: days(-9) },
  { id_resena: 'rev-3', id_reserva: 'res-4', id_artista: 'u-art-1', id_cliente: 'u-cli-2', puntaje_estrellas: 5, comentario: 'Atención profesional de principio a fin. La reserva por la app fue muy fácil.', fecha_publicacion: days(-4) },
]

// -------------------------------------------------------------
// NOTIFICACIONES (CU-05 push simuladas)
// -------------------------------------------------------------
export const notificaciones = [
  { id: 'not-1', id_usuario: 'u-cliente', tipo: 'reserva', titulo: 'Cita confirmada', mensaje: 'Tu cita con Antonia Vera fue confirmada para el ' , data: { reserva: 'res-3' }, leida: false, fecha: days(-2) },
  { id: 'not-2', id_usuario: 'u-cliente', tipo: 'resena', titulo: 'Evalúa tu experiencia', mensaje: 'Ya puedes calificar tu sesión con Fernanda Lillo.', data: { reserva: 'res-2' }, leida: false, fecha: days(-9) },
  { id: 'not-3', id_usuario: 'u-art-1', tipo: 'reserva', titulo: 'Nueva reserva', mensaje: 'Tomás Aravena reservó una sesión de Blackwork.', data: { reserva: 'res-4' }, leida: true, fecha: days(-15) },
  { id: 'not-4', id_usuario: 'u-admin', tipo: 'moderacion', titulo: 'Documento pendiente', mensaje: 'Javiera Núñez subió su resolución sanitaria para revisión.', data: { artista: 'u-art-8' }, leida: false, fecha: days(-40) },
]
