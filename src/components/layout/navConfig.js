import {
  LayoutDashboard, Search, Map, CalendarClock, Images, Palette,
  ShieldCheck, Box, Users, FileCheck2, BarChart3, Settings, Star,
} from 'lucide-react'
import { ROLES } from '@/lib/constants'

// Navegación por rol (sidebar + bottom nav)
export const navByRole = {
  [ROLES.CLIENTE]: [
    { to: '/cliente', label: 'Inicio', icon: LayoutDashboard, end: true },
    { to: '/buscar', label: 'Buscar', icon: Search },
    { to: '/mapa', label: 'Mapa', icon: Map },
    { to: '/cliente/reservas', label: 'Reservas', icon: CalendarClock },
  ],
  [ROLES.ARTISTA]: [
    { to: '/artista', label: 'Panel', icon: LayoutDashboard, end: true },
    { to: '/artista/agenda', label: 'Agenda', icon: CalendarClock },
    { to: '/artista/portafolio', label: 'Portafolio', icon: Images },
    { to: '/artista/estilos', label: 'Estilos', icon: Palette },
    { to: '/artista/verificacion', label: 'Verificación', icon: ShieldCheck },
  ],
  [ROLES.ESTUDIO]: [
    { to: '/estudio', label: 'Panel', icon: LayoutDashboard, end: true },
    { to: '/estudio/boxes', label: 'Boxes', icon: Box },
    { to: '/estudio/verificacion', label: 'Certificación', icon: ShieldCheck },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin', label: 'Métricas', icon: BarChart3, end: true },
    { to: '/admin/documentos', label: 'Documentos', icon: FileCheck2 },
    { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  ],
}

// Para la barra inferior en móvil (máx 5 ítems + perfil)
export const bottomNavByRole = {
  [ROLES.CLIENTE]: [
    { to: '/cliente', label: 'Inicio', icon: LayoutDashboard, end: true },
    { to: '/buscar', label: 'Buscar', icon: Search },
    { to: '/mapa', label: 'Mapa', icon: Map },
    { to: '/cliente/reservas', label: 'Reservas', icon: CalendarClock },
  ],
  [ROLES.ARTISTA]: [
    { to: '/artista', label: 'Panel', icon: LayoutDashboard, end: true },
    { to: '/artista/agenda', label: 'Agenda', icon: CalendarClock },
    { to: '/artista/portafolio', label: 'Portafolio', icon: Images },
    { to: '/artista/verificacion', label: 'Verificar', icon: ShieldCheck },
  ],
  [ROLES.ESTUDIO]: [
    { to: '/estudio', label: 'Panel', icon: LayoutDashboard, end: true },
    { to: '/estudio/boxes', label: 'Boxes', icon: Box },
    { to: '/estudio/verificacion', label: 'Certificar', icon: ShieldCheck },
  ],
  [ROLES.ADMIN]: [
    { to: '/admin', label: 'Métricas', icon: BarChart3, end: true },
    { to: '/admin/documentos', label: 'Docs', icon: FileCheck2 },
    { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  ],
}

export const commonNav = [
  { to: '/configuracion', label: 'Configuración', icon: Settings },
]
