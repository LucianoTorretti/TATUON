import { useState } from 'react'
import toast from 'react-hot-toast'
import { ShieldCheck, FileText, Upload as UploadIcon, Info } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Card, Button, VerificationBadge, FileUpload, PageLoader } from '@/components/ui'
import { VerificationBanner } from '@/components/domain'
import { useAuth } from '@/hooks/useAuth'
import { useAsync } from '@/hooks/useAsync'
import { api, storage } from '@/services'
import { ROLES, VERIFICACION } from '@/lib/constants'

// Verificación sanitaria (RF-01 / RS-01) para Artista y Estudio
export default function VerificacionSanitaria() {
  const { user, refresh } = useAuth()
  const esEstudio = user.tipo_rol === ROLES.ESTUDIO

  const { data: detalle, loading, reload } = useAsync(
    () => (esEstudio ? api.getEstudio(user.id) : api.getArtista(user.id)),
    [user.id],
  )
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  if (loading) return <PageLoader />

  const estado = esEstudio ? detalle?.estado_certificacion : detalle?.estado_verificacion
  const docActual = esEstudio ? detalle?.seremi_resolucion_url : detalle?.resolucion_sanitaria_url

  const subir = async () => {
    if (!file) return toast.error('Selecciona el PDF de tu resolución.')
    setSaving(true)
    try {
      const up = await storage.upload('documentos', file)
      const patch = esEstudio
        ? { seremi_resolucion_url: up.ref, estado_certificacion: VERIFICACION.PENDIENTE }
        : { resolucion_sanitaria_url: up.ref, estado_verificacion: VERIFICACION.PENDIENTE }
      if (esEstudio) await api.updateEstudio(user.id, patch)
      else await api.updateArtista(user.id, patch)
      refresh()
      reload()
      setFile(null)
      toast.success('Documento enviado. Quedó en revisión por el equipo de TATU ON.')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Verificación sanitaria"
        subtitle="Acredita tu cumplimiento ante la SEREMI de Salud para operar en TATU ON."
      />

      <VerificationBanner estado={estado} to={esEstudio ? '/estudio/verificacion' : '/artista/verificacion'} />

      <Card className="p-6">
        <div className="flex items-center justify-between border-b border-sand-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-ink">Estado actual</p>
              <p className="text-sm text-ink-muted">Resolución sanitaria SEREMI</p>
            </div>
          </div>
          <VerificationBadge estado={estado} />
        </div>

        {docActual && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-sand-100 p-3">
            <FileText className="h-5 w-5 text-clay-500" />
            <span className="text-sm font-medium text-ink">{docActual}</span>
            <span className="ml-auto text-xs text-ink-muted">Documento actual</span>
          </div>
        )}

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-ink-soft">
            {docActual ? 'Reemplazar documento' : 'Subir resolución sanitaria'}
          </p>
          <FileUpload accept="application/pdf" type="pdf" label="Selecciona tu PDF SEREMI" hint="Máximo 4 MB" onFile={setFile} />
          <Button onClick={subir} loading={saving} className="mt-4 w-full sm:w-auto">
            <UploadIcon className="h-4 w-4" /> Enviar a revisión
          </Button>
        </div>

        <div className="mt-5 flex gap-2 rounded-xl bg-sand-100 p-4 text-xs text-ink-muted">
          <Info className="h-4 w-4 shrink-0 text-forest-600" />
          <p>
            Un operador de TATU ON validará la vigencia del documento (Decreto Supremo N°238). Mientras
            tanto tu perfil permanece oculto del marketplace. Recibirás una notificación con el resultado.
          </p>
        </div>
      </Card>
    </div>
  )
}
