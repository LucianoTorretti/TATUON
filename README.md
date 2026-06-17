# TATU ON — Marketplace de Tatuajes 🖋️

Prototipo web de **alta fidelidad** del ecosistema digital que conecta **clientes, artistas y
estudios** de tatuaje en Chile. Construido como entregable del informe de proyecto del ramo
**Calidad de Software**.

> Búsqueda geolocalizada · Agenda sincronizada · Pago de seña (Webpay simulado) · Reseñas
> verificadas · Verificación sanitaria SEREMI · Panel de moderación.

---

## ✨ Stack tecnológico

| Capa | Tecnología |
|------|------------|
| UI | **React 18 + Vite** |
| Estilos | **Tailwind CSS** (tema claro premium: beige + verde oscuro) |
| Ruteo | **React Router v6** (rutas protegidas + guardas por rol) |
| Estado global | **Zustand** (sesión y notificaciones) |
| Mapas | **Leaflet + OpenStreetMap** (sin API key) |
| Animación / UX | **Framer Motion**, **lucide-react**, **react-hot-toast** |
| Backend | **Mock-first** (localStorage) con **adaptador Firebase listo** |

### Backend Mock-first, Firebase-ready
El prototipo corre **100% sin configuración** usando un backend simulado en `localStorage` que
**imita la API de Firebase** (Auth, Firestore y Storage) con datos semilla realistas. El código
está estructurado para migrar a **Firebase real** sin tocar las pantallas: solo se activa el
adaptador con variables de entorno.

```
src/services/
├─ index.js          # selector de adaptador según VITE_USE_FIREBASE
├─ mock/             # ADAPTADOR ACTIVO (localStorage + seed)
└─ firebase/         # adaptador real (esqueleto, apagado por defecto)
```

---

## 🚀 Instalación y ejecución

### Requisitos
- **Node.js 18 o superior** (incluye npm). Descárgalo en <https://nodejs.org>.

### Pasos
```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el entorno de desarrollo
npm run dev
```
La app abre automáticamente en **http://localhost:5173**. No requiere ninguna clave ni configuración.

### Otros comandos
```bash
npm run build     # build de producción (genera /dist)
npm run preview   # sirve el build de producción
```

---

## 🔑 Cuentas demo (precargadas)

Contraseña para todas: **`demo1234`**. En la pantalla de login puedes autocompletarlas con un clic.

| Rol | Correo | Qué puedes probar |
|-----|--------|-------------------|
| 👤 Cliente | `cliente@tatuon.cl` | Buscar, mapa, reservar, pagar seña, historial, reseñas |
| 🎨 Artista | `artista@tatuon.cl` | Agenda, portafolio, estilos, subir PDF sanitario |
| 🏢 Estudio | `estudio@tatuon.cl` | Gestionar boxes, certificación SEREMI |
| 🛡️ Admin | `admin@tatuon.cl` | Validar documentos, moderar usuarios, métricas |

> En **Configuración** puedes **reiniciar los datos demo** a su estado inicial en cualquier momento.

---

## 🗺️ Recorrido sugerido para la demo

1. **Cliente** → *Buscar* (filtra por estilo/precio) → abre un perfil → **Reservar cita** →
   elige bloque y box → **Pagar seña** (Webpay simulado, 10%) → cita **Confirmada** + notificación.
2. **Artista** → *Agenda*: marca una cita como **Ejecutada**.
3. **Cliente** → *Mis reservas*: deja una **reseña verificada** (solo se habilita en citas ejecutadas y pagadas).
4. **Admin** → *Documentos*: aprueba a **Javiera Núñez** → ahora aparece en el buscador (verificación funcional).

---

## 📁 Estructura del proyecto

```
src/
├─ components/
│  ├─ ui/         # design system reutilizable (Button, Card, Modal, FileUpload…)
│  ├─ layout/     # AppShell, Sidebar, Navbar, MobileBottomNav, Footer
│  └─ domain/     # ArtistCard, MapView, BookingCalendar, PaymentWebpay, Reviews…
├─ pages/         # 1 carpeta por área: public, cliente, artista, estudio, admin, shared
├─ routes/        # AppRouter + ProtectedRoute + RoleGuard
├─ services/      # capa de datos (mock | firebase)
├─ store/         # zustand (authStore, notificationStore)
├─ hooks/         # useAuth, useGeolocation, useAsync, useDebounce, useMediaQuery
├─ data/          # datos semilla
└─ lib/           # helpers (format CLP/fechas, geo haversine, constants)
```

---

## ✅ Cobertura de requerimientos del informe

| Código | Requerimiento | Dónde se demuestra |
|--------|---------------|--------------------|
| **RF-01** | Registro y verificación segmentada | `Register` (stepper + PDF), `VerificacionSanitaria` |
| **RF-02** | Buscador avanzado con geolocalización | `Buscador`, `MapaGeo` |
| **RF-03** | Portafolio de alta resolución indexado por estilo | `GestionPortafolio`, `PortfolioGrid` |
| **RF-04** | Agendamiento sincronizado (anti-colisión) | `ReservaCita`, `BookingCalendar` |
| **RF-05** | Pasarela de procesamiento de señas (10%) | `PagoSena`, `PaymentWebpay` |
| **RF-06** | Reputación bilateral verificada | `DejarResena`, `Reviews` |
| **RF-07** | Panel administrativo de moderación | `AdminDashboard`, `ValidacionDocumentos`, `ModeracionUsuarios` |
| **RNF-01/03** | Latencia simulada, TLS 1.3 / AES-256 (sellos) | latencias en mock, footer y `Configuracion` |
| **RNF-02** | Disponibilidad SLA 99.9% | sello de confianza (footer/landing) |
| **RS-01** | Cumplimiento sanitario SEREMI | perfiles sin aprobar **no aparecen** en el buscador |
| **RS-02/03** | MVP, multiplataforma responsive | diseño mobile-first (sidebar ↔ bottom nav) |
| **CU-01…CU-07** | Casos de uso | mapeados 1:1 a las pantallas anteriores |

---

## 🔧 Activar Firebase real (opcional)

1. Crea un proyecto en <https://console.firebase.google.com> con Auth, Firestore y Storage.
2. Copia `.env.example` a `.env` y completa tus credenciales `VITE_FIREBASE_*`.
3. Cambia `VITE_USE_FIREBASE=true`.
4. Implementa los métodos en `src/services/firebase/` (mismas firmas que el mock).

---

## 📝 Notas

- Las imágenes de demo provienen de servicios públicos (picsum.photos, pravatar.cc) y requieren conexión a internet.
- El pago es una **simulación de Transbank/Webpay**; no se realiza ningún cobro real.
- Proyecto académico — no apto para producción sin completar el backend real y auditorías de seguridad.

---

_Hecho en Chile 🇨🇱 · TATU ON · Calidad de Software_
