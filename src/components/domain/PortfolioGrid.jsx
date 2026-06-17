import { useState } from 'react'
import { Trash2, Maximize2, X } from 'lucide-react'
import { Badge, EmptyState } from '@/components/ui'
import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

export const PortfolioGrid = ({ items = [], editable, onRemove, filterEstilo }) => {
  const [lightbox, setLightbox] = useState(null)
  const filtered = filterEstilo ? items.filter((i) => i.estilo === filterEstilo) : items

  if (!filtered.length) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="Sin trabajos en el portafolio"
        description="Aún no hay piezas para mostrar en esta categoría."
      />
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square overflow-hidden rounded-xl bg-sand-200"
          >
            <img
              src={item.url}
              alt={item.titulo}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-ink/70 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => setLightbox(item)}
                  className="rounded-lg bg-white/90 p-1.5 text-ink hover:bg-white"
                  aria-label="Ampliar"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
                {editable && (
                  <button
                    onClick={() => onRemove(item.id)}
                    className="rounded-lg bg-clay-500/90 p-1.5 text-white hover:bg-clay-500"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <Badge tone="forest" size="sm" className="self-start bg-white/90">{item.estilo}</Badge>
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
          <img src={lightbox.url} alt={lightbox.titulo} className="max-h-[85vh] max-w-full rounded-2xl object-contain" />
        </div>
      )}
    </>
  )
}
