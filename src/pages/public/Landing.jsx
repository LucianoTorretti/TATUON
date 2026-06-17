import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, CalendarClock, ShieldCheck, MapPin, Star, Zap, CreditCard,
  Palette, ArrowRight, Users, Building2, Sparkles,
} from 'lucide-react'
import { PublicNavbar, Footer } from '@/components/layout'
import { Button, Badge } from '@/components/ui'

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

const features = [
  { icon: Search, title: 'Búsqueda avanzada', desc: 'Filtra por estilo, comuna, tarifa y disponibilidad de diseños flash con geolocalización en tiempo real.' },
  { icon: CalendarClock, title: 'Agenda sincronizada', desc: 'Reserva un bloque y el motor evita la superposición de citas de forma automática.' },
  { icon: CreditCard, title: 'Seña segura', desc: 'Confirma tu cita pagando una seña del 10% vía Webpay. Adiós a las inasistencias.' },
  { icon: ShieldCheck, title: 'Verificación sanitaria', desc: 'Solo artistas y estudios con resolución SEREMI vigente son visibles en el marketplace.' },
  { icon: Star, title: 'Reseñas verificadas', desc: 'Calificaciones reales: solo quien tuvo una cita ejecutada y pagada puede evaluar.' },
  { icon: MapPin, title: 'Espacios certificados', desc: 'Tatuadores itinerantes vinculados a boxes físicos que cumplen estándares de higiene.' },
]

const steps = [
  { n: '01', title: 'Explora y filtra', desc: 'Encuentra al artista ideal por estilo, ubicación y presupuesto.' },
  { n: '02', title: 'Reserva tu bloque', desc: 'Elige día y hora en la agenda en tiempo real del artista y su box.' },
  { n: '03', title: 'Paga la seña', desc: 'Confirma con una seña del 10% mediante Webpay de forma segura.' },
  { n: '04', title: 'Tatúate y evalúa', desc: 'Vive la experiencia y deja tu reseña verificada al finalizar.' },
]

const roles = [
  { icon: Users, title: 'Clientes', desc: 'Descubre artistas, reserva sin fricción y paga seguro.', cta: 'Buscar artistas', to: '/registro' },
  { icon: Palette, title: 'Artistas', desc: 'Profesionaliza tu agenda, gana visibilidad y reduce los no-show.', cta: 'Soy artista', to: '/registro' },
  { icon: Building2, title: 'Estudios', desc: 'Rentabiliza tus boxes y vincúlalos con talento verificado.', cta: 'Registrar estudio', to: '/registro' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-sand-100">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-forest-200/40 blur-3xl" />
        <div className="absolute -left-32 top-40 h-80 w-80 rounded-full bg-clay-400/10 blur-3xl" />
        <div className="container-app relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge tone="forest" icon={Sparkles} className="mb-5">El marketplace del tatuaje en Chile</Badge>
            <h1 className="font-display text-4xl font-bold leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
              Tu próximo tatuaje,
              <span className="text-forest-600"> sin fricciones.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-soft">
              TATU ON conecta clientes, artistas y estudios en un solo lugar. Busca por estilo,
              reserva en segundos y paga seguro. Profesional, transparente y geolocalizado.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/registro" size="lg">
                Comenzar gratis <ArrowRight className="h-4 w-4" />
              </Button>
              <Button as={Link} to="/login" variant="outline" size="lg">
                Ver demo
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-muted">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-forest-500" /> Verificación SEREMI</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-clay-500" /> Diseños flash</span>
              <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-amber-500" /> Reseñas reales</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                { src: '/images/portfolio/realismo-2.webp',   label: 'Realismo',    pos: 'object-top'    },
                { src: '/images/portfolio/acuarela-1.webp',   label: 'Acuarela',    pos: 'object-top'    },
                { src: '/images/portfolio/blackwork-1.webp',  label: 'Blackwork',   pos: 'object-center' },
                { src: '/images/portfolio/geometrico-3.webp', label: 'Geométrico',  pos: 'object-center' },
              ].map(({ src, label, pos }, i) => (
                <div
                  key={src}
                  className={`aspect-[3/4] overflow-hidden rounded-2xl shadow-card ${i % 2 ? 'translate-y-6' : ''}`}
                >
                  <img
                    src={src}
                    alt={`Tatuaje estilo ${label}`}
                    className={`h-full w-full object-cover ${pos} transition-transform duration-700 hover:scale-105`}
                  />
                </div>
              ))}
            </div>
            <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-sand-200 bg-white px-4 py-3 shadow-lift">
              <div className="flex -space-x-2">
                {[5, 12, 31, 47].map((p) => (
                  <img key={p} src={`https://i.pravatar.cc/80?img=${p}`} alt="" className="h-8 w-8 rounded-full border-2 border-white object-cover" />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">+6.000.000</p>
                <p className="text-xs text-ink-muted">chilenos con tatuajes</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* MÉTRICAS */}
      <section className="border-y border-sand-200 bg-sand-50">
        <div className="container-app grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {[
            { v: '8+', l: 'Estilos artísticos' },
            { v: '1 de 3', l: 'Chilenos tatuados' },
            { v: '10%', l: 'Seña para confirmar' },
            { v: '99.9%', l: 'Disponibilidad (SLA)' },
          ].map((m) => (
            <div key={m.l} className="text-center">
              <p className="font-display text-3xl font-bold text-forest-600">{m.v}</p>
              <p className="mt-1 text-sm text-ink-muted">{m.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="artistas" className="container-app py-16 lg:py-24">
        <motion.div {...fade} className="mx-auto max-w-2xl text-center">
          <Badge tone="sand" className="mb-4">Todo en una plataforma</Badge>
          <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            Diseñado para una experiencia premium
          </h2>
          <p className="mt-4 text-ink-soft">
            Eliminamos las consultas manuales de Instagram y WhatsApp con herramientas reales de gestión.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              {...fade}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="group rounded-2xl border border-sand-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-card"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest-50 text-forest-600 transition group-hover:bg-forest-500 group-hover:text-sand-50">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-ink-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="bg-forest-700 py-16 text-sand-100 lg:py-24">
        <div className="container-app">
          <motion.div {...fade} className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-sand-50 sm:text-4xl">Cómo funciona</h2>
            <p className="mt-4 text-forest-100/80">De la búsqueda a la cita en cuatro pasos.</p>
          </motion.div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <motion.div key={s.n} {...fade} transition={{ duration: 0.45, delay: i * 0.08 }}>
                <p className="font-display text-5xl font-bold text-forest-400/70">{s.n}</p>
                <h3 className="mt-3 text-lg font-semibold text-sand-50">{s.title}</h3>
                <p className="mt-2 text-sm text-forest-100/75">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="estudios" className="container-app py-16 lg:py-24">
        <motion.div {...fade} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">Para todo el ecosistema</h2>
          <p className="mt-4 text-ink-soft">Un solo lugar para clientes, artistas y estudios.</p>
        </motion.div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {roles.map((r, i) => (
            <motion.div
              key={r.title}
              {...fade}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="flex flex-col rounded-3xl border border-sand-200 bg-gradient-to-b from-white to-sand-50 p-7"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-500 text-sand-50">
                <r.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-ink">{r.title}</h3>
              <p className="mt-2 flex-1 text-sm text-ink-muted">{r.desc}</p>
              <Button as={Link} to={r.to} variant="outline" className="mt-6">
                {r.cta} <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CONFIANZA / CTA */}
      <section id="confianza" className="container-app pb-20">
        <motion.div
          {...fade}
          className="overflow-hidden rounded-3xl bg-forest-600 px-8 py-14 text-center text-sand-50 sm:px-16"
        >
          <ShieldCheck className="mx-auto h-12 w-12 text-forest-200" />
          <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
            Confianza en cada tatuaje
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-forest-100/85">
            Cifrado TLS 1.3, datos protegidos con AES-256 y cumplimiento estricto de las normativas
            sanitarias SEREMI de Chile. Tu seguridad es nuestra prioridad.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button as={Link} to="/registro" variant="white" size="lg">Crear mi cuenta</Button>
            <Button as={Link} to="/login" variant="ghost" size="lg" className="text-sand-50 hover:bg-forest-500">
              Probar con cuenta demo
            </Button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  )
}
