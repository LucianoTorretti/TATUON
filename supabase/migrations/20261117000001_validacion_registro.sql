-- =============================================================
-- Validación de datos de registro / perfil (espejo de src/lib/validation.js).
--  · INSERT (solo ocurre vía handle_new_user): se SANEA, nunca se rompe el signUp
--    (un error ahí lo convierte Supabase Auth en "Database error saving new user").
--  · UPDATE (desde la API): se RECHAZA con hint 'INVALID'.
-- Los triggers solo miran las columnas validadas, así que filas antiguas no
-- bloquean otras ediciones (estado, rating, etc.).
-- =============================================================

-- Móvil chileno → '+569XXXXXXXX'; null si no es válido.
create function public.normalizar_telefono(p text)
returns text
language sql immutable set search_path = ''
as $$
  select '+56' || (regexp_match(
    regexp_replace(coalesce(p, ''), '[[:space:]-]', '', 'g'),
    '^(?:\+?56)?(9[0-9]{8})$'))[1]
$$;

-- Lanza INVALID (para UPDATE) o devuelve el valor saneado (para INSERT).
create function public.validar_usuario()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_tel text;
begin
  new.nombre := trim(new.nombre);
  if char_length(new.nombre) not between 3 and 80 then
    if tg_op = 'UPDATE' then
      raise exception 'El nombre debe tener entre 3 y 80 caracteres.' using hint = 'INVALID';
    end if;
    new.nombre := case when char_length(new.nombre) < 3 then 'Usuario' else left(new.nombre, 80) end;
  end if;

  if new.telefono <> '' then
    v_tel := public.normalizar_telefono(new.telefono);
    if v_tel is null and tg_op = 'UPDATE' then
      raise exception 'Teléfono no válido. Usa un móvil chileno: +56 9 1234 5678.' using hint = 'INVALID';
    end if;
    new.telefono := coalesce(v_tel, '');
  end if;
  return new;
end;
$$;

create trigger usuarios_validar
  before insert or update of nombre, telefono on public.usuarios
  for each row execute function public.validar_usuario();

create function public.validar_artista()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  new.instagram := trim(new.instagram);
  if new.instagram <> '' and new.instagram !~ '^@?[A-Za-z0-9._]{1,30}$' then
    if tg_op = 'UPDATE' then
      raise exception 'Usuario de Instagram no válido.' using hint = 'INVALID';
    end if;
    new.instagram := '';
  end if;

  if new.tarifa_media > 10000000 then
    if tg_op = 'UPDATE' then
      raise exception 'La tarifa media no puede superar $10.000.000.' using hint = 'INVALID';
    end if;
    new.tarifa_media := 10000000;
  end if;

  if char_length(new.biografia) > 1000 then
    if tg_op = 'UPDATE' then
      raise exception 'La biografía no puede superar 1000 caracteres.' using hint = 'INVALID';
    end if;
    new.biografia := left(new.biografia, 1000);
  end if;
  return new;
end;
$$;

create trigger artistas_validar
  before insert or update of instagram, tarifa_media, biografia on public.artistas
  for each row execute function public.validar_artista();

create function public.validar_estudio()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  new.direccion := trim(new.direccion);
  if char_length(new.direccion) > 200 or char_length(new.descripcion) > 1000 then
    if tg_op = 'UPDATE' then
      raise exception 'Dirección (máx. 200) o descripción (máx. 1000) demasiado larga.' using hint = 'INVALID';
    end if;
    new.direccion := left(new.direccion, 200);
    new.descripcion := left(new.descripcion, 1000);
  end if;
  return new;
end;
$$;

create trigger estudios_validar
  before insert or update of direccion, descripcion on public.estudios
  for each row execute function public.validar_estudio();

-- Ninguna de estas funciones se expone por la API (los triggers no necesitan EXECUTE).
revoke execute on function public.normalizar_telefono(text) from public, anon, authenticated;
revoke execute on function public.validar_usuario()  from public, anon, authenticated;
revoke execute on function public.validar_artista()  from public, anon, authenticated;
revoke execute on function public.validar_estudio()  from public, anon, authenticated;
