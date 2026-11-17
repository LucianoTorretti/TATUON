-- =============================================================
-- TATU ON — 002 Seguridad: privilegios, RLS y Storage
-- Regla general: el cliente (anon/authenticated) solo LEE lo que
-- le corresponde y escribe columnas "inofensivas". Toda transición
-- de negocio (reservar, pagar, aprobar, reseñar) pasa por funciones
-- RPC en 003, que validan permisos y estados en el servidor.
-- =============================================================

-- ---------- Helper de rol ----------
create function public.es_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.usuarios
    where id = (select auth.uid()) and tipo_rol = 'admin' and estado_cuenta = 'Activa'
  );
$$;

-- ---------- Privilegios (deny by default) ----------
revoke all on all tables in schema public from anon, authenticated;

grant select on public.perfiles_publicos, public.v_artistas, public.estilos,
                public.artistas, public.estudios, public.artista_estilo,
                public.boxes, public.portafolio, public.resenas
  to anon, authenticated;

grant select on public.usuarios, public.reservas, public.pagos, public.notificaciones
  to authenticated;

-- Columnas editables por el propio dueño (estado, rating, rol: NO)
grant update (nombre, telefono, comuna, avatar) on public.usuarios to authenticated;
grant update (biografia, tarifa_media, comuna, lat, lng, instagram,
              flash_disponible, portafolio_cover, resolucion_sanitaria_url)
  on public.artistas to authenticated;
grant update (nombre_fantasia, direccion, comuna, lat, lng, descripcion, cover,
              seremi_resolucion_url)
  on public.estudios to authenticated;
grant insert, delete on public.artista_estilo to authenticated;
grant insert (id_estudio, nombre_identificador, tarifa_hora, equipamiento, estado_disponibilidad),
      update (nombre_identificador, tarifa_hora, equipamiento, estado_disponibilidad),
      delete
  on public.boxes to authenticated;
grant insert (id_artista, estilo, url, storage_path, titulo), delete
  on public.portafolio to authenticated;
grant update (leida) on public.notificaciones to authenticated;

-- ---------- RLS ----------
alter table public.usuarios        enable row level security;
alter table public.estilos         enable row level security;
alter table public.estudios        enable row level security;
alter table public.artistas        enable row level security;
alter table public.artista_estilo  enable row level security;
alter table public.boxes           enable row level security;
alter table public.portafolio      enable row level security;
alter table public.reservas        enable row level security;
alter table public.pagos           enable row level security;
alter table public.resenas         enable row level security;
alter table public.notificaciones  enable row level security;

-- usuarios: cada uno ve/edita su fila; admin ve todo (moderación)
create policy usuarios_select on public.usuarios for select to authenticated
  using (id = (select auth.uid()) or (select public.es_admin()));
create policy usuarios_update on public.usuarios for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy estilos_select on public.estilos for select using (true);

-- estudios: ficha pública (el PDF vive en bucket privado)
create policy estudios_select on public.estudios for select using (true);
create policy estudios_update on public.estudios for update to authenticated
  using (id_estudio = (select auth.uid())) with check (id_estudio = (select auth.uid()));

-- artistas — RS-01: solo verificados son visibles, salvo para sí mismo y admin
create policy artistas_select on public.artistas for select
  using (
    estado_verificacion = 'Verificado'
    or id_artista = (select auth.uid())
    or (select public.es_admin())
  );
create policy artistas_update on public.artistas for update to authenticated
  using (id_artista = (select auth.uid())) with check (id_artista = (select auth.uid()));

create policy artista_estilo_select on public.artista_estilo for select using (true);
create policy artista_estilo_insert on public.artista_estilo for insert to authenticated
  with check (id_artista = (select auth.uid()));
create policy artista_estilo_delete on public.artista_estilo for delete to authenticated
  using (id_artista = (select auth.uid()));

create policy boxes_select on public.boxes for select using (true);
create policy boxes_insert on public.boxes for insert to authenticated
  with check (id_estudio = (select auth.uid()));
create policy boxes_update on public.boxes for update to authenticated
  using (id_estudio = (select auth.uid())) with check (id_estudio = (select auth.uid()));
create policy boxes_delete on public.boxes for delete to authenticated
  using (id_estudio = (select auth.uid()));

create policy portafolio_select on public.portafolio for select using (true);
create policy portafolio_insert on public.portafolio for insert to authenticated
  with check (id_artista = (select auth.uid()));
create policy portafolio_delete on public.portafolio for delete to authenticated
  using (id_artista = (select auth.uid()));

-- reservas: participantes (cliente, artista, estudio dueño del box) y admin.
-- Sin INSERT/UPDATE directos: ver crear_reserva / actualizar_estado_reserva.
create policy reservas_select on public.reservas for select to authenticated
  using (
    id_cliente = (select auth.uid())
    or id_artista = (select auth.uid())
    or (select public.es_admin())
    or exists (
      select 1 from public.boxes b
      where b.id_box = reservas.id_box and b.id_estudio = (select auth.uid())
    )
  );

-- pagos: visibles para quien puede ver la reserva
create policy pagos_select on public.pagos for select to authenticated
  using (exists (select 1 from public.reservas r where r.id_reserva = pagos.id_reserva));

create policy resenas_select on public.resenas for select using (true);

create policy notificaciones_select on public.notificaciones for select to authenticated
  using (id_usuario = (select auth.uid()));
create policy notificaciones_update on public.notificaciones for update to authenticated
  using (id_usuario = (select auth.uid())) with check (id_usuario = (select auth.uid()));

-- ---------- Storage ----------
-- Convención de rutas: <bucket>/<auth.uid()>/<archivo>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('documentos', 'documentos', false, 5242880, array['application/pdf']),
  ('portafolio', 'portafolio', true, 8388608, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars',    'avatars',    true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Documentos sanitarios (privado): sube el dueño; leen dueño y admin (URL firmada)
create policy documentos_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'documentos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy documentos_select on storage.objects for select to authenticated
  using (
    bucket_id = 'documentos'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or (select public.es_admin()))
  );

-- Imágenes públicas: lectura pública por URL; escritura solo en la carpeta propia
create policy imagenes_insert on storage.objects for insert to authenticated
  with check (bucket_id in ('portafolio', 'avatars') and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy imagenes_update on storage.objects for update to authenticated
  using (bucket_id in ('portafolio', 'avatars') and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy imagenes_delete on storage.objects for delete to authenticated
  using (bucket_id in ('portafolio', 'avatars') and (storage.foldername(name))[1] = (select auth.uid())::text);
