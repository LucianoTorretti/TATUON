import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Palette, Building2, Mail, Lock, Phone, ArrowRight, ArrowLeft,
  MapPin, ShieldCheck, Instagram, CircleDollarSign,
} from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Input, Button, Stepper, Select, Textarea, FileUpload } from '@/components/ui'
import { StyleSelector } from '@/components/domain'
import { useAuth } from '@/hooks/useAuth'
import { storage } from '@/services'
import { ROLES, ROLE_HOME } from '@/lib/constants'
import { COMUNAS } from '@/lib/geo'
import { validateDatos, validateVerificacion, normalizePhone, LIMITES } from '@/lib/validation'
import { cn } from '@/lib/cn'

const roleOptions = [
  { role: ROLES.CLIENTE, icon: User, title: 'Cliente', desc: 'Busco artistas y quiero reservar mi próximo tatuaje.' },
  { role: ROLES.ARTISTA, icon: Palette, title: 'Artista', desc: 'Soy tatuador/a y quiero gestionar mi agenda y portafolio.' },
  { role: ROLES.ESTUDIO, icon: Building2, title: 'Estudio', desc: 'Tengo un local con boxes y quiero rentabilizarlos.' },
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [rol, setRol] = useState(null)
  const [form, setForm] = useState({
    nombre: '', email: '', password: '', telefono: '', comuna: 'Providencia',
    biografia: '', tarifa_media: '', instagram: '', direccion: '', estilos: [],
  })
  const [pdf, setPdf] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const needsDoc = rol === ROLES.ARTISTA || rol === ROLES.ESTUDIO
  const steps = needsDoc ? ['Rol', 'Datos', 'Verificación'] : ['Rol', 'Datos']
  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors(({ [k]: _omit, ...rest }) => rest) // limpiar el error al corregir
  }

  const pickRole = (r) => {
    setRol(r)
    setStep(1)
  }

  // Muestra los errores y enfoca el primer campo inválido
  const applyErrors = (e) => {
    setErrors(e)
    const first = Object.keys(e)[0]
    if (first) document.querySelector(`[name="${first}"]`)?.focus()
    return !first
  }

  const next = () => {
    if (!applyErrors(validateDatos(form))) return
    if (!needsDoc) return doRegister()
    setStep(2)
  }

  const doRegister = async () => {
    if (needsDoc && !applyErrors(validateVerificacion(form, rol))) return
    setLoading(true)
    try {
      let docUrl = null
      if (needsDoc && pdf) {
        const up = await storage.upload('documentos', pdf)
        docUrl = up.ref
      }
      const coords = COMUNAS.find((c) => c.nombre === form.comuna)
      const extra = {
        biografia: form.biografia,
        tarifa_media: Number(form.tarifa_media) || 0,
        instagram: form.instagram,
        estilos: form.estilos,
        coords: coords ? { lat: coords.lat, lng: coords.lng } : null,
        direccion: form.direccion,
        nombre_fantasia: rol === ROLES.ESTUDIO ? form.nombre : undefined,
        descripcion: form.biografia,
        resolucion_sanitaria_url: rol === ROLES.ARTISTA ? docUrl : undefined,
        seremi_resolucion_url: rol === ROLES.ESTUDIO ? docUrl : undefined,
      }
      const user = await register({
        nombre: form.nombre.trim(), email: form.email.trim().toLowerCase(), password: form.password,
        telefono: normalizePhone(form.telefono), tipo_rol: rol, comuna: form.comuna, extra,
      })
      toast.success('¡Cuenta creada con éxito!')
      navigate(ROLE_HOME[user.tipo_rol], { replace: true })
    } catch (err) {
      toast.error(err.message)
      if (err.code === 'EMAIL_TAKEN') {
        setErrors({ email: err.message })
        setStep(1)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Únete al ecosistema del tatuaje profesional en Chile."
    >
      <div className="mb-8">
        <Stepper steps={steps} current={step} />
      </div>

      <AnimatePresence mode="wait">
        {/* PASO 0 — SELECCIÓN DE ROL */}
        {step === 0 && (
          <motion.div
            key="rol"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-ink-soft">¿Cómo usarás TATU ON?</p>
            {roleOptions.map((opt) => (
              <button
                key={opt.role}
                onClick={() => pickRole(opt.role)}
                className="group flex w-full items-center gap-4 rounded-2xl border border-sand-300 bg-white p-4 text-left transition hover:border-forest-400 hover:bg-forest-50"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-600 transition group-hover:bg-forest-500 group-hover:text-sand-50">
                  <opt.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-ink">{opt.title}</p>
                  <p className="text-sm text-ink-muted">{opt.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-ink-muted transition group-hover:translate-x-1 group-hover:text-forest-600" />
              </button>
            ))}
          </motion.div>
        )}

        {/* PASO 1 — DATOS */}
        {step === 1 && (
          <motion.div
            key="datos"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Input name="nombre" label={rol === ROLES.ESTUDIO ? 'Nombre del estudio' : 'Nombre completo'} icon={User}
              value={form.nombre} onChange={(e) => set('nombre', e.target.value)} error={errors.nombre}
              autoComplete={rol === ROLES.ESTUDIO ? 'organization' : 'name'}
              placeholder={rol === ROLES.ESTUDIO ? 'Black Lotus Studio' : 'Tu nombre'} />
            <Input name="email" label="Correo electrónico" type="email" icon={Mail} autoComplete="email"
              value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email}
              placeholder="tucorreo@mail.cl" />
            <div className="grid grid-cols-2 gap-3">
              <Input name="telefono" label="Teléfono" type="tel" icon={Phone} autoComplete="tel"
                value={form.telefono} onChange={(e) => set('telefono', e.target.value)} error={errors.telefono}
                placeholder="+56 9 1234 5678" />
              <Select name="comuna" label="Comuna" value={form.comuna} error={errors.comuna}
                onChange={(e) => set('comuna', e.target.value)}>
                {COMUNAS.map((c) => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
              </Select>
            </div>
            <Input name="password" label="Contraseña" type="password" icon={Lock} autoComplete="new-password"
              value={form.password} onChange={(e) => set('password', e.target.value)} error={errors.password}
              hint="Mínimo 8 caracteres, con letras y números." placeholder="••••••••" />

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep(0)}>
                <ArrowLeft className="h-4 w-4" /> Atrás
              </Button>
              <Button className="flex-1" onClick={next} loading={loading && !needsDoc}>
                {needsDoc ? 'Continuar' : 'Crear cuenta'} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* PASO 2 — VERIFICACIÓN (artista/estudio) */}
        {step === 2 && (
          <motion.div
            key="verif"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {rol === ROLES.ARTISTA && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-soft">Estilos artísticos</label>
                  <StyleSelector value={form.estilos} onChange={(v) => set('estilos', v)} />
                  {errors.estilos && <p role="alert" className="mt-1 text-xs font-medium text-clay-500">{errors.estilos}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input name="tarifa_media" label="Tarifa media (CLP)" inputMode="numeric" icon={CircleDollarSign}
                    value={form.tarifa_media} onChange={(e) => set('tarifa_media', e.target.value)}
                    error={errors.tarifa_media} placeholder="80000" />
                  <Input name="instagram" label="Instagram" icon={Instagram}
                    value={form.instagram} onChange={(e) => set('instagram', e.target.value)}
                    error={errors.instagram} placeholder="@tu.usuario" />
                </div>
                <Textarea name="biografia" label="Biografía" value={form.biografia} error={errors.biografia}
                  maxLength={LIMITES.BIO_MAX}
                  onChange={(e) => set('biografia', e.target.value)} placeholder="Cuéntale a tus clientes sobre tu trabajo…" />
              </>
            )}
            {rol === ROLES.ESTUDIO && (
              <>
                <Input name="direccion" label="Dirección" icon={MapPin} autoComplete="street-address"
                  value={form.direccion} onChange={(e) => set('direccion', e.target.value)}
                  error={errors.direccion} placeholder="Av. Providencia 1234" />
                <Textarea name="biografia" label="Descripción del estudio" value={form.biografia} error={errors.biografia}
                  maxLength={LIMITES.BIO_MAX}
                  onChange={(e) => set('biografia', e.target.value)} placeholder="Boxes, equipamiento, ambiente…" />
              </>
            )}

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <ShieldCheck className="h-4 w-4" /> Verificación sanitaria obligatoria
              </p>
              <p className="mt-1 text-xs text-amber-700">
                Sube tu resolución sanitaria de la SEREMI de Salud (PDF). Tu perfil quedará oculto
                del marketplace hasta que un operador la apruebe (RF-01 / RS-01).
              </p>
              <FileUpload
                className="mt-3"
                accept="application/pdf"
                type="pdf"
                label="Subir resolución SEREMI (PDF)"
                hint="Máximo 4 MB"
                onFile={setPdf}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" /> Atrás
              </Button>
              <Button className="flex-1" onClick={doRegister} loading={loading}>
                Crear cuenta <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-center text-xs text-ink-muted">
              Puedes registrarte sin el documento y subirlo más tarde desde tu panel.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-7 text-center text-sm text-ink-muted">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-forest-600 hover:text-forest-700">Inicia sesión</Link>
      </p>
    </AuthLayout>
  )
}
