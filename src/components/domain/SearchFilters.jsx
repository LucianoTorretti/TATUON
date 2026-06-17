import { Search, SlidersHorizontal, Zap, X } from 'lucide-react'
import { Input, Select, Button, Badge } from '@/components/ui'
import { StyleSelector } from './StyleSelector'
import { COMUNAS } from '@/lib/geo'
import { formatCLP } from '@/lib/format'
import { cn } from '@/lib/cn'

// Panel de filtros del buscador (RF-02 / CU-02)
export const SearchFilters = ({ filtros, setFiltros, onClear, compact }) => {
  const set = (patch) => setFiltros((f) => ({ ...f, ...patch }))

  return (
    <div className={cn('space-y-5', !compact && 'card p-5')}>
      <Input
        icon={Search}
        placeholder="Buscar artista, estilo o concepto…"
        value={filtros.q || ''}
        onChange={(e) => set({ q: e.target.value })}
        aria-label="Buscar"
      />

      <div>
        <p className="mb-2 text-sm font-semibold text-ink">Estilo artístico</p>
        <StyleSelector multi={false} value={filtros.estilo || ''} onChange={(v) => set({ estilo: v })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Comuna"
          value={filtros.comuna || ''}
          onChange={(e) => set({ comuna: e.target.value })}
        >
          <option value="">Todas</option>
          {COMUNAS.map((c) => (
            <option key={c.nombre} value={c.nombre}>{c.nombre}</option>
          ))}
        </Select>
        <Select
          label="Ordenar por"
          value={filtros.sort || 'relevancia'}
          onChange={(e) => set({ sort: e.target.value })}
        >
          <option value="relevancia">Relevancia</option>
          <option value="distancia">Cercanía</option>
          <option value="rating">Mejor evaluados</option>
          <option value="precio_asc">Precio: menor</option>
          <option value="precio_desc">Precio: mayor</option>
        </Select>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium text-ink-soft">Tarifa máxima</span>
          <span className="text-sm font-semibold text-forest-700">
            {filtros.maxTarifa ? formatCLP(filtros.maxTarifa) : 'Sin límite'}
          </span>
        </div>
        <input
          type="range"
          min="40000"
          max="150000"
          step="5000"
          value={filtros.maxTarifa || 150000}
          onChange={(e) => set({ maxTarifa: Number(e.target.value) === 150000 ? undefined : Number(e.target.value) })}
          className="w-full accent-forest-500"
        />
      </div>

      <button
        type="button"
        onClick={() => set({ flash: !filtros.flash })}
        className={cn(
          'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition',
          filtros.flash
            ? 'border-clay-400 bg-clay-400/10 text-clay-500'
            : 'border-sand-300 bg-white text-ink-soft hover:border-clay-300',
        )}
      >
        <span className="flex items-center gap-2">
          <Zap className="h-4 w-4" /> Solo con diseños Flash disponibles
        </span>
        <span className={cn('h-5 w-9 rounded-full p-0.5 transition', filtros.flash ? 'bg-clay-500' : 'bg-sand-300')}>
          <span className={cn('block h-4 w-4 rounded-full bg-white transition', filtros.flash && 'translate-x-4')} />
        </span>
      </button>

      <Button variant="ghost" size="sm" className="w-full" onClick={onClear}>
        <X className="h-4 w-4" /> Limpiar filtros
      </Button>
    </div>
  )
}

// Resumen compacto de filtros activos (chips)
export const ActiveFilterChips = ({ filtros, setFiltros }) => {
  const chips = []
  if (filtros.estilo) chips.push({ k: 'estilo', label: filtros.estilo })
  if (filtros.comuna) chips.push({ k: 'comuna', label: filtros.comuna })
  if (filtros.flash) chips.push({ k: 'flash', label: 'Flash' })
  if (filtros.maxTarifa) chips.push({ k: 'maxTarifa', label: `≤ ${formatCLP(filtros.maxTarifa)}` })
  if (!chips.length) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SlidersHorizontal className="h-4 w-4 text-ink-muted" />
      {chips.map((c) => (
        <button key={c.k} onClick={() => setFiltros((f) => ({ ...f, [c.k]: c.k === 'flash' ? false : undefined }))}>
          <Badge tone="forest" className="cursor-pointer hover:bg-forest-100">
            {c.label} <X className="h-3 w-3" />
          </Badge>
        </button>
      ))}
    </div>
  )
}
