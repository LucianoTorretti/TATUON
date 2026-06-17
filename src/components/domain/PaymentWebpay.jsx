import { useState } from 'react'
import { Lock, CreditCard, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { formatCLP } from '@/lib/format'
import { cn } from '@/lib/cn'

// Pasarela Webpay simulada (RF-05 / CU-05). NO procesa pagos reales.
export const PaymentWebpay = ({ monto, onResult }) => {
  const [card, setCard] = useState('')
  const [exp, setExp] = useState('')
  const [cvv, setCvv] = useState('')
  const [phase, setPhase] = useState('form') // form | processing | done
  const [forceFail, setForceFail] = useState(false)

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const fmtExp = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  }

  const submit = async (e) => {
    e.preventDefault()
    setPhase('processing')
    await new Promise((r) => setTimeout(r, 1600))
    if (forceFail) {
      setPhase('form')
      onResult(false)
    } else {
      setPhase('done')
      await new Promise((r) => setTimeout(r, 700))
      onResult(true)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
      {/* Header estilo Webpay */}
      <div className="flex items-center justify-between bg-forest-700 px-5 py-3 text-sand-50">
        <span className="flex items-center gap-2 font-semibold">
          <CreditCard className="h-5 w-5" /> Webpay Plus
        </span>
        <span className="flex items-center gap-1 text-xs text-forest-100">
          <Lock className="h-3.5 w-3.5" /> Entorno seguro · TLS 1.3
        </span>
      </div>

      {phase === 'done' ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <CheckCircle2 className="h-14 w-14 text-forest-500" />
          <p className="text-lg font-semibold text-ink">Pago aprobado</p>
          <p className="text-sm text-ink-muted">Confirmando tu reserva…</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="rounded-xl bg-sand-100 p-4 text-center">
            <p className="text-xs text-ink-muted">Monto de la seña (10%)</p>
            <p className="font-display text-3xl font-bold text-forest-700">{formatCLP(monto)}</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-soft">Número de tarjeta</label>
            <input
              className="input-base font-mono tracking-widest"
              placeholder="4051 8842 0000 0000"
              value={card}
              onChange={(e) => setCard(fmtCard(e.target.value))}
              required
              disabled={phase === 'processing'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">Vencimiento</label>
              <input
                className="input-base font-mono"
                placeholder="MM/AA"
                value={exp}
                onChange={(e) => setExp(fmtExp(e.target.value))}
                required
                disabled={phase === 'processing'}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-soft">CVV</label>
              <input
                className="input-base font-mono"
                placeholder="123"
                maxLength={3}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                required
                disabled={phase === 'processing'}
              />
            </div>
          </div>

          {/* Toggle demo para probar el flujo de rechazo (CU-05 5.a) */}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-sand-50 px-3 py-2 text-xs text-ink-muted">
            <input
              type="checkbox"
              checked={forceFail}
              onChange={(e) => setForceFail(e.target.checked)}
              className="accent-clay-500"
            />
            Simular transacción rechazada (demo)
          </label>

          <Button type="submit" size="lg" className="w-full" disabled={phase === 'processing'}>
            {phase === 'processing' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Procesando con el banco…
              </>
            ) : (
              <>Pagar {formatCLP(monto)}</>
            )}
          </Button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-forest-500" />
            Simulación de Transbank. No se realiza ningún cobro real.
          </p>
        </form>
      )}
    </div>
  )
}
