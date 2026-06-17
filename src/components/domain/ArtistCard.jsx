import { Link } from 'react-router-dom'
import { MapPin, Star, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Avatar, Badge, VerificationBadge } from '@/components/ui'
import { formatCLP, formatDistance } from '@/lib/format'

export const ArtistCard = ({ artista }) => {
  const cover = artista.portafolioCover || `https://picsum.photos/seed/${artista.id_artista}-cover/600/400`
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      <Link
        to={`/artista/${artista.id_artista}`}
        className="group block overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-soft transition-shadow hover:shadow-card"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={cover}
            alt={`Trabajo de ${artista.nombre}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/60 to-transparent" />
          <div className="absolute left-3 top-3 flex gap-2">
            {artista.flash_disponible && (
              <Badge tone="clay" icon={Zap} size="sm" className="bg-white/90">Flash</Badge>
            )}
          </div>
          {artista.distancia != null && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink">
              <MapPin className="h-3 w-3" /> {formatDistance(artista.distancia)}
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3">
            <Avatar src={artista.avatar} name={artista.nombre} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="truncate font-semibold text-ink">{artista.nombre}</h3>
              </div>
              <p className="flex items-center gap-1 text-xs text-ink-muted">
                <MapPin className="h-3 w-3" /> {artista.comuna}
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-ink">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {artista.rating > 0 ? artista.rating.toFixed(1) : '—'}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {artista.estilos.slice(0, 3).map((e) => (
              <Badge key={e} tone="sand" size="sm">{e}</Badge>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-sand-100 pt-3">
            <div>
              <p className="text-[11px] text-ink-muted">Tarifa media</p>
              <p className="text-sm font-bold text-forest-700">{formatCLP(artista.tarifa_media)}</p>
            </div>
            <VerificationBadge estado={artista.estado_verificacion} size="sm" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
