import { useState, useEffect, useMemo } from 'react'
import { SlidersHorizontal, Search as SearchIcon, MapPin, X } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Button, Skeleton, EmptyState, Modal } from '@/components/ui'
import { ArtistCard, SearchFilters, ActiveFilterChips } from '@/components/domain'
import { useDebounce } from '@/hooks/useDebounce'
import { useGeolocation } from '@/hooks/useGeolocation'
import { api } from '@/services'

export default function Buscador() {
  const [filtros, setFiltros] = useState({ sort: 'relevancia' })
  const [artistas, setArtistas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const { coords, request } = useGeolocation()
  const debouncedQ = useDebounce(filtros.q, 350)

  // Pide ubicación al entrar (para ordenar por cercanía)
  useEffect(() => { request() }, [request])

  const query = useMemo(
    () => ({ ...filtros, q: debouncedQ, origin: coords }),
    [filtros, debouncedQ, coords],
  )

  useEffect(() => {
    let active = true
    setLoading(true)
    api.listArtistas(query).then((res) => {
      if (active) {
        setArtistas(res)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [query])

  const clear = () => setFiltros({ sort: 'relevancia' })

  return (
    <div>
      <PageHeader
        title="Buscar artistas"
        subtitle="Filtra por estilo, comuna, tarifa y disponibilidad flash."
        action={
          <Button variant="outline" className="lg:hidden" onClick={() => setShowFilters(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Filtros
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Filtros (desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <SearchFilters filtros={filtros} setFiltros={setFiltros} onClear={clear} />
          </div>
        </div>

        {/* Resultados */}
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">
              {loading ? 'Buscando…' : `${artistas.length} artista${artistas.length === 1 ? '' : 's'} encontrado${artistas.length === 1 ? '' : 's'}`}
            </p>
            <ActiveFilterChips filtros={filtros} setFiltros={setFiltros} />
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-72" />)}
            </div>
          ) : artistas.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {artistas.map((a) => <ArtistCard key={a.id_artista} artista={a} />)}
            </div>
          ) : (
            <EmptyState
              icon={SearchIcon}
              title="Sin resultados"
              description="No encontramos artistas para tus filtros. Prueba ampliar el rango o flexibilizar las tarifas."
              action={<Button onClick={clear} variant="outline">Limpiar filtros</Button>}
            />
          )}
        </div>
      </div>

      {/* Filtros (móvil) */}
      <Modal open={showFilters} onClose={() => setShowFilters(false)} title="Filtros">
        <SearchFilters filtros={filtros} setFiltros={setFiltros} onClear={clear} compact />
        <Button className="mt-5 w-full" onClick={() => setShowFilters(false)}>
          Ver {artistas.length} resultados
        </Button>
      </Modal>
    </div>
  )
}
