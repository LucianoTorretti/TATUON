import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui'
import { ShieldCheck, Lock, Server, MapPin } from 'lucide-react'

// Footer público con sello de confianza (representa RNF-02/03 y RS-01)
export const Footer = () => (
  <footer className="border-t border-forest-800 bg-forest-700 text-sand-100">
    <div className="container-app py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo variant="light" />
          <p className="mt-4 max-w-sm text-sm text-forest-100/80">
            El ecosistema digital que conecta clientes, artistas y estudios de tatuaje en Chile.
            Búsqueda geolocalizada, agenda sincronizada y reservas seguras.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs text-forest-100/70">
            <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> TLS 1.3</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Datos AES-256</span>
            <span className="inline-flex items-center gap-1.5"><Server className="h-3.5 w-3.5" /> SLA 99.9%</span>
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Cumplimiento SEREMI</span>
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-sand-50">Plataforma</p>
          <ul className="space-y-2 text-sm text-forest-100/80">
            <li><Link to="/buscar" className="link-underline">Explorar artistas</Link></li>
            <li><Link to="/registro" className="link-underline">Soy artista</Link></li>
            <li><Link to="/registro" className="link-underline">Registrar estudio</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-sand-50">Cuenta</p>
          <ul className="space-y-2 text-sm text-forest-100/80">
            <li><Link to="/login" className="link-underline">Iniciar sesión</Link></li>
            <li><Link to="/registro" className="link-underline">Crear cuenta</Link></li>
            <li><Link to="/recuperar" className="link-underline">Recuperar contraseña</Link></li>
          </ul>
        </div>
      </div>
      <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-forest-600 pt-6 text-xs text-forest-100/60 sm:flex-row">
        <p>© {new Date().getFullYear()} TATU ON · Prototipo académico — Calidad de Software</p>
        <p>Hecho en Chile 🇨🇱</p>
      </div>
    </div>
  </footer>
)
