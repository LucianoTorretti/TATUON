import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Logo, Button } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_HOME } from '@/lib/constants'

export const PublicNavbar = () => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-sand-100/80 backdrop-blur-md">
      <div className="container-app flex h-16 items-center justify-between">
        <Link to="/"><Logo /></Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
          <a href="/#como-funciona" className="link-underline">Cómo funciona</a>
          <a href="/#artistas" className="link-underline">Artistas</a>
          <a href="/#estudios" className="link-underline">Estudios</a>
          <a href="/#confianza" className="link-underline">Confianza</a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Button as={Link} to={ROLE_HOME[user.tipo_rol]} size="sm">Ir a mi panel</Button>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" size="sm">Iniciar sesión</Button>
              <Button as={Link} to="/registro" size="sm">Crear cuenta</Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menú">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="animate-fade-in border-t border-sand-200 bg-sand-100 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium text-ink-soft">
            <a href="/#como-funciona" onClick={() => setOpen(false)}>Cómo funciona</a>
            <a href="/#artistas" onClick={() => setOpen(false)}>Artistas</a>
            <a href="/#confianza" onClick={() => setOpen(false)}>Confianza</a>
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <Button as={Link} to={ROLE_HOME[user.tipo_rol]} className="w-full">Ir a mi panel</Button>
            ) : (
              <>
                <Button as={Link} to="/login" variant="outline" className="w-full">Iniciar sesión</Button>
                <Button as={Link} to="/registro" className="w-full">Crear cuenta</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
