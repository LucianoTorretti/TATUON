-- =============================================================
-- TATU ON — 001 Esquema base (MVP)
-- Cubre las pantallas actuales. Se extiende con nuevas migraciones
-- según el Master Plan (disputas, chat, cupones, i18n, etc.).
-- Los valores de los enums coinciden con src/lib/constants.js.
-- =============================================================

create extension if not exists btree_gist with schema extensions;

-- ---------- Enums ----------
create type public.rol_usuario as enum ('cliente', 'artista', 'estudio', 'admin');
create type public.estado_verificacion as enum (
  'Pendiente de Validación', 'Verificado', 'Rechazado', 'Sin Documento'
);
create type public.estado_cita as enum ('Pendiente_Pago', 'Confirmada', 'Ejecutada', 'Cancelada');
create type public.estado_pago as enum ('Procesando', 'Aprobado', 'Rechazado');
create type public.estado_cuenta as enum ('Activa', 'Suspendida');

-- ---------- Identidad ----------
-- 1:1 con auth.users. Se crea por trigger al registrarse (ver 003).
create table public.usuarios (
  id              uuid primary key references auth.users (id) on delete cascade,
  nombre          text not null check (char_length(nombre) between 2 and 150),
  email           text not null unique,
  telefono        text not null default '',
  tipo_rol        public.rol_usuario not null default 'cliente',
  comuna          text not null default 'Santiago Centro',
  avatar          text,
  estado_cuenta   public.estado_cuenta not null default 'Activa',
  fecha_registro  timestamptz not null default now()
);
create index usuarios_tipo_rol_idx on public.usuarios (tipo_rol);

-- ---------- Catálogo ----------
create table public.estilos (
  nombre  text primary key,
  orden   smallint not null default 0
);

insert into public.estilos (nombre, orden) values
  ('Realismo', 1), ('Neotradicional', 2), ('Blackwork', 3), ('Puntillismo', 4),
  ('Fineline', 5), ('Tradicional', 6), ('Acuarela', 7), ('Geométrico', 8);

create table public.estudios (
  id_estudio             uuid primary key references public.usuarios (id) on delete cascade,
  nombre_fantasia        text not null,
  direccion              text not null default '',
  comuna                 text not null,
  lat                    double precision,
  lng                    double precision,
  descripcion            text not null default '',
  cover                  text,
  seremi_resolucion_url  text,  -- ruta en bucket privado "documentos"
  estado_certificacion   public.estado_verificacion not null default 'Sin Documento',
  motivo_rechazo         text,
  rating                 numeric(2, 1) not null default 0,
  total_resenas          integer not null default 0
);
create index estudios_estado_idx on public.estudios (estado_certificacion);

create table public.artistas (
  id_artista                uuid primary key references public.usuarios (id) on delete cascade,
  biografia                 text not null default '',
  tarifa_media              integer not null default 0 check (tarifa_media >= 0),  -- CLP
  comuna                    text not null,
  lat                       double precision,
  lng                       double precision,
  estudio_id                uuid references public.estudios (id_estudio) on delete set null,
  instagram                 text not null default '',
  flash_disponible          boolean not null default false,
  portafolio_cover          text,
  resolucion_sanitaria_url  text,  -- ruta en bucket privado "documentos"
  estado_verificacion       public.estado_verificacion not null default 'Sin Documento',
  motivo_rechazo            text,
  rating                    numeric(2, 1) not null default 0,  -- recalculado por trigger
  total_resenas             integer not null default 0
);
create index artistas_estado_idx on public.artistas (estado_verificacion);
create index artistas_estudio_idx on public.artistas (estudio_id);

create table public.artista_estilo (
  id_artista  uuid not null references public.artistas (id_artista) on delete cascade,
  estilo      text not null references public.estilos (nombre) on update cascade,
  primary key (id_artista, estilo)
);
create index artista_estilo_estilo_idx on public.artista_estilo (estilo, id_artista);

create table public.boxes (
  id_box                 uuid primary key default gen_random_uuid(),
  id_estudio             uuid not null references public.estudios (id_estudio) on delete cascade,
  nombre_identificador   text not null check (char_length(nombre_identificador) between 1 and 100),
  tarifa_hora            integer not null default 0 check (tarifa_hora >= 0),
  equipamiento           text not null default '',
  estado_disponibilidad  boolean not null default true
);
create index boxes_estudio_idx on public.boxes (id_estudio);

create table public.portafolio (
  id            uuid primary key default gen_random_uuid(),
  id_artista    uuid not null references public.artistas (id_artista) on delete cascade,
  estilo        text not null references public.estilos (nombre) on update cascade,  -- RF-03
  url           text not null,
  storage_path  text,  -- ruta en bucket "portafolio" (null para imágenes estáticas del seed)
  titulo        text not null default '',
  fecha         timestamptz not null default now()
);
create index portafolio_artista_idx on public.portafolio (id_artista, fecha);
create index portafolio_estilo_idx on public.portafolio (estilo, id_artista);

-- ---------- Agendamiento ----------
create table public.reservas (
  id_reserva            uuid primary key default gen_random_uuid(),
  id_cliente            uuid not null references public.usuarios (id) on delete cascade,
  id_artista            uuid not null references public.artistas (id_artista) on delete cascade,
  id_box                uuid references public.boxes (id_box) on delete set null,
  fecha_hora_inicio     timestamptz not null,
  fecha_hora_fin        timestamptz not null,
  estado_cita           public.estado_cita not null default 'Pendiente_Pago',
  valor_total_estimado  integer not null check (valor_total_estimado > 0),  -- CLP, congelado
  estilo                text references public.estilos (nombre) on update cascade,
  descripcion           text not null default '',
  creada                timestamptz not null default now(),
  expira_en             timestamptz,  -- fin del bloqueo temporal mientras está Pendiente_Pago
  check (fecha_hora_fin > fecha_hora_inicio),
  -- CU-04: anti-colisión a nivel de base de datos (no solo en la app)
  constraint reservas_sin_solape_artista exclude using gist (
    id_artista with =,
    tstzrange(fecha_hora_inicio, fecha_hora_fin) with &&
  ) where (estado_cita <> 'Cancelada'),
  constraint reservas_sin_solape_box exclude using gist (
    id_box with =,
    tstzrange(fecha_hora_inicio, fecha_hora_fin) with &&
  ) where (estado_cita <> 'Cancelada' and id_box is not null)
);
create index reservas_cliente_idx on public.reservas (id_cliente, fecha_hora_inicio desc);
create index reservas_artista_idx on public.reservas (id_artista, fecha_hora_inicio);
create index reservas_box_idx on public.reservas (id_box, fecha_hora_inicio);
create index reservas_pendientes_idx on public.reservas (expira_en) where estado_cita = 'Pendiente_Pago';

-- ---------- Pagos ----------
create table public.pagos (
  id_pago              uuid primary key default gen_random_uuid(),
  id_reserva           uuid not null unique references public.reservas (id_reserva) on delete cascade,
  proveedor            text not null default 'Webpay (simulado)',
  token_transbank      text not null unique,
  monto_sena           integer not null check (monto_sena >= 0),
  comision_plataforma  integer not null default 0 check (comision_plataforma >= 0),
  fecha_pago           timestamptz not null default now(),
  estado_pago          public.estado_pago not null
);
create index pagos_estado_idx on public.pagos (estado_pago);

-- ---------- Reputación ----------
create table public.resenas (
  id_resena          uuid primary key default gen_random_uuid(),
  id_reserva         uuid not null unique references public.reservas (id_reserva) on delete cascade,
  id_artista         uuid not null references public.artistas (id_artista) on delete cascade,
  id_cliente         uuid not null references public.usuarios (id) on delete cascade,
  puntaje_estrellas  smallint not null check (puntaje_estrellas between 1 and 5),
  comentario         text not null check (char_length(comentario) between 1 and 2000),
  fecha_publicacion  timestamptz not null default now()
);
create index resenas_artista_idx on public.resenas (id_artista, fecha_publicacion desc);

-- ---------- Comunicación ----------
create table public.notificaciones (
  id          uuid primary key default gen_random_uuid(),
  id_usuario  uuid not null references public.usuarios (id) on delete cascade,
  tipo        text not null,
  titulo      text not null,
  mensaje     text not null,
  data        jsonb not null default '{}'::jsonb,
  leida       boolean not null default false,
  fecha       timestamptz not null default now()
);
create index notificaciones_usuario_idx on public.notificaciones (id_usuario, fecha desc);

-- ---------- Vistas de lectura ----------
-- Datos públicos de perfil (sin email/teléfono). Vista con permisos del
-- dueño: permite mostrar nombre/avatar de otros sin abrir la tabla usuarios.
create view public.perfiles_publicos as
  select id, nombre, avatar, tipo_rol, comuna
  from public.usuarios
  where estado_cuenta = 'Activa';

-- Artista "plano" con la forma que consume la UI. security_invoker: respeta
-- el RLS de artistas (RS-01: solo verificados son visibles públicamente).
create view public.v_artistas with (security_invoker = true) as
  select
    a.*,
    p.nombre,
    p.avatar,
    coalesce(
      (select array_agg(ae.estilo order by e.orden)
         from public.artista_estilo ae
         join public.estilos e on e.nombre = ae.estilo
        where ae.id_artista = a.id_artista),
      '{}'::text[]
    ) as estilos,
    coalesce(
      a.portafolio_cover,
      (select pf.url from public.portafolio pf
        where pf.id_artista = a.id_artista order by pf.fecha limit 1)
    ) as portafolio_cover_efectivo
  from public.artistas a
  join public.perfiles_publicos p on p.id = a.id_artista;
