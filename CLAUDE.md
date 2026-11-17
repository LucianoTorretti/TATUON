
# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

# TATU ON — Reglas del proyecto

Marketplace de tatuajes (Chile): React 18 + Vite + Tailwind, desplegado en **Vercel**, backend **Supabase** (Postgres + Auth + Storage). Interfaz y textos en español (Chile).

## Arquitectura
- Las pantallas y stores importan datos **solo** desde `src/services` (`auth`, `storage`, `api`). Nunca usar `supabase-js` directamente en `pages/` o `components/`.
- Hay dos adaptadores con **las mismas firmas**: `src/services/mock/` (localStorage, para desarrollo y demo) y `src/services/supabase/`. Si cambias una firma, cambia ambos. Se elige con `VITE_BACKEND=mock|supabase`.
- Los valores de enums (estados de cita, pago, verificación, roles) deben coincidir entre `src/lib/constants.js` y `supabase/migrations/`.

## Base de datos y seguridad
- Toda regla de negocio (reservar, pagar, cambiar estado de cita, reseñar, aprobar documentos, métricas) vive en **funciones RPC / triggers SQL**, no en el frontend. El cliente nunca escribe estados directamente.
- Todo cambio de esquema es una **migración nueva** en `supabase/migrations/` (`YYYYMMDDHHMMSS_nombre.sql`). No editar migraciones ya aplicadas en un entorno.
- Tablas nuevas: RLS activado, privilegios mínimos (`grant` explícitos por columna) y funciones `security definer` con `set search_path = ''`. Revocar `execute` por defecto y otorgarlo solo a lo necesario.
- Errores de negocio en SQL: `raise exception ... using hint = 'CODIGO'` (`SLOT_TAKEN`, `NOT_ALLOWED`, `INVALID`, `NOT_FOUND`, `EXPIRED`), que la UI usa como `err.code`.
- Storage: rutas `<bucket>/<auth.uid()>/<archivo>`. Documentos sanitarios en bucket privado `documentos` (URLs firmadas); imágenes en `portafolio` / `avatars` (públicos).

## Secretos
- En el frontend solo `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. La `SUPABASE_SERVICE_ROLE_KEY` es solo para scripts locales (seed): nunca con prefijo `VITE_`, nunca en Vercel ni en el repo.

## Pagos
- El pago de seña (10%) es **simulado** (`procesar_pago_simulado`). No cobrar dinero real hasta integrar Transbank vía Edge Function + webhook.

## Verificación
- `npm run build` debe compilar antes de dar algo por terminado.
- Cambios en SQL: probar los casos de permisos (quién puede y quién no) además del camino feliz.
