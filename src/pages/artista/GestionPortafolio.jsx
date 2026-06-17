import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Images } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Button, Modal, Input, PageLoader, FileUpload as Upload } from '@/components/ui'
import { PortfolioGrid, StyleSelector } from '@/components/domain'
import { useAuth } from '@/hooks/useAuth'
import { useAsync } from '@/hooks/useAsync'
import { api, storage } from '@/services'

export default function GestionPortafolio() {
  const { user } = useAuth()
  const { data: artista, loading, reload } = useAsync(() => api.getArtista(user.id), [user.id])
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [estilo, setEstilo] = useState('')
  const [titulo, setTitulo] = useState('')
  const [saving, setSaving] = useState(false)
  const [filtro, setFiltro] = useState('')

  if (loading) return <PageLoader />

  const estilosArtista = artista?.estilos || []

  const subir = async () => {
    if (!file) return toast.error('Selecciona una imagen.')
    if (!estilo) return toast.error('Indexa la imagen con un estilo (obligatorio).')
    setSaving(true)
    try {
      const up = await storage.upload('portafolio', file)
      await api.addPortafolioItem(user.id, { url: up.url, estilo, titulo })
      toast.success('Trabajo añadido al portafolio.')
      setOpen(false)
      setFile(null)
      setEstilo('')
      setTitulo('')
      reload()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const eliminar = async (id) => {
    await api.removePortafolioItem(id)
    toast.success('Trabajo eliminado.')
    reload()
  }

  return (
    <div>
      <PageHeader
        title="Mi portafolio"
        subtitle="Sube tus trabajos en alta resolución, indexados por estilo."
        action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Subir trabajo</Button>}
      />

      {/* Filtro por estilo */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setFiltro('')}
          className={`rounded-full border px-3 py-1 text-sm ${!filtro ? 'border-forest-500 bg-forest-500 text-sand-50' : 'border-sand-300 text-ink-soft'}`}
        >
          Todos ({artista?.portafolio?.length || 0})
        </button>
        {estilosArtista.map((e) => {
          const n = artista.portafolio.filter((p) => p.estilo === e).length
          return (
            <button
              key={e}
              onClick={() => setFiltro(e)}
              className={`rounded-full border px-3 py-1 text-sm ${filtro === e ? 'border-forest-500 bg-forest-500 text-sand-50' : 'border-sand-300 text-ink-soft'}`}
            >
              {e} ({n})
            </button>
          )
        })}
      </div>

      <PortfolioGrid items={artista?.portafolio || []} editable filterEstilo={filtro} onRemove={eliminar} />

      {/* Modal subir */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Subir trabajo al portafolio"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={subir} loading={saving}>Publicar</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Upload accept="image/*" type="image" label="Selecciona una imagen (alta resolución)" hint="JPG o PNG · máx 4 MB" onFile={setFile} />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-soft">
              Estilo artístico <span className="text-clay-500">*</span>
            </label>
            <StyleSelector multi={false} value={estilo} onChange={setEstilo} options={estilosArtista.length ? estilosArtista : undefined} />
            <p className="mt-1.5 text-xs text-ink-muted">La indexación por estilo es obligatoria (RF-03).</p>
          </div>
          <Input label="Título (opcional)" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Retrato realista antebrazo" />
        </div>
      </Modal>
    </div>
  )
}
