import { Box, Power, Pencil, Trash2 } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { formatCLP } from '@/lib/format'
import { cn } from '@/lib/cn'

export const BoxCard = ({ box, editable, onToggle, onEdit, onRemove }) => (
  <div className="rounded-2xl border border-sand-200 bg-white p-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', box.estado_disponibilidad ? 'bg-forest-50 text-forest-600' : 'bg-sand-200 text-ink-muted')}>
          <Box className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-ink">{box.nombre_identificador}</h4>
          <p className="text-sm font-medium text-forest-700">{formatCLP(box.tarifa_hora)}/hora</p>
        </div>
      </div>
      <Badge tone={box.estado_disponibilidad ? 'forest' : 'sand'} size="sm">
        {box.estado_disponibilidad ? 'Disponible' : 'No disponible'}
      </Badge>
    </div>

    {box.equipamiento && <p className="mt-3 text-sm text-ink-muted">{box.equipamiento}</p>}

    {editable && (
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onToggle(box)}>
          <Power className="h-4 w-4" /> {box.estado_disponibilidad ? 'Pausar' : 'Activar'}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(box)} aria-label="Editar">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onRemove(box)} aria-label="Eliminar">
          <Trash2 className="h-4 w-4 text-clay-500" />
        </Button>
      </div>
    )}
  </div>
)
