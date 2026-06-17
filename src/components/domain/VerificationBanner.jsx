import { Link } from 'react-router-dom'
import { ShieldAlert, ShieldCheck, ShieldX, Clock } from 'lucide-react'
import { VERIFICACION } from '@/lib/constants'
import { Button } from '@/components/ui'

// Banner de estado de verificación para artista/estudio (RS-01)
export const VerificationBanner = ({ estado, to = '/artista/verificacion' }) => {
  if (estado === VERIFICACION.VERIFICADO) {
    return (
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-forest-200 bg-forest-50 p-4">
        <ShieldCheck className="h-5 w-5 shrink-0 text-forest-600" />
        <p className="text-sm text-forest-800">
          <span className="font-semibold">Perfil verificado.</span> Eres visible en el marketplace y puedes recibir reservas.
        </p>
      </div>
    )
  }

  const cfg = {
    [VERIFICACION.PENDIENTE]: {
      icon: Clock, tone: 'border-amber-200 bg-amber-50 text-amber-800',
      msg: 'Tu documentación está en revisión. Tu perfil permanece oculto hasta que un operador la apruebe.',
      cta: null,
    },
    [VERIFICACION.RECHAZADO]: {
      icon: ShieldX, tone: 'border-red-200 bg-red-50 text-red-700',
      msg: 'Tu documentación fue rechazada. Vuelve a subir una resolución SEREMI vigente.',
      cta: 'Volver a subir',
    },
    [VERIFICACION.SIN_DOCUMENTO]: {
      icon: ShieldAlert, tone: 'border-sand-300 bg-sand-100 text-ink-soft',
      msg: 'Sube tu resolución sanitaria SEREMI para activar tu perfil y aparecer en las búsquedas.',
      cta: 'Subir documento',
    },
  }[estado] || {}

  if (!cfg.icon) return null
  const Icon = cfg.icon

  return (
    <div className={`mb-6 flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${cfg.tone}`}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 shrink-0" />
        <p className="text-sm">{cfg.msg}</p>
      </div>
      {cfg.cta && (
        <Button as={Link} to={to} size="sm" variant="outline" className="shrink-0 border-current">
          {cfg.cta}
        </Button>
      )}
    </div>
  )
}
