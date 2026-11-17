-- =============================================================
-- TATU ON — 003 Lógica de negocio en el servidor
-- Triggers + funciones RPC (security definer, search_path vacío).
-- Errores de negocio: errcode P0001 y HINT con el código que la UI
-- espera (SLOT_TAKEN, NOT_ALLOWED, ...).
-- =============================================================

-- Comisión y seña (src/lib/constants.js: PORCENTAJE_SENA)
create function public.porcentaje_sena() returns numeric
language sql immutable set search_path = '' as $$ select 0.10::numeric $$;

-- Minutos de bloqueo del bloque horario mientras se paga (BPMN Proceso 2)
create function public.minutos_bloqueo_reserva() returns integer
language sql immutable set search_path = '' as $$ select 15 $$;

-- ---------- Notificaciones (uso interno) ----------
create function public.crear_notificacion(
  p_id_usuario uuid, p_tipo text, p_titulo text, p_mensaje text, p_data jsonb default '{}'::jsonb
) returns void
language sql security definer set search_path = ''
as $$
  insert into public.notificaciones (id_usuario, tipo, titulo, mensaje, data)
  values (p_id_usuario, p_tipo, p_titulo, p_mensaje, coalesce(p_data, '{}'::jsonb));
$$;

-- ---------- Alta de usuario (trigger en auth.users) ----------
-- La UI llama a supabase.auth.signUp con options.data =
--   { nombre, telefono, tipo_rol, comuna, extra: { ... } }
-- El rol "admin" NUNCA se asigna desde aquí (se promueve por SQL).
create function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  meta     jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  extra    jsonb := coalesce(meta -> 'extra', '{}'::jsonb);
  v_rol    public.rol_usuario;
  v_nombre text := coalesce(nullif(trim(meta ->> 'nombre'), ''), split_part(coalesce(new.email, ''), '@', 1));
  v_comuna text := coalesce(nullif(trim(meta ->> 'comuna'), ''), 'Santiago Centro');
  v_lat    double precision;
  v_lng    double precision;
begin
  -- Nunca romper el alta (un error aquí aborta el signUp completo)
  if char_length(v_nombre) < 2 then
    v_nombre := coalesce(nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Usuario');
    if char_length(v_nombre) < 2 then v_nombre := 'Usuario'; end if;
  end if;

  v_rol := case meta ->> 'tipo_rol'
             when 'artista' then 'artista'::public.rol_usuario
             when 'estudio' then 'estudio'::public.rol_usuario
             else 'cliente'::public.rol_usuario
           end;

  begin
    v_lat := nullif(extra -> 'coords' ->> 'lat', '')::double precision;
    v_lng := nullif(extra -> 'coords' ->> 'lng', '')::double precision;
  exception when others then
    v_lat := null; v_lng := null;
  end;

  insert into public.usuarios (id, nombre, email, telefono, tipo_rol, comuna, avatar)
  values (
    new.id, left(v_nombre, 150), coalesce(new.email, ''), coalesce(meta ->> 'telefono', ''),
    v_rol, v_comuna, nullif(meta ->> 'avatar', '')
  );

  if v_rol = 'artista' then
    insert into public.artistas (id_artista, biografia, tarifa_media, comuna, lat, lng, instagram)
    values (
      new.id,
      coalesce(extra ->> 'biografia', ''),
      greatest(coalesce(
        case when (extra ->> 'tarifa_media') ~ '^\d+(\.\d+)?$'
             then round((extra ->> 'tarifa_media')::numeric)::integer end, 0), 0),
      v_comuna, v_lat, v_lng,
      coalesce(extra ->> 'instagram', '')
    );
    insert into public.artista_estilo (id_artista, estilo)
    select new.id, e.nombre
    from public.estilos e
    where e.nombre in (
      select jsonb_array_elements_text(
        case when jsonb_typeof(extra -> 'estilos') = 'array' then extra -> 'estilos' else '[]'::jsonb end)
    );
  elsif v_rol = 'estudio' then
    insert into public.estudios (id_estudio, nombre_fantasia, direccion, comuna, lat, lng, descripcion)
    values (
      new.id,
      coalesce(nullif(trim(extra ->> 'nombre_fantasia'), ''), v_nombre),
      coalesce(extra ->> 'direccion', ''),
      v_comuna, v_lat, v_lng,
      coalesce(extra ->> 'descripcion', '')
    );
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Documento sanitario subido → Pendiente + aviso a admins ----------
create function public.on_documento_sanitario()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_id     uuid;
  v_clave  text;
  v_nombre text;
  v_path   text;
begin
  -- Ramas separadas: NEW de artistas y estudios tienen columnas distintas
  if tg_table_name = 'artistas' then
    if new.resolucion_sanitaria_url is not distinct from old.resolucion_sanitaria_url
       or new.resolucion_sanitaria_url is null then
      return new;
    end if;
    new.estado_verificacion := 'Pendiente de Validación';
    v_id := new.id_artista;
    v_path := new.resolucion_sanitaria_url;
    v_clave := 'artista';
  else
    if new.seremi_resolucion_url is not distinct from old.seremi_resolucion_url
       or new.seremi_resolucion_url is null then
      return new;
    end if;
    new.estado_certificacion := 'Pendiente de Validación';
    v_id := new.id_estudio;
    v_path := new.seremi_resolucion_url;
    v_clave := 'estudio';
  end if;
  -- El documento debe estar en la carpeta propia del bucket "documentos"
  -- (evita apuntar al PDF de otro usuario). Seed/service_role: auth.uid() es null.
  if auth.uid() is not null and not public.es_admin()
     and v_path not like v_id::text || '/%' then
    raise exception 'Ruta de documento no válida.' using hint = 'INVALID';
  end if;
  new.motivo_rechazo := null;

  select nombre into v_nombre from public.usuarios where id = v_id;

  perform public.crear_notificacion(
    u.id, 'moderacion', 'Documento pendiente',
    coalesce(v_nombre, 'Un usuario') || ' subió su resolución sanitaria para revisión.',
    jsonb_build_object(v_clave, v_id)
  )
  from public.usuarios u where u.tipo_rol = 'admin';

  return new;
end;
$$;

create trigger artistas_documento before update on public.artistas
  for each row execute function public.on_documento_sanitario();
create trigger estudios_documento before update on public.estudios
  for each row execute function public.on_documento_sanitario();

-- ---------- Rating desnormalizado (RF-06) ----------
create function public.recalcular_rating_artista()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_id uuid := coalesce(new.id_artista, old.id_artista);
begin
  update public.artistas a set
    rating = coalesce((select round(avg(r.puntaje_estrellas)::numeric, 1)
                       from public.resenas r where r.id_artista = v_id), 0),
    total_resenas = (select count(*) from public.resenas r where r.id_artista = v_id)
  where a.id_artista = v_id;
  return null;
end;
$$;

create trigger resenas_rating after insert or update or delete on public.resenas
  for each row execute function public.recalcular_rating_artista();

-- =============================================================
-- RPC
-- =============================================================

-- ---------- Liberar bloqueos de pago vencidos ----------
create function public.expirar_reservas_pendientes()
returns integer
language plpgsql security definer set search_path = ''
as $$
declare v_n integer;
begin
  update public.reservas set estado_cita = 'Cancelada', expira_en = null
  where estado_cita = 'Pendiente_Pago' and expira_en < now();
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

-- ---------- Bloques ocupados de un artista (sin datos personales) ----------
-- Lo usa la pantalla de reserva del cliente, que no puede ver reservas ajenas.
create function public.horarios_ocupados(p_id_artista uuid)
returns table (fecha_hora_inicio timestamptz, fecha_hora_fin timestamptz)
language sql stable security definer set search_path = ''
as $$
  select r.fecha_hora_inicio, r.fecha_hora_fin
  from public.reservas r
  where r.id_artista = p_id_artista
    and r.estado_cita <> 'Cancelada'
    and not (r.estado_cita = 'Pendiente_Pago' and r.expira_en < now())
    and r.fecha_hora_fin > now() - interval '1 day'
  order by r.fecha_hora_inicio;
$$;

-- ---------- CU-04: crear reserva con bloqueo temporal ----------
create function public.crear_reserva(
  p_id_artista uuid,
  p_fecha_hora_inicio timestamptz,
  p_fecha_hora_fin timestamptz,
  p_id_box uuid default null,
  p_valor_total_estimado integer default null,
  p_estilo text default null,
  p_descripcion text default ''
) returns public.reservas
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_artista public.artistas;
  v_valor   integer;
  v_res     public.reservas;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = '28000';
  end if;
  if not exists (select 1 from public.usuarios
                 where id = v_uid and tipo_rol = 'cliente' and estado_cuenta = 'Activa') then
    raise exception 'Solo las cuentas de cliente pueden reservar.' using hint = 'NOT_ALLOWED';
  end if;

  select * into v_artista from public.artistas where id_artista = p_id_artista;
  if not found or v_artista.estado_verificacion <> 'Verificado' then
    raise exception 'Este artista no está disponible para reservas.' using hint = 'NOT_ALLOWED';
  end if;

  if p_fecha_hora_inicio <= now() then
    raise exception 'No puedes reservar un bloque en el pasado.' using hint = 'INVALID';
  end if;
  if p_fecha_hora_fin <= p_fecha_hora_inicio
     or p_fecha_hora_fin - p_fecha_hora_inicio > interval '12 hours' then
    raise exception 'La duración de la cita no es válida.' using hint = 'INVALID';
  end if;

  if p_id_box is not null and not exists (
    select 1 from public.boxes b
    where b.id_box = p_id_box and b.estado_disponibilidad
      and b.id_estudio is not distinct from v_artista.estudio_id
  ) then
    raise exception 'El box seleccionado no está disponible.' using hint = 'INVALID';
  end if;

  if nullif(p_estilo, '') is not null and not exists (select 1 from public.estilos where nombre = p_estilo) then
    raise exception 'Estilo no válido.' using hint = 'INVALID';
  end if;

  -- El cliente propone el valor (cotización), pero la seña sale de él:
  -- se acota a un rango razonable respecto de la tarifa del artista.
  v_valor := coalesce(nullif(p_valor_total_estimado, 0), v_artista.tarifa_media);
  if v_valor is null or v_valor <= 0 then
    raise exception 'El valor estimado no es válido.' using hint = 'INVALID';
  end if;
  if v_artista.tarifa_media > 0
     and (v_valor < round(v_artista.tarifa_media * 0.5) or v_valor > v_artista.tarifa_media * 20) then
    raise exception 'El valor estimado debe estar entre % y % CLP para este artista.',
      round(v_artista.tarifa_media * 0.5), v_artista.tarifa_media * 20
      using hint = 'INVALID';
  end if;

  -- Libera bloqueos vencidos que pudieran chocar con este bloque
  update public.reservas set estado_cita = 'Cancelada', expira_en = null
  where estado_cita = 'Pendiente_Pago' and expira_en < now()
    and (id_artista = p_id_artista or (p_id_box is not null and id_box = p_id_box));

  begin
    insert into public.reservas (
      id_cliente, id_artista, id_box, fecha_hora_inicio, fecha_hora_fin,
      estado_cita, valor_total_estimado, estilo, descripcion, expira_en
    ) values (
      v_uid, p_id_artista, p_id_box, p_fecha_hora_inicio, p_fecha_hora_fin,
      'Pendiente_Pago', v_valor, nullif(p_estilo, ''), left(coalesce(p_descripcion, ''), 2000),
      now() + make_interval(mins => public.minutos_bloqueo_reserva())
    ) returning * into v_res;
  exception when exclusion_violation then
    raise exception 'Ese bloque acaba de ser tomado. Elige otro horario.' using hint = 'SLOT_TAKEN';
  end;

  return v_res;
end;
$$;

-- ---------- RF-05: pago de seña SIMULADO ----------
-- ⚠ Reemplazar por la integración Transbank (Edge Function + webhook)
-- antes de cobrar dinero real: aquí el resultado lo decide el cliente.
create function public.procesar_pago_simulado(p_id_reserva uuid, p_exito boolean default true)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid     uuid := auth.uid();
  v_res     public.reservas;
  v_monto   integer;
  v_pago    public.pagos;
  v_artista text;
begin
  select * into v_res from public.reservas where id_reserva = p_id_reserva for update;
  if not found or v_res.id_cliente is distinct from v_uid then
    raise exception 'Reserva no encontrada.' using hint = 'NOT_FOUND';
  end if;
  if v_res.estado_cita <> 'Pendiente_Pago' then
    raise exception 'Esta reserva ya no está pendiente de pago.' using hint = 'NOT_ALLOWED';
  end if;
  if v_res.expira_en < now() then
    raise exception 'El tiempo para pagar la seña expiró. Vuelve a reservar.' using hint = 'EXPIRED';
  end if;

  v_monto := round(v_res.valor_total_estimado * public.porcentaje_sena());

  insert into public.pagos (id_reserva, token_transbank, monto_sena, comision_plataforma, estado_pago)
  values (
    p_id_reserva,
    'TBK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
    v_monto,
    case when p_exito then v_monto else 0 end,  -- en el MVP la seña = comisión recaudada
    case when p_exito then 'Aprobado'::public.estado_pago else 'Rechazado'::public.estado_pago end
  ) returning * into v_pago;

  if not p_exito then
    -- Ruta fallida (BPMN Proceso 2): libera el bloque
    update public.reservas set estado_cita = 'Cancelada', expira_en = null where id_reserva = p_id_reserva;
    return jsonb_build_object('pago', to_jsonb(v_pago), 'montoSena', v_monto, 'aprobado', false);
  end if;

  update public.reservas set estado_cita = 'Confirmada', expira_en = null where id_reserva = p_id_reserva;

  select nombre into v_artista from public.usuarios where id = v_res.id_artista;
  perform public.crear_notificacion(v_res.id_cliente, 'reserva', 'Cita confirmada',
    'Tu seña fue procesada. Cita con ' || coalesce(v_artista, 'el artista') || ' confirmada.',
    jsonb_build_object('reserva', p_id_reserva));
  perform public.crear_notificacion(v_res.id_artista, 'reserva', 'Nueva reserva confirmada',
    'Un cliente confirmó y pagó la seña de una nueva cita.',
    jsonb_build_object('reserva', p_id_reserva));

  return jsonb_build_object('pago', to_jsonb(v_pago), 'montoSena', v_monto, 'aprobado', true);
end;
$$;

-- ---------- Cambio de estado de la cita ----------
-- Artista: Confirmada → Ejecutada; cualquiera de las partes: cancelar.
create function public.actualizar_estado_reserva(p_id_reserva uuid, p_estado public.estado_cita)
returns public.reservas
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_res   public.reservas;
  v_admin boolean := public.es_admin();
  v_ok    boolean := false;
  v_nom   text;
begin
  select * into v_res from public.reservas where id_reserva = p_id_reserva for update;
  if not found or not (v_admin or coalesce(v_uid in (v_res.id_cliente, v_res.id_artista), false)) then
    raise exception 'Reserva no encontrada.' using hint = 'NOT_FOUND';
  end if;

  if v_admin then
    v_ok := true;
  elsif p_estado = 'Ejecutada' then
    v_ok := v_uid = v_res.id_artista and v_res.estado_cita = 'Confirmada';
  elsif p_estado = 'Cancelada' then
    v_ok := v_res.estado_cita in ('Pendiente_Pago', 'Confirmada');
  end if;

  if not v_ok then
    raise exception 'No puedes cambiar la cita de "%" a "%".', v_res.estado_cita, p_estado
      using hint = 'NOT_ALLOWED';
  end if;

  update public.reservas set estado_cita = p_estado, expira_en = null
  where id_reserva = p_id_reserva returning * into v_res;

  select nombre into v_nom from public.usuarios where id = v_res.id_artista;
  if p_estado = 'Ejecutada' then
    perform public.crear_notificacion(v_res.id_cliente, 'resena', 'Evalúa tu experiencia',
      'Ya puedes calificar tu sesión con ' || coalesce(v_nom, 'tu artista') || '.',
      jsonb_build_object('reserva', p_id_reserva));
  elsif p_estado = 'Cancelada' then
    perform public.crear_notificacion(
      case when v_uid = v_res.id_cliente then v_res.id_artista else v_res.id_cliente end,
      'reserva', 'Cita cancelada', 'Una de tus citas fue cancelada.',
      jsonb_build_object('reserva', p_id_reserva));
  end if;

  return v_res;
end;
$$;

-- ---------- CU-06: reseña verificada ----------
create function public.crear_resena(p_id_reserva uuid, p_puntaje integer, p_comentario text)
returns public.resenas
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_res public.reservas;
  v_rev public.resenas;
begin
  select * into v_res from public.reservas where id_reserva = p_id_reserva;
  if not found
     or v_res.id_cliente is distinct from v_uid
     or v_res.estado_cita <> 'Ejecutada'
     or not exists (select 1 from public.pagos p
                    where p.id_reserva = p_id_reserva and p.estado_pago = 'Aprobado')
     or exists (select 1 from public.resenas r where r.id_reserva = p_id_reserva) then
    raise exception 'No puedes evaluar esta cita.' using hint = 'NOT_ALLOWED';
  end if;
  if p_puntaje not between 1 and 5 then
    raise exception 'El puntaje debe estar entre 1 y 5.' using hint = 'INVALID';
  end if;
  if char_length(trim(coalesce(p_comentario, ''))) < 10 then
    raise exception 'El comentario debe tener al menos 10 caracteres.' using hint = 'INVALID';
  end if;

  insert into public.resenas (id_reserva, id_artista, id_cliente, puntaje_estrellas, comentario)
  values (p_id_reserva, v_res.id_artista, v_uid, p_puntaje, left(trim(p_comentario), 2000))
  returning * into v_rev;
  return v_rev;
end;
$$;

-- ---------- CU-07: moderación de documentos ----------
create function public.aprobar_documento(p_tipo public.rol_usuario, p_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.es_admin() then
    raise exception 'Acción reservada a administradores.' using hint = 'NOT_ALLOWED';
  end if;
  if p_tipo = 'artista' then
    update public.artistas set estado_verificacion = 'Verificado', motivo_rechazo = null where id_artista = p_id;
  elsif p_tipo = 'estudio' then
    update public.estudios set estado_certificacion = 'Verificado', motivo_rechazo = null where id_estudio = p_id;
  else
    raise exception 'Tipo no válido.' using hint = 'INVALID';
  end if;
  if not found then
    raise exception 'Perfil no encontrado.' using hint = 'NOT_FOUND';
  end if;
  perform public.crear_notificacion(p_id, 'moderacion', 'Perfil verificado ✓',
    'Tu documentación sanitaria fue aprobada. Ya eres visible en el marketplace.');
end;
$$;

create function public.rechazar_documento(p_tipo public.rol_usuario, p_id uuid, p_motivo text default null)
returns void
language plpgsql security definer set search_path = ''
as $$
declare v_motivo text := coalesce(nullif(trim(p_motivo), ''), 'No cumple la normativa SEREMI.');
begin
  if not public.es_admin() then
    raise exception 'Acción reservada a administradores.' using hint = 'NOT_ALLOWED';
  end if;
  if p_tipo = 'artista' then
    update public.artistas set estado_verificacion = 'Rechazado', motivo_rechazo = v_motivo where id_artista = p_id;
  elsif p_tipo = 'estudio' then
    update public.estudios set estado_certificacion = 'Rechazado', motivo_rechazo = v_motivo where id_estudio = p_id;
  else
    raise exception 'Tipo no válido.' using hint = 'INVALID';
  end if;
  if not found then
    raise exception 'Perfil no encontrado.' using hint = 'NOT_FOUND';
  end if;
  perform public.crear_notificacion(p_id, 'moderacion', 'Documentación rechazada',
    'Tu documento fue rechazado. Motivo: ' || v_motivo || ' Vuelve a subirlo.');
end;
$$;

-- ---------- RF-07: métricas del panel admin ----------
create function public.metricas_admin()
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare v jsonb;
begin
  if not public.es_admin() then
    raise exception 'Acción reservada a administradores.' using hint = 'NOT_ALLOWED';
  end if;
  select jsonb_build_object(
    'totalUsuarios',        (select count(*) from public.usuarios),
    'totalClientes',        (select count(*) from public.usuarios where tipo_rol = 'cliente'),
    'totalArtistas',        (select count(*) from public.artistas),
    'totalEstudios',        (select count(*) from public.estudios),
    'artistasVerificados',  (select count(*) from public.artistas where estado_verificacion = 'Verificado'),
    'pendientesValidacion', (select count(*) from public.artistas where estado_verificacion = 'Pendiente de Validación')
                          + (select count(*) from public.estudios where estado_certificacion = 'Pendiente de Validación'),
    'totalReservas',        (select count(*) from public.reservas),
    'reservasConfirmadas',  (select count(*) from public.reservas where estado_cita = 'Confirmada'),
    'reservasEjecutadas',   (select count(*) from public.reservas where estado_cita = 'Ejecutada'),
    'totalTransado',        (select count(*) from public.pagos where estado_pago = 'Aprobado'),
    'montoSenas',           (select coalesce(sum(monto_sena), 0) from public.pagos where estado_pago = 'Aprobado'),
    'comisionAcumulada',    (select coalesce(sum(comision_plataforma), 0) from public.pagos where estado_pago = 'Aprobado'),
    'ratingPromedio',       (select coalesce(round(avg(puntaje_estrellas)::numeric, 1), 0) from public.resenas),
    'reservasPorEstado', jsonb_build_array(
      jsonb_build_object('estado', 'Pendiente',  'valor', (select count(*) from public.reservas where estado_cita = 'Pendiente_Pago')),
      jsonb_build_object('estado', 'Confirmada', 'valor', (select count(*) from public.reservas where estado_cita = 'Confirmada')),
      jsonb_build_object('estado', 'Ejecutada',  'valor', (select count(*) from public.reservas where estado_cita = 'Ejecutada')),
      jsonb_build_object('estado', 'Cancelada',  'valor', (select count(*) from public.reservas where estado_cita = 'Cancelada'))
    )
  ) into v;
  return v;
end;
$$;

-- ---------- Permisos de ejecución ----------
-- Postgres concede EXECUTE a PUBLIC por defecto: se revoca y se abre solo lo necesario.
revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function public.es_admin() to anon, authenticated;  -- usada por políticas RLS
grant execute on function public.porcentaje_sena() to anon, authenticated;
grant execute on function public.minutos_bloqueo_reserva() to anon, authenticated;
grant execute on function public.horarios_ocupados(uuid) to authenticated;
grant execute on function public.crear_reserva(uuid, timestamptz, timestamptz, uuid, integer, text, text) to authenticated;
grant execute on function public.procesar_pago_simulado(uuid, boolean) to authenticated;
grant execute on function public.actualizar_estado_reserva(uuid, public.estado_cita) to authenticated;
grant execute on function public.crear_resena(uuid, integer, text) to authenticated;
grant execute on function public.aprobar_documento(public.rol_usuario, uuid) to authenticated;
grant execute on function public.rechazar_documento(public.rol_usuario, uuid, text) to authenticated;
grant execute on function public.metricas_admin() to authenticated;
-- Internas (sin grant): crear_notificacion, handle_new_user, on_documento_sanitario,
-- recalcular_rating_artista, expirar_reservas_pendientes (la ejecuta pg_cron).
