import { useState } from 'react'
import { Search, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Card, Avatar, Badge, Input, Tabs, PageLoader, VerificationBadge } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services'
import { ROLE_LABELS, ROLES } from '@/lib/constants'
import { formatDateShort } from '@/lib/format'

const roleTone = {
  [ROLES.CLIENTE]: 'blue',
  [ROLES.ARTISTA]: 'forest',
  [ROLES.ESTUDIO]: 'amber',
  [ROLES.ADMIN]: 'clay',
}

export default function ModeracionUsuarios() {
  const { data: usuarios, loading } = useAsync(() => api.listUsuariosAdmin(), [])
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('all')

  if (loading) return <PageLoader />

  const filtrados = (usuarios || [])
    .filter((u) => (tab === 'all' ? true : u.tipo_rol === tab))
    .filter((u) => u.nombre.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))

  const count = (rol) => (usuarios || []).filter((u) => u.tipo_rol === rol).length

  return (
    <div>
      <PageHeader title="Moderación de usuarios" subtitle="Audita y gestiona las cuentas del marketplace." />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'all', label: 'Todos', count: usuarios?.length },
            { value: ROLES.CLIENTE, label: 'Clientes', count: count(ROLES.CLIENTE) },
            { value: ROLES.ARTISTA, label: 'Artistas', count: count(ROLES.ARTISTA) },
            { value: ROLES.ESTUDIO, label: 'Estudios', count: count(ROLES.ESTUDIO) },
          ]}
        />
        <Input
          icon={Search}
          placeholder="Buscar por nombre o correo…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:w-72"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="hidden grid-cols-[1fr_140px_120px_120px] gap-4 border-b border-sand-200 bg-sand-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-muted sm:grid">
          <span>Usuario</span>
          <span>Rol</span>
          <span>Comuna</span>
          <span>Registro</span>
        </div>
        <div className="divide-y divide-sand-100">
          {filtrados.map((u) => (
            <div key={u.id} className="grid grid-cols-1 gap-2 px-5 py-3 sm:grid-cols-[1fr_140px_120px_120px] sm:items-center sm:gap-4">
              <div className="flex items-center gap-3">
                <Avatar src={u.avatar} name={u.nombre} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{u.nombre}</p>
                  <p className="truncate text-xs text-ink-muted">{u.email}</p>
                </div>
              </div>
              <Badge tone={roleTone[u.tipo_rol]} size="sm" className="w-fit">{ROLE_LABELS[u.tipo_rol]}</Badge>
              <span className="text-sm text-ink-soft">{u.comuna}</span>
              <span className="text-sm text-ink-muted">{formatDateShort(u.fecha_registro)}</span>
            </div>
          ))}
          {!filtrados.length && (
            <div className="px-5 py-12 text-center text-sm text-ink-muted">Sin usuarios para este filtro.</div>
          )}
        </div>
      </Card>
    </div>
  )
}
