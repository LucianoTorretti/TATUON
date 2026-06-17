import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { Logo, Button } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sand-100 px-4 text-center">
      <Logo className="mb-8" />
      <p className="font-display text-7xl font-bold text-forest-600">404</p>
      <h1 className="mt-3 text-2xl font-semibold text-ink">Página no encontrada</h1>
      <p className="mt-2 max-w-sm text-ink-muted">
        La ruta que buscas no existe o fue movida. Volvamos a un lugar seguro.
      </p>
      <Button as={Link} to="/" className="mt-7">
        <Home className="h-4 w-4" /> Ir al inicio
      </Button>
    </div>
  )
}
