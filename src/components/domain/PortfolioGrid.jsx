import { useState } from 'react'
import { Trash2, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge, EmptyState } from '@/components/ui'
import { ImageIcon } from 'lucide-react'

export const PortfolioGrid = ({ items = [], editable, onRemove, filterEstilo }) => {
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const filtered = filterEstilo ? items.filter((i) => i.estilo === filterEstilo) : items

  const openLightbox = (idx) => setLightboxIdx(idx)
  const closeLightbox = () => setLightboxIdx(null)
  const prev = () => setLightboxIdx((i) => (i - 1 + filtered.length) % filtered.length)
  const next = () => setLightboxIdx((i) => (i + 1) % filtered.length)

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
      {/* Masonry con CSS columns — respeta las proporciones reales de cada imagen */}
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
        {filtered.map((item, idx) => (
          <div
            key={item.id}
            className="group relative mb-3 break-inside-avoid overflow-hidden rounded-xl bg-sand-200 cursor-pointer"
            onClick={() => openLightbox(idx)}
          >
            <img
              src={item.url}
              alt={item.titulo}
              className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Overlay al hacer hover */}
            <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-ink/70 via-ink/10 to-transparent p-2.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); openLightbox(idx) }}
                  className="rounded-lg bg-white/90 p-1.5 text-ink hover:bg-white"
                  aria-label="Ampliar"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
                {editable && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(item.id) }}
                    className="rounded-lg bg-clay-500/90 p-1.5 text-white hover:bg-clay-500"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <Badge tone="forest" size="sm" className="bg-white/90 text-forest-700">{item.estilo}</Badge>
                <span className="text-[10px] text-white/80">{item.titulo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox con navegación */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Cerrar */}
          <button
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 transition-colors"
            onClick={closeLightbox}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev */}
          {filtered.length > 1 && (
            <button
              className="absolute left-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); prev() }}
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Imagen */}
          <div className="flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <img
              src={filtered[lightboxIdx].url}
              alt={filtered[lightboxIdx].titulo}
              className="max-h-[80vh] max-w-[88vw] rounded-2xl object-contain shadow-lift"
            />
            <div className="flex items-center gap-3">
              <Badge tone="forest" size="sm" className="bg-white/15 text-white border-white/20">
                {filtered[lightboxIdx].estilo}
              </Badge>
              <span className="text-sm text-white/70">{filtered[lightboxIdx].titulo}</span>
              <span className="text-xs text-white/40">{lightboxIdx + 1} / {filtered.length}</span>
            </div>
          </div>

          {/* Next */}
          {filtered.length > 1 && (
            <button
              className="absolute right-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); next() }}
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      )}
    </>
  )
}
