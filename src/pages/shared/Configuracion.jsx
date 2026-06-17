import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  User, Mail, Phone, MapPin, Save, LogOut, ShieldCheck, Lock, Trash2, RefreshCw,
} from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Card, Avatar, Button, Input, Select, Badge } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { resetSeed, BACKEND } from '@/services'
import { COMUNAS } from '@/lib/geo'
import { ROLE_LABELS } from '@/lib/constants'

export default function Configuracion() {
  const { user, updateProfile, logout } = useAuth()
  const [form, setForm] = useState({
    nombre: user.nombre, telefono: user.telefono || '', comuna: user.comuna || 'Providencia',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const guardar = async () => {
    setSaving(true)
    try {
      await updateProfile(form)
      toast.success('Perfil actualizado.')
    } catch {
      toast.error('No se pudo guardar.')
    } finally {
      setSaving(false)
    }
  }

  const reiniciarDemo = () => {
    resetSeed()
    toast.success('Datos del demo reiniciados.')
    setTimeout(() => window.location.reload(), 600)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Configuración de cuenta" subtitle="Gestiona tu perfil, seguridad y preferencias." />

      <div className="space-y-5">
        {/* Perfil */}
        <Card className="p-6">
          <div className="flex items-center gap-4 border-b border-sand-200 pb-5">
            <Avatar src={user.avatar} name={user.nombre} size="xl" />
            <div>
              <p className="font-display text-xl font-bold text-ink">{user.nombre}</p>
              <p className="text-sm text-ink-muted">{user.email}</p>
              <Badge tone="forest" size="sm" className="mt-1.5">{ROLE_LABELS[user.tipo_rol]}</Badge>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input label="Nombre" icon={User} value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
            <Input label="Correo" icon={Mail} value={user.email} disabled hint="El correo no se puede modificar." />
            <Input label="Teléfono" icon={Phone} value={form.telefono} onChange={(e) => set('telefono', e.target.value)} />
            <Select label="Comuna" value={form.comuna} onChange={(e) => set('comuna', e.target.value)}>
              {COMUNAS.map((c) => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
            </Select>
          </div>

          <Button onClick={guardar} loading={saving} className="mt-5">
            <Save className="h-4 w-4" /> Guardar cambios
          </Button>
        </Card>

        {/* Seguridad */}
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-ink">
            <Lock className="h-5 w-5 text-forest-600" /> Seguridad
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-sand-100 p-3">
              <span className="flex items-center gap-2 text-ink-soft"><ShieldCheck className="h-4 w-4 text-forest-600" /> Cifrado de datos</span>
              <Badge tone="forest" size="sm">AES-256</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-sand-100 p-3">
              <span className="flex items-center gap-2 text-ink-soft"><Lock className="h-4 w-4 text-forest-600" /> Conexión</span>
              <Badge tone="forest" size="sm">TLS 1.3</Badge>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast('Función de cambio de contraseña simulada.')}>
              Cambiar contraseña
            </Button>
          </div>
        </Card>

        {/* Zona demo */}
        <Card className="p-6">
          <h3 className="mb-1 font-semibold text-ink">Datos del prototipo</h3>
          <p className="mb-4 text-sm text-ink-muted">
            Backend actual: <Badge tone="sand" size="sm">{BACKEND === 'mock' ? 'Simulado (localStorage)' : 'Firebase'}</Badge>.
            Puedes reiniciar el demo a su estado inicial.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={reiniciarDemo}>
              <RefreshCw className="h-4 w-4" /> Reiniciar datos demo
            </Button>
            <Button variant="danger" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
