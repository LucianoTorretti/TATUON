import { useState } from 'react'
import toast from 'react-hot-toast'
import { FileCheck2, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { PageLoader, EmptyState } from '@/components/ui'
import { DocumentReviewCard } from '@/components/domain'
import { useAsync } from '@/hooks/useAsync'
import { api } from '@/services'

export default function ValidacionDocumentos() {
  const { data: docs, loading, reload } = useAsync(() => api.getDocumentosPendientes(), [])
  const [busy, setBusy] = useState(null)

  if (loading) return <PageLoader />

  const aprobar = async (doc) => {
    setBusy(doc.id)
    await api.aprobarDocumento(doc.tipo, doc.id)
    toast.success(`${doc.nombre} verificado/a. Ahora es visible en el marketplace.`)
    await reload()
    setBusy(null)
  }

  const rechazar = async (doc, motivo) => {
    setBusy(doc.id)
    await api.rechazarDocumento(doc.tipo, doc.id, motivo)
    toast('Documento rechazado. Se notificó al postulante.', { icon: '⚠️' })
    await reload()
    setBusy(null)
  }

  return (
    <div>
      <PageHeader
        title="Validación de documentos"
        subtitle="Audita las resoluciones sanitarias SEREMI antes de habilitar perfiles."
      />

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-forest-200 bg-forest-50 p-4">
        <ShieldCheck className="h-5 w-5 text-forest-600" />
        <p className="text-sm text-forest-800">
          Ningún artista o estudio puede prestar servicios sin acreditar su cumplimiento sanitario.
          Aprobar libera la visibilidad pública; rechazar la mantiene bloqueada (CU-07).
        </p>
      </div>

      {docs?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <DocumentReviewCard
              key={`${doc.tipo}-${doc.id}`}
              doc={doc}
              onApprove={aprobar}
              onReject={rechazar}
              busy={busy === doc.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileCheck2}
          title="Todo al día"
          description="No hay documentos pendientes de revisión en este momento."
        />
      )}
    </div>
  )
}
