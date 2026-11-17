# Supabase — TATU ON

Esquema, seguridad y lógica de negocio del backend, versionados como migraciones SQL.

| Migración | Contenido |
|---|---|
| `001_esquema` | Enums, tablas, índices, restricción anti-colisión (`EXCLUDE`), vistas `perfiles_publicos` y `v_artistas` |
| `002_seguridad` | Privilegios por columna, RLS por rol, buckets de Storage y sus políticas |
| `003_logica_negocio` | Triggers (alta de usuario, documento → pendiente, rating) y RPCs |
| `004_cron` | `pg_cron`: libera cada 5 min las señas impagas vencidas |

## RPCs que consume el frontend

| Función | Quién | Qué hace |
|---|---|---|
| `crear_reserva(...)` | cliente | Valida y bloquea el bloque 15 min (`SLOT_TAKEN` si choca) |
| `horarios_ocupados(id_artista)` | autenticado | Bloques tomados, sin datos personales |
| `procesar_pago_simulado(id, exito)` | cliente dueño | Seña 10 %, confirma y notifica. **Reemplazar por Transbank antes de cobrar dinero real** |
| `actualizar_estado_reserva(id, estado)` | artista / cliente / admin | Ejecutada (artista) o Cancelada |
| `crear_resena(id, puntaje, comentario)` | cliente | Solo citas Ejecutadas + pagadas, una vez |
| `aprobar_documento` / `rechazar_documento` | admin | Moderación sanitaria + notificación |
| `metricas_admin()` | admin | KPIs del panel |

Los errores de negocio llegan con `hint` = `SLOT_TAKEN`, `NOT_ALLOWED`, `INVALID`, `EXPIRED` o `NOT_FOUND`.

## Aplicar en tu proyecto

```bash
npx supabase login
npx supabase init          # solo la primera vez (crea config.toml, no toca migrations/)
npx supabase link --project-ref <tu-project-ref>
npx supabase db push
```

`pg_cron` viene disponible en Supabase; la migración 004 lo habilita.

## Probar sin Supabase

```bash
npm run test:db
```

Corre las migraciones 001–003 en PGlite (Postgres embebido) y verifica 64 reglas de RLS y negocio.
