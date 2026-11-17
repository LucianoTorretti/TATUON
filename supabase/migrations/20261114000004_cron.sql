-- =============================================================
-- TATU ON — 004 Tareas programadas (pg_cron)
-- Libera cada 5 min los bloques con seña impaga vencida.
-- (crear_reserva también lo hace de forma "perezosa" al reservar.)
-- =============================================================
create extension if not exists pg_cron;

select cron.schedule(
  'expirar-reservas-pendientes',
  '*/5 * * * *',
  $$ select public.expirar_reservas_pendientes(); $$
);
