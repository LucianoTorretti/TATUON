import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Palette, Zap, CircleDollarSign, Instagram, Save } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Card, Button, Input, Textarea, PageLoader } from '@/components/ui'
import { StyleSelector } from '@/components/domain'
import { useAuth } from '@/hooks/useAuth'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services'
import { cn } from '@/lib/cn'

export default function GestionEstilos() {
  const { user, refresh } = useAuth()
  const { data: artista, loading } = useAsync(() => api.getArtista(user.id), [user.id])
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (artista) {
      setForm({
        estilos: artista.estilos || [],
        tarifa_media: artista.tarifa_media || '',
        biografia: artista.biografia || '',
        instagram: artista.instagram || '',
        flash_disponible: artista.flash_disponible || false,
      })
    }
  }, [artista])

  if (loading || !form) return <PageLoader />

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const guardar = async () => {
    setSaving(true)
    try {
      await api.updateArtista(user.id, {
        estilos: form.estilos,
        tarifa_media: Number(form.tarifa_media) || 0,
        biografia: form.biografia,
        instagram: form.instagram,
        flash_disponible: form.flash_disponible,
      })
      refresh()
      toast.success('Perfil artístico actualizado.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Estilos y perfil artístico" subtitle="Define tu especialidad, tarifa y presencia." />

      <div className="space-y-5">
        <Card className="p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-ink">
            <Palette className="h-5 w-5 text-forest-600" /> Estilos que dominas
          </h3>
          <StyleSelector value={form.estilos} onChange={(v) => set('estilos', v)} />
        </Card>

        <Card className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Tarifa media (CLP)" type="number" icon={CircleDollarSign}
              value={form.tarifa_media} onChange={(e) => set('tarifa_media', e.target.value)} />
            <Input label="Instagram" icon={Instagram}
              value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@usuario" />
          </div>
          <div className="mt-4">
            <Textarea label="Biografía" value={form.biografia} onChange={(e) => set('biografia', e.target.value)} />
          </div>
        </Card>

        <Card className="p-5">
          <button
            onClick={() => set('flash_disponible', !form.flash_disponible)}
            className="flex w-full items-center justify-between"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-clay-400/15 text-clay-500">
                <Zap className="h-5 w-5" />
              </span>
              <span className="text-left">
                <span className="block font-semibold text-ink">Diseños Flash disponibles</span>
                <span className="block text-sm text-ink-muted">Aparecerás en el filtro de flash del buscador.</span>
              </span>
            </span>
            <span className={cn('h-6 w-11 rounded-full p-0.5 transition', form.flash_disponible ? 'bg-forest-500' : 'bg-sand-300')}>
              <span className={cn('block h-5 w-5 rounded-full bg-white transition', form.flash_disponible && 'translate-x-5')} />
            </span>
          </button>
        </Card>

        <Button onClick={guardar} loading={saving} size="lg" className="w-full sm:w-auto">
          <Save className="h-4 w-4" /> Guardar cambios
        </Button>
      </div>
    </div>
  )
}
