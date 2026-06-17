import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Mail, Lock, ArrowRight, UserCog, Palette, Building2, User } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Input, Button } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { ROLE_HOME, ROLES } from '@/lib/constants'
import { cn } from '@/lib/cn'

const demoAccounts = [
  { role: ROLES.CLIENTE, email: 'cliente@tatuon.cl', label: 'Cliente', icon: User },
  { role: ROLES.ARTISTA, email: 'artista@tatuon.cl', label: 'Artista', icon: Palette },
  { role: ROLES.ESTUDIO, email: 'estudio@tatuon.cl', label: 'Estudio', icon: Building2 },
  { role: ROLES.ADMIN, email: 'admin@tatuon.cl', label: 'Admin', icon: UserCog },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const user = await login(email, password)
      toast.success(`¡Bienvenido/a, ${user.nombre.split(' ')[0]}!`)
      const from = location.state?.from
      navigate(from && from !== '/login' ? from : ROLE_HOME[user.tipo_rol], { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (acc) => {
    setEmail(acc.email)
    setPassword('demo1234')
    setError(null)
  }

  return (
    <AuthLayout title="Bienvenido de vuelta" subtitle="Inicia sesión para gestionar tus reservas y tu perfil.">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Correo electrónico"
          type="email"
          name="email"
          icon={Mail}
          placeholder="tucorreo@mail.cl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Contraseña"
          type="password"
          name="password"
          icon={Lock}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          error={error}
        />
        <div className="flex justify-end">
          <Link to="/recuperar" className="text-sm font-medium text-forest-600 hover:text-forest-700">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Iniciar sesión <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      {/* Cuentas demo */}
      <div className="mt-7">
        <div className="relative mb-4 text-center">
          <span className="relative z-10 bg-sand-100 px-3 text-xs font-medium uppercase tracking-wide text-ink-muted">
            Cuentas demo · pass: demo1234
          </span>
          <span className="absolute left-0 top-1/2 h-px w-full bg-sand-300" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {demoAccounts.map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => fillDemo(acc)}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border border-sand-300 bg-white px-2 py-3 text-xs font-medium text-ink-soft transition',
                'hover:border-forest-400 hover:bg-forest-50 hover:text-forest-700',
              )}
            >
              <acc.icon className="h-5 w-5" />
              {acc.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-7 text-center text-sm text-ink-muted">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="font-semibold text-forest-600 hover:text-forest-700">
          Crear cuenta gratis
        </Link>
      </p>
    </AuthLayout>
  )
}
