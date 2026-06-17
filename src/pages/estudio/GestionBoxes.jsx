import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Box as BoxIcon } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Button, Modal, Input, Textarea, PageLoader, EmptyState } from '@/components/ui'
import { BoxCard } from '@/components/domain'
import { useAuth } from '@/hooks/useAuth'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services'

const emptyForm = { nombre_identificador: '', tarifa_hora: '', equipamiento: '' }

export default function GestionBoxes() {
  const { user } = useAuth()
  const { data: boxes, loading, reload } = useAsync(() => api.listBoxes(user.id), [user.id])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  if (loading) return <PageLoader />

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const openNew = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }
  const openEdit = (box) => {
    setEditing(box)
    setForm({ nombre_identificador: box.nombre_identificador, tarifa_hora: box.tarifa_hora, equipamiento: box.equipamiento || '' })
    setOpen(true)
  }

  const guardar = async () => {
    if (!form.nombre_identificador.trim()) return toast.error('Ingresa un nombre para el box.')
    if (!form.tarifa_hora) return toast.error('Ingresa la tarifa por hora.')
    setSaving(true)
    try {
      if (editing) {
        await api.updateBox(editing.id_box, { nombre_identificador: form.nombre_identificador, tarifa_hora: Number(form.tarifa_hora), equipamiento: form.equipamiento })
        toast.success('Box actualizado.')
      } else {
        await api.createBox(user.id, form)
        toast.success('Box creado y publicado.')
      }
      setOpen(false)
      reload()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (box) => {
    await api.updateBox(box.id_box, { estado_disponibilidad: !box.estado_disponibilidad })
    reload()
  }
  const eliminar = async (box) => {
    await api.removeBox(box.id_box)
    toast.success('Box eliminado.')
    reload()
  }

  return (
    <div>
      <PageHeader
        title="Gestión de boxes"
        subtitle="Publica y administra tus espacios de trabajo certificados."
        action={<Button onClick={openNew}><Plus className="h-4 w-4" /> Nuevo box</Button>}
      />

      {boxes?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boxes.map((b) => (
            <BoxCard key={b.id_box} box={b} editable onToggle={toggle} onEdit={openEdit} onRemove={eliminar} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BoxIcon}
          title="Sin boxes registrados"
          description="Crea tu primer box para que los artistas itinerantes puedan reservarlo."
          action={<Button onClick={openNew}><Plus className="h-4 w-4" /> Crear box</Button>}
        />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar box' : 'Nuevo box de trabajo'}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={guardar} loading={saving}>{editing ? 'Guardar' : 'Crear box'}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input label="Nombre identificador" value={form.nombre_identificador}
            onChange={(e) => set('nombre_identificador', e.target.value)} placeholder="Ej: Box A — Privado" />
          <Input label="Tarifa por hora (CLP)" type="number" value={form.tarifa_hora}
            onChange={(e) => set('tarifa_hora', e.target.value)} placeholder="12000" />
          <Textarea label="Equipamiento" value={form.equipamiento}
            onChange={(e) => set('equipamiento', e.target.value)} placeholder="Camilla hidráulica, autoclave, aire acondicionado…" />
        </div>
      </Modal>
    </div>
  )
}
