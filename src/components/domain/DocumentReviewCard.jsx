import { useState } from 'react'
import { FileText, Check, X, Eye, MapPin } from 'lucide-react'
import { Avatar, Badge, Button, Modal, Textarea } from '@/components/ui'
import { ROLE_LABELS } from '@/lib/constants'

// Tarjeta de auditoría de documento sanitario (RF-07 / CU-07)
export const DocumentReviewCard = ({ doc, onApprove, onReject, busy }) => {
  const [showDoc, setShowDoc] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [motivo, setMotivo] = useState('')

  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <Avatar src={doc.avatar} name={doc.nombre} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-semibold text-ink">{doc.nombre}</h4>
            <Badge tone="sand" size="sm">{ROLE_LABELS[doc.tipo]}</Badge>
          </div>
          <p className="flex items-center gap-1 text-xs text-ink-muted">
            <MapPin className="h-3 w-3" /> {doc.comuna}
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowDoc(true)}
        className="mt-3 flex w-full items-center gap-3 rounded-xl border border-sand-200 bg-sand-50 p-3 text-left transition hover:border-forest-300"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-clay-400/15 text-clay-500">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{doc.doc || 'resolucion_seremi.pdf'}</p>
          <p className="text-xs text-ink-muted">Resolución sanitaria SEREMI</p>
        </div>
        <Eye className="h-4 w-4 text-ink-muted" />
      </button>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="danger" size="sm" onClick={() => setShowReject(true)} disabled={busy}>
          <X className="h-4 w-4" /> Rechazar
        </Button>
        <Button size="sm" onClick={() => onApprove(doc)} loading={busy}>
          <Check className="h-4 w-4" /> Aprobar
        </Button>
      </div>

      {/* Visor de PDF simulado */}
      <Modal open={showDoc} onClose={() => setShowDoc(false)} title="Resolución sanitaria SEREMI" size="lg">
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl bg-sand-100 p-8 text-center">
          <FileText className="mb-4 h-16 w-16 text-forest-400" />
          <p className="font-semibold text-ink">{doc.doc}</p>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">
            Documento PDF de {doc.nombre}. En este prototipo se simula el visor; el operador valida
            visualmente vigencia y correspondencia de datos antes de aprobar (CU-07).
          </p>
          <Badge tone="amber" className="mt-4">Vista previa simulada</Badge>
        </div>
      </Modal>

      {/* Rechazo con motivo (CU-07 6.a) */}
      <Modal
        open={showReject}
        onClose={() => setShowReject(false)}
        title="Rechazar documentación"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowReject(false)}>Cancelar</Button>
            <Button
              variant="danger"
              disabled={!motivo.trim()}
              onClick={() => {
                onReject(doc, motivo.trim())
                setShowReject(false)
              }}
            >
              Confirmar rechazo
            </Button>
          </div>
        }
      >
        <Textarea
          label="Justificación técnica (obligatoria)"
          placeholder="Ej: Resolución SEREMI vencida / datos no corresponden."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
        <p className="mt-2 text-xs text-ink-muted">
          Se enviará un correo formal al postulante exigiendo la subsanación.
        </p>
      </Modal>
    </div>
  )
}
