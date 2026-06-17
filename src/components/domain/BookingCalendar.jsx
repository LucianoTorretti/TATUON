import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatDayName } from '@/lib/format'

const HORAS = [10, 11, 12, 13, 15, 16, 17, 18, 19]
const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// Calendario de agendamiento sincronizado (RF-04 / CU-04)
// takenSlots: array de ISO strings ya ocupados (anti-colisión)
export const BookingCalendar = ({ takenSlots = [], value, onSelect }) => {
  const [weekOffset, setWeekOffset] = useState(0)

  const days = useMemo(() => {
    const base = new Date()
    base.setHours(0, 0, 0, 0)
    base.setDate(base.getDate() + weekOffset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base)
      d.setDate(base.getDate() + i)
      return d
    })
  }, [weekOffset])

  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(0, 0, 0, 0)
    return d
  })

  const isTaken = (day, hora) => {
    const slot = new Date(day)
    slot.setHours(hora, 0, 0, 0)
    return takenSlots.some((t) => new Date(t).getTime() === slot.getTime())
  }

  const isPast = (day, hora) => {
    const slot = new Date(day)
    slot.setHours(hora, 0, 0, 0)
    return slot.getTime() < Date.now()
  }

  const selectedISO = value ? new Date(value).getTime() : null

  return (
    <div className="space-y-4">
      {/* Semana */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
          disabled={weekOffset === 0}
          className="rounded-lg p-2 text-ink-soft transition hover:bg-sand-200 disabled:opacity-40"
          aria-label="Semana anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-ink">
          {days[0].toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} –{' '}
          {days[6].toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
        </span>
        <button
          onClick={() => setWeekOffset((w) => Math.min(5, w + 1))}
          className="rounded-lg p-2 text-ink-soft transition hover:bg-sand-200 disabled:opacity-40"
          aria-label="Semana siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Días */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const isSel = d.toDateString() === selectedDay.toDateString()
          const past = d < new Date(new Date().setHours(0, 0, 0, 0))
          return (
            <button
              key={d.toISOString()}
              disabled={past}
              onClick={() => setSelectedDay(d)}
              className={cn(
                'flex flex-col items-center rounded-xl py-2 text-center transition',
                isSel ? 'bg-forest-500 text-sand-50' : 'bg-sand-100 text-ink-soft hover:bg-sand-200',
                past && 'cursor-not-allowed opacity-30',
              )}
            >
              <span className="text-[10px] uppercase">{DIAS_CORTOS[d.getDay()]}</span>
              <span className="text-base font-bold">{d.getDate()}</span>
            </button>
          )
        })}
      </div>

      {/* Horas */}
      <div>
        <p className="mb-2 text-sm font-medium text-ink-soft">
          Bloques disponibles · {formatDayName(selectedDay)} {selectedDay.getDate()}
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {HORAS.map((hora) => {
            const taken = isTaken(selectedDay, hora)
            const past = isPast(selectedDay, hora)
            const slot = new Date(selectedDay)
            slot.setHours(hora, 0, 0, 0)
            const isSel = selectedISO === slot.getTime()
            const disabled = taken || past
            return (
              <button
                key={hora}
                disabled={disabled}
                onClick={() => onSelect(slot.toISOString())}
                className={cn(
                  'rounded-xl border py-2.5 text-sm font-medium transition',
                  isSel && 'border-forest-500 bg-forest-500 text-sand-50',
                  !isSel && !disabled && 'border-sand-300 bg-white text-ink hover:border-forest-400 hover:bg-forest-50',
                  disabled && 'cursor-not-allowed border-sand-200 bg-sand-100 text-ink-muted line-through',
                )}
              >
                {String(hora).padStart(2, '0')}:00
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          Los bloques tachados ya están reservados. El motor evita la superposición de citas en tiempo real.
        </p>
      </div>
    </div>
  )
}
