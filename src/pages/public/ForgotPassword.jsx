import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Input, Button } from '@/components/ui'
import { auth } from '@/services'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await auth.resetPassword(email)
    setLoading(false)
    setSent(true)
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para restablecerla."
    >
      {sent ? (
        <div className="rounded-2xl border border-forest-200 bg-forest-50 p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-forest-500" />
          <h3 className="mt-3 font-semibold text-ink">Revisa tu correo</h3>
          <p className="mt-2 text-sm text-ink-soft">
            Si <span className="font-medium">{email}</span> está registrado, recibirás un enlace
            para restablecer tu contraseña.
          </p>
          <Button as={Link} to="/login" variant="outline" className="mt-5">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Correo electrónico"
            type="email"
            icon={Mail}
            placeholder="tucorreo@mail.cl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Enviar enlace de recuperación
          </Button>
          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-forest-600 hover:text-forest-700"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al inicio de sesión
          </Link>
        </form>
      )}
    </AuthLayout>
  )
}
