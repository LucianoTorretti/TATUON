// Valida las migraciones de TATU ON (RLS + reglas de negocio) en PGlite,
// un Postgres embebido, con un entorno que imita Supabase. Uso: npm run test:db
import { PGlite } from '@electric-sql/pglite'
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const MIG = process.argv[2] || fileURLToPath(new URL('../migrations', import.meta.url))
const db = new PGlite({ extensions: { btree_gist } })

const STUB = `
create role anon nologin; create role authenticated nologin;
create schema extensions; create schema auth; create schema storage;
grant usage on schema public, auth, storage, extensions to anon, authenticated;
create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant execute on function auth.uid() to anon, authenticated;
create table storage.buckets (id text primary key, name text, public bool, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql immutable as $$
  select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
grant execute on function storage.foldername(text) to anon, authenticated;
grant select, insert, update, delete on storage.objects to authenticated;
-- Como Supabase: privilegios amplios por defecto en public (las migraciones deben revocarlos)
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;
`

let pass = 0, fail = 0
const ok = (cond, msg) => { if (cond) { pass++; console.log('  ✓', msg) } else { fail++; console.log('  ✗', msg) } }

// Ejecuta SQL como un rol/usuario; devuelve {rows} o {error}
const as = async (role, uid, sql, params = []) => {
  try {
    return await db.transaction(async (tx) => {
      await tx.query(`select set_config('request.jwt.claim.sub', $1, true)`, [uid || ''])
      await tx.exec(`set local role ${role}`)
      const r = await tx.query(sql, params)
      return { rows: r.rows }
    })
  } catch (e) {
    return { error: e.message, hint: e.hint }
  }
}
const su = (sql, p) => db.query(sql, p)

await db.exec(STUB)
const files = fs.readdirSync(MIG).filter((f) => f.endsWith('.sql') && !f.includes('cron')).sort()
for (const f of files) {
  try { await db.exec(fs.readFileSync(path.join(MIG, f), 'utf8')); console.log('migración OK:', f) }
  catch (e) { console.log('migración FALLÓ:', f, '\n', e.message); process.exit(1) }
}

const newUser = async (email, meta) =>
  (await su(`insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id`, [email, meta])).rows[0].id

console.log('\n1. Registro (trigger handle_new_user)')
const CLI = await newUser('cliente@tatuon.cl', { nombre: 'Valentina Rojas', tipo_rol: 'cliente', comuna: 'Providencia' })
const CLI2 = await newUser('tomas@mail.cl', { nombre: 'Tomás Aravena', tipo_rol: 'cliente' })
const EST = await newUser('estudio@tatuon.cl', { nombre: 'Black Lotus', tipo_rol: 'estudio', extra: { direccion: 'Av. Providencia 1234', coords: { lat: -33.42, lng: -70.61 } } })
const ART = await newUser('artista@tatuon.cl', { nombre: 'Camilo Fuentes', tipo_rol: 'artista', comuna: 'Providencia',
  extra: { estilos: ['Realismo', 'Blackwork', 'Inventado'], tarifa_media: '95000', coords: { lat: -33.4264, lng: -70.6189 }, biografia: 'Realismo' } })
const HACK = await newUser('hacker@mail.cl', { nombre: 'Hacker', tipo_rol: 'admin', extra: { tarifa_media: 'abc' } })
const ADM = await newUser('admin@tatuon.cl', { nombre: 'Equipo TATU ON' })
await su(`update public.usuarios set tipo_rol = 'admin' where id = $1`, [ADM])
await su(`update public.artistas set estudio_id = $1 where id_artista = $2`, [EST, ART])
const BOX = (await su(`insert into public.boxes (id_estudio, nombre_identificador, tarifa_hora) values ($1, 'Box A', 12000) returning id_box`, [EST])).rows[0].id_box

ok((await su(`select tipo_rol from public.usuarios where id=$1`, [HACK])).rows[0].tipo_rol === 'cliente', 'tipo_rol "admin" en signup se degrada a cliente')
const a = (await su(`select * from public.artistas where id_artista=$1`, [ART])).rows[0]
ok(a.tarifa_media === 95000 && a.lat === -33.4264 && a.estado_verificacion === 'Sin Documento', 'artista creado con tarifa, coords y "Sin Documento"')
ok((await su(`select count(*)::int n from public.artista_estilo where id_artista=$1`, [ART])).rows[0].n === 2, 'solo se guardan estilos válidos del catálogo')
ok((await su(`select count(*)::int n from public.estudios where id_estudio=$1`, [EST])).rows[0].n === 1, 'estudio creado')

console.log('\n2. Privilegios y RLS básicos')
let r = await as('anon', null, `select * from public.usuarios`)
ok(r.error?.includes('permission denied'), 'anon no puede leer usuarios')
r = await as('authenticated', CLI2, `select id from public.usuarios`)
ok(r.rows?.length === 1 && r.rows[0].id === CLI2, 'un usuario solo ve su propia fila en usuarios')
r = await as('authenticated', ADM, `select id from public.usuarios`)
ok(r.rows?.length === 6, 'admin ve todos los usuarios')
r = await as('authenticated', CLI, `select email from public.perfiles_publicos`)
ok(r.error?.includes('permission denied') || r.error?.includes('does not exist'), 'perfiles_publicos no expone email')
r = await as('authenticated', CLI, `update public.usuarios set tipo_rol='admin' where id=$1`, [CLI])
ok(Boolean(r.error), 'nadie puede cambiarse el rol')
r = await as('authenticated', ART, `update public.artistas set estado_verificacion='Verificado' where id_artista=$1`, [ART])
ok(Boolean(r.error), 'artista no puede auto-verificarse')
r = await as('authenticated', ART, `update public.artistas set rating=5 where id_artista=$1`, [ART])
ok(Boolean(r.error), 'artista no puede editar su rating')
r = await as('authenticated', CLI, `insert into public.notificaciones (id_usuario,tipo,titulo,mensaje) values ($1,'x','x','x')`, [ART])
ok(Boolean(r.error), 'cliente no puede crear notificaciones a terceros')
r = await as('authenticated', CLI, `select public.crear_notificacion($1,'x','x','x')`, [ART])
ok(r.error?.includes('permission denied'), 'crear_notificacion no es invocable desde la API')

console.log('\n3. RS-01: visibilidad según verificación')
r = await as('authenticated', CLI, `select * from public.v_artistas`)
ok(r.rows?.length === 0, 'artista sin verificar NO aparece al cliente')
r = await as('authenticated', ART, `select * from public.v_artistas`)
ok(r.rows?.length === 1, 'el artista sí se ve a sí mismo')
r = await as('authenticated', CLI, `select * from public.crear_reserva($1, now() + interval '2 days', now() + interval '2 days 2 hours')`, [ART])
ok(r.hint === 'NOT_ALLOWED', 'no se puede reservar con artista no verificado')

console.log('\n4. Documento sanitario → Pendiente + aviso a admin')
r = await as('authenticated', ART, `update public.artistas set resolucion_sanitaria_url=$2 where id_artista=$1 returning estado_verificacion`, [ART, `${ART}/seremi.pdf`])
ok(r.rows?.[0]?.estado_verificacion === 'Pendiente de Validación', 'al subir documento queda Pendiente de Validación')
r = await as('authenticated', ADM, `select * from public.notificaciones`)
ok(r.rows?.length === 1 && r.rows[0].titulo === 'Documento pendiente', 'admin recibe notificación')
r = await as('authenticated', CLI, `select public.aprobar_documento('artista', $1)`, [ART])
ok(r.hint === 'NOT_ALLOWED', 'cliente no puede aprobar documentos')
r = await as('authenticated', ADM, `select public.aprobar_documento('artista', $1)`, [ART])
ok(!r.error, 'admin aprueba documento' + (r.error ? ' — ' + r.error : ''))
r = await as('authenticated', CLI, `select nombre, estilos, coords_ok from (select *, lat is not null as coords_ok from public.v_artistas) x`)
ok(r.rows?.length === 1 && r.rows[0].nombre === 'Camilo Fuentes' && r.rows[0].estilos.join() === 'Realismo,Blackwork', 'artista verificado visible con nombre y estilos ordenados')
r = await as('anon', null, `select nombre from public.v_artistas`)
ok(r.rows?.length === 1, 'anon también ve artistas verificados (catálogo público)')

console.log('\n5. CU-04: reserva y anti-colisión')
const t0 = `now() + interval '3 days'`
r = await as('authenticated', CLI, `select * from public.crear_reserva($1, ${t0}, ${t0} + interval '2 hours', $2, null, 'Realismo', 'Manga')`, [ART, BOX])
const RES = r.rows?.[0]?.id_reserva
ok(RES && r.rows[0].estado_cita === 'Pendiente_Pago' && r.rows[0].valor_total_estimado === 95000, 'reserva creada en Pendiente_Pago con tarifa por defecto' + (r.error ? ' — ' + r.error : ''))
r = await as('authenticated', CLI2, `select * from public.crear_reserva($1, ${t0} + interval '1 hour', ${t0} + interval '3 hours')`, [ART])
ok(r.hint === 'SLOT_TAKEN', 'bloque solapado del mismo artista → SLOT_TAKEN')
r = await as('authenticated', ART, `select * from public.crear_reserva($1, ${t0} + interval '5 hours', ${t0} + interval '6 hours')`, [ART])
ok(r.hint === 'NOT_ALLOWED', 'un artista no puede reservar como cliente')
r = await as('authenticated', CLI2, `select * from public.crear_reserva($1, now() - interval '1 day', now())`, [ART])
ok(r.hint === 'INVALID', 'no se puede reservar en el pasado')
r = await as('authenticated', CLI2, `select * from public.horarios_ocupados($1)`, [ART])
ok(r.rows?.length === 1 && Object.keys(r.rows[0]).length === 2, 'horarios_ocupados expone solo inicio/fin')
r = await as('authenticated', CLI2, `select * from public.reservas`)
ok(r.rows?.length === 0, 'otro cliente no ve reservas ajenas')
r = await as('authenticated', EST, `select * from public.reservas`)
ok(r.rows?.length === 1, 'el estudio ve las reservas de sus boxes')
r = await as('authenticated', CLI, `insert into public.reservas (id_cliente,id_artista,fecha_hora_inicio,fecha_hora_fin,valor_total_estimado) values ($1,$2,now()+interval '9 days',now()+interval '9 days 1 hour',1)`, [CLI, ART])
ok(r.error?.includes('permission denied'), 'no se puede insertar reservas directo (saltando reglas)')
r = await as('authenticated', CLI, `update public.reservas set estado_cita='Confirmada' where id_reserva=$1`, [RES])
ok(r.error?.includes('permission denied'), 'cliente no puede confirmar su reserva sin pagar')

console.log('\n6. RF-05: pago simulado')
r = await as('authenticated', CLI2, `select public.procesar_pago_simulado($1)`, [RES])
ok(r.hint === 'NOT_FOUND', 'otro cliente no puede pagar una reserva ajena')
r = await as('authenticated', CLI, `select public.procesar_pago_simulado($1) as j`, [RES])
ok(r.rows?.[0]?.j?.montoSena === 9500 && r.rows[0].j.aprobado, 'pago aprobado con seña 10%' + (r.error ? ' — ' + r.error : ''))
ok((await su(`select estado_cita from public.reservas where id_reserva=$1`, [RES])).rows[0].estado_cita === 'Confirmada', 'reserva Confirmada')
r = await as('authenticated', CLI, `select public.procesar_pago_simulado($1)`, [RES])
ok(r.hint === 'NOT_ALLOWED', 'no se puede pagar dos veces')
r = await as('authenticated', ART, `select titulo from public.notificaciones`)
ok(r.rows?.some((n) => n.titulo === 'Nueva reserva confirmada'), 'artista notificado')
r = await as('authenticated', CLI, `select * from public.pagos`)
ok(r.rows?.length === 1, 'cliente ve su pago')
r = await as('authenticated', CLI2, `select * from public.pagos`)
ok(r.rows?.length === 0, 'otro cliente no ve el pago')

// Pago rechazado
r = await as('authenticated', CLI2, `select * from public.crear_reserva($1, now() + interval '6 days', now() + interval '6 days 2 hours')`, [ART])
const RES2 = r.rows?.[0]?.id_reserva
r = await as('authenticated', CLI2, `select public.procesar_pago_simulado($1, false) as j`, [RES2])
ok(r.rows?.[0]?.j?.aprobado === false, 'pago rechazado devuelve aprobado=false')
ok((await su(`select estado_cita from public.reservas where id_reserva=$1`, [RES2])).rows[0].estado_cita === 'Cancelada', 'rechazo libera el bloque (Cancelada)')
r = await as('authenticated', CLI, `select * from public.crear_reserva($1, now() + interval '6 days', now() + interval '6 days 2 hours')`, [ART])
ok(Boolean(r.rows?.[0]), 'el bloque liberado se puede volver a reservar')

console.log('\n7. Expiración del bloqueo de 15 min')
const RES3 = r.rows[0].id_reserva
await su(`update public.reservas set expira_en = now() - interval '1 minute' where id_reserva=$1`, [RES3])
r = await as('authenticated', CLI, `select public.procesar_pago_simulado($1)`, [RES3])
ok(r.hint === 'EXPIRED', 'no se puede pagar un bloqueo vencido')
r = await as('authenticated', CLI2, `select * from public.crear_reserva($1, now() + interval '6 days', now() + interval '6 days 1 hour')`, [ART])
ok(Boolean(r.rows?.[0]), 'crear_reserva libera bloqueos vencidos que chocan' + (r.error ? ' — ' + r.error : ''))
ok((await su(`select public.expirar_reservas_pendientes() n`)).rows[0].n >= 0, 'expirar_reservas_pendientes ejecuta')

console.log('\n8. CU-06: reseña verificada')
r = await as('authenticated', CLI, `select * from public.crear_resena($1, 5, 'Excelente trabajo, muy limpio')`, [RES])
ok(r.hint === 'NOT_ALLOWED', 'no se puede reseñar una cita no ejecutada')
r = await as('authenticated', CLI, `select * from public.actualizar_estado_reserva($1, 'Ejecutada')`, [RES])
ok(r.hint === 'NOT_ALLOWED', 'el cliente no puede marcar Ejecutada')
r = await as('authenticated', ART, `select * from public.actualizar_estado_reserva($1, 'Ejecutada')`, [RES])
ok(r.rows?.[0]?.estado_cita === 'Ejecutada', 'el artista marca Ejecutada' + (r.error ? ' — ' + r.error : ''))
r = await as('authenticated', CLI, `select * from public.crear_resena($1, 5, 'corto')`, [RES])
ok(r.hint === 'INVALID', 'comentario muy corto rechazado')
r = await as('authenticated', CLI2, `select * from public.crear_resena($1, 5, 'Intento de reseña falsa')`, [RES])
ok(r.hint === 'NOT_ALLOWED', 'otro cliente no puede reseñar la cita')
r = await as('authenticated', CLI, `select * from public.crear_resena($1, 4, 'Excelente trabajo, muy limpio')`, [RES])
ok(Boolean(r.rows?.[0]), 'cliente reseña su cita ejecutada y pagada' + (r.error ? ' — ' + r.error : ''))
const ra = (await su(`select rating, total_resenas from public.artistas where id_artista=$1`, [ART])).rows[0]
ok(Number(ra.rating) === 4 && ra.total_resenas === 1, 'rating del artista recalculado por trigger')
r = await as('authenticated', CLI, `select * from public.crear_resena($1, 5, 'Segunda reseña duplicada')`, [RES])
ok(r.hint === 'NOT_ALLOWED', 'no se puede reseñar dos veces')

console.log('\n9. Boxes, portafolio, admin')
r = await as('authenticated', CLI, `insert into public.boxes (id_estudio, nombre_identificador) values ($1, 'X')`, [EST])
ok(Boolean(r.error), 'cliente no puede crear boxes de un estudio')
r = await as('authenticated', EST, `insert into public.boxes (id_estudio, nombre_identificador, tarifa_hora) values ($1, 'Box B', 9000) returning id_box`, [EST])
ok(Boolean(r.rows?.[0]), 'estudio crea su box')
r = await as('authenticated', ART, `insert into public.portafolio (id_artista, estilo, url) values ($1, 'Realismo', 'https://x/y.webp') returning id`, [ART])
ok(Boolean(r.rows?.[0]), 'artista agrega imagen a su portafolio')
r = await as('authenticated', ART, `insert into public.portafolio (id_artista, estilo, url) values ($1, 'Inventado', 'https://x/y.webp')`, [ART])
ok(Boolean(r.error), 'RF-03: estilo fuera del catálogo rechazado')
r = await as('authenticated', CLI, `insert into public.portafolio (id_artista, estilo, url) values ($1, 'Realismo', 'https://x/z.webp')`, [ART])
ok(Boolean(r.error), 'nadie más escribe en el portafolio del artista')
r = await as('authenticated', ADM, `select public.metricas_admin() m`)
ok(r.rows?.[0]?.m?.totalUsuarios === 6 && r.rows[0].m.montoSenas === 9500, 'metricas_admin devuelve datos' + (r.error ? ' — ' + r.error : ''))
r = await as('authenticated', CLI, `select public.metricas_admin()`)
ok(r.hint === 'NOT_ALLOWED', 'cliente no accede a métricas')
r = await as('authenticated', ADM, `select public.rechazar_documento('estudio', $1, 'PDF ilegible')`, [EST])
ok(!r.error && (await su(`select estado_certificacion from public.estudios where id_estudio=$1`, [EST])).rows[0].estado_certificacion === 'Rechazado', 'admin rechaza estudio')

console.log('\n10. Storage')
r = await as('authenticated', ART, `insert into storage.objects (bucket_id, name) values ('documentos', $1)`, [`${ART}/seremi.pdf`])
ok(!r.error, 'artista sube PDF a su carpeta')
r = await as('authenticated', ART, `insert into storage.objects (bucket_id, name) values ('documentos', $1)`, [`${CLI}/x.pdf`])
ok(Boolean(r.error), 'no puede subir a carpeta ajena')
r = await as('authenticated', CLI, `select * from storage.objects where bucket_id='documentos'`)
ok(r.rows?.length === 0, 'cliente no ve documentos sanitarios ajenos')
r = await as('authenticated', ADM, `select * from storage.objects where bucket_id='documentos'`)
ok(r.rows?.length === 1, 'admin ve los documentos')

console.log('\n11. Validación de registro / perfil')
const V1 = await newUser('v1@mail.cl', { nombre: '  Ana Pérez  ', telefono: '+56 9 5544 3322', tipo_rol: 'artista',
  extra: { instagram: 'no válido!', biografia: 'x'.repeat(1500), tarifa_media: '99999999' } })
let u = (await su(`select nombre, telefono from public.usuarios where id=$1`, [V1])).rows[0]
ok(u.nombre === 'Ana Pérez' && u.telefono === '+56955443322', 'alta: nombre recortado y teléfono normalizado')
const av = (await su(`select instagram, char_length(biografia) bio, tarifa_media from public.artistas where id_artista=$1`, [V1])).rows[0]
ok(av.instagram === '' && av.bio === 1000 && av.tarifa_media === 10000000, 'alta: instagram inválido, bio y tarifa se sanean sin romper el signUp')
const V2 = await newUser('v2@mail.cl', { nombre: 'Luis Soto', telefono: '22123456' })
ok((await su(`select telefono from public.usuarios where id=$1`, [V2])).rows[0].telefono === '', 'alta: teléfono inválido queda vacío (signUp no falla)')

r = await as('authenticated', CLI, `update public.usuarios set telefono='9 8765 4321' where id=$1 returning telefono`, [CLI])
ok(r.rows?.[0]?.telefono === '+56987654321', 'edición: teléfono válido se normaliza')
r = await as('authenticated', CLI, `update public.usuarios set telefono='12345' where id=$1`, [CLI])
ok(r.hint === 'INVALID', 'edición: teléfono inválido → INVALID')
r = await as('authenticated', CLI, `update public.usuarios set nombre='Al' where id=$1`, [CLI])
ok(r.hint === 'INVALID', 'edición: nombre de 2 caracteres → INVALID')
r = await as('authenticated', CLI, `update public.usuarios set telefono='+56911112222' where id=$1 returning id`, [ART])
ok(r.rows?.length === 0, 'un usuario no puede editar el teléfono de otro')
r = await as('authenticated', ART, `update public.artistas set instagram='con espacio' where id_artista=$1`, [ART])
ok(r.hint === 'INVALID', 'edición: instagram inválido → INVALID')
r = await as('authenticated', ART, `update public.artistas set instagram='@camilo.ink' where id_artista=$1 returning instagram`, [ART])
ok(r.rows?.[0]?.instagram === '@camilo.ink', 'edición: instagram válido se guarda')
r = await as('authenticated', ART, `update public.artistas set tarifa_media=20000000 where id_artista=$1`, [ART])
ok(r.hint === 'INVALID', 'edición: tarifa sobre el tope → INVALID')
r = await as('authenticated', EST, `update public.estudios set direccion=$2 where id_estudio=$1`, [EST, 'x'.repeat(201)])
ok(r.hint === 'INVALID', 'edición: dirección de estudio demasiado larga → INVALID')
r = await as('authenticated', CLI, `select public.normalizar_telefono('912345678')`)
ok(r.error?.includes('permission denied'), 'normalizar_telefono no es invocable desde la API')
r = await as('anon', null, `select public.validar_usuario()`)
ok(Boolean(r.error), 'anon no puede invocar funciones de validación')

console.log(`\nResultado: ${pass} OK, ${fail} fallidos`)
process.exit(fail ? 1 : 0)
