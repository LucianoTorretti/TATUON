import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export const PageHeader = ({ title, subtitle, action, back }) => {
  const navigate = useNavigate()
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && (
          <button
            onClick={() => navigate(-1)}
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-ink-muted transition hover:text-forest-600"
          >
            <ChevronLeft className="h-4 w-4" /> Volver
          </button>
        )}
        <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-ink-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
