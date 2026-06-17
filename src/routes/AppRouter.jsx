import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGuard } from './RoleGuard'
import { AppShell } from '@/components/layout'
import { ROLES } from '@/lib/constants'

// Public
import Landing from '@/pages/public/Landing'
import Login from '@/pages/public/Login'
import Register from '@/pages/public/Register'
import ForgotPassword from '@/pages/public/ForgotPassword'
import NotFound from '@/pages/public/NotFound'

// Cliente
import ClienteDashboard from '@/pages/cliente/ClienteDashboard'
import Buscador from '@/pages/cliente/Buscador'
import MapaGeo from '@/pages/cliente/MapaGeo'
import PerfilArtista from '@/pages/cliente/PerfilArtista'
import ReservaCita from '@/pages/cliente/ReservaCita'
import PagoSena from '@/pages/cliente/PagoSena'
import Reservas from '@/pages/cliente/Reservas'
import DejarResena from '@/pages/cliente/DejarResena'

// Artista
import ArtistaDashboard from '@/pages/artista/ArtistaDashboard'
import GestionPortafolio from '@/pages/artista/GestionPortafolio'
import GestionEstilos from '@/pages/artista/GestionEstilos'
import AgendaArtista from '@/pages/artista/AgendaArtista'

// Estudio
import EstudioDashboard from '@/pages/estudio/EstudioDashboard'
import GestionBoxes from '@/pages/estudio/GestionBoxes'

// Admin
import AdminDashboard from '@/pages/admin/AdminDashboard'
import ValidacionDocumentos from '@/pages/admin/ValidacionDocumentos'
import ModeracionUsuarios from '@/pages/admin/ModeracionUsuarios'

// Shared
import VerificacionSanitaria from '@/pages/shared/VerificacionSanitaria'
import Configuracion from '@/pages/shared/Configuracion'
import Notificaciones from '@/pages/shared/Notificaciones'

const Cliente = ({ children }) => <RoleGuard roles={[ROLES.CLIENTE]}>{children}</RoleGuard>
const Artista = ({ children }) => <RoleGuard roles={[ROLES.ARTISTA]}>{children}</RoleGuard>
const Estudio = ({ children }) => <RoleGuard roles={[ROLES.ESTUDIO]}>{children}</RoleGuard>
const Admin = ({ children }) => <RoleGuard roles={[ROLES.ADMIN]}>{children}</RoleGuard>

export const AppRouter = () => (
  <Routes>
    {/* ---------- Públicas ---------- */}
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/registro" element={<Register />} />
    <Route path="/recuperar" element={<ForgotPassword />} />

    {/* ---------- Privadas (con AppShell) ---------- */}
    <Route
      element={
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      }
    >
      {/* Cliente */}
      <Route path="/cliente" element={<Cliente><ClienteDashboard /></Cliente>} />
      <Route path="/cliente/reservas" element={<Cliente><Reservas /></Cliente>} />
      <Route path="/buscar" element={<Cliente><Buscador /></Cliente>} />
      <Route path="/mapa" element={<Cliente><MapaGeo /></Cliente>} />
      <Route path="/reservar/:artistaId" element={<Cliente><ReservaCita /></Cliente>} />
      <Route path="/pago/:reservaId" element={<Cliente><PagoSena /></Cliente>} />
      <Route path="/resena/:reservaId" element={<Cliente><DejarResena /></Cliente>} />

      {/* Perfil de artista (visible para cualquier sesión) */}
      <Route path="/artista/:id" element={<PerfilArtista />} />

      {/* Artista (panel) */}
      <Route path="/artista" element={<Artista><ArtistaDashboard /></Artista>} />
      <Route path="/artista/agenda" element={<Artista><AgendaArtista /></Artista>} />
      <Route path="/artista/portafolio" element={<Artista><GestionPortafolio /></Artista>} />
      <Route path="/artista/estilos" element={<Artista><GestionEstilos /></Artista>} />
      <Route path="/artista/verificacion" element={<Artista><VerificacionSanitaria /></Artista>} />

      {/* Estudio */}
      <Route path="/estudio" element={<Estudio><EstudioDashboard /></Estudio>} />
      <Route path="/estudio/boxes" element={<Estudio><GestionBoxes /></Estudio>} />
      <Route path="/estudio/verificacion" element={<Estudio><VerificacionSanitaria /></Estudio>} />

      {/* Admin */}
      <Route path="/admin" element={<Admin><AdminDashboard /></Admin>} />
      <Route path="/admin/documentos" element={<Admin><ValidacionDocumentos /></Admin>} />
      <Route path="/admin/usuarios" element={<Admin><ModeracionUsuarios /></Admin>} />

      {/* Comunes */}
      <Route path="/configuracion" element={<Configuracion />} />
      <Route path="/notificaciones" element={<Notificaciones />} />
    </Route>

    {/* ---------- 404 ---------- */}
    <Route path="*" element={<NotFound />} />
  </Routes>
)
