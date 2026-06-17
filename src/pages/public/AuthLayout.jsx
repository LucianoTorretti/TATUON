import { Link } from 'react-router-dom'
import { Quote, ShieldCheck, Star } from 'lucide-react'
import { Logo } from '@/components/ui'

// Layout dividido para pantallas de autenticación
export const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen lg:grid lg:grid-cols-2">
    {/* Panel de marca */}
    <div className="relative hidden overflow-hidden bg-forest-700 lg:block">
      <img
        src="https://picsum.photos/seed/tatuon-auth/1000/1400"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-forest-700/90 to-forest-800/95" />
      <div className="relative flex h-full flex-col justify-between p-12 text-sand-50">
        <Link to="/"><Logo variant="light" /></Link>
        <div>
          <Quote className="h-10 w-10 text-forest-300" />
          <p className="mt-4 max-w-md font-display text-2xl font-semibold leading-snug">
            “Reservé en minutos, pagué la seña segura y el resultado fue exactamente lo que buscaba.”
          </p>
          <div className="mt-5 flex items-center gap-3">
            <img src="https://i.pravatar.cc/80?img=45" alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-forest-400" />
            <div>
              <p className="font-semibold">Valentina R.</p>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-forest-100/80">
          <ShieldCheck className="h-4 w-4" /> Datos protegidos · TLS 1.3 · AES-256
        </div>
      </div>
    </div>

    {/* Formulario */}
    <div className="flex min-h-screen flex-col justify-center bg-sand-100 px-5 py-10 sm:px-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <Link to="/"><Logo /></Link>
        </div>
        <h1 className="font-display text-3xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  </div>
)
