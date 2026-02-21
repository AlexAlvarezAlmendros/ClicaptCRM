# LeadFlow CRM

CRM para pequeñas empresas y freelancers españoles. Gestión de contactos, pipeline de ventas (kanban), tareas y suscripción con Stripe.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite, React Router v6, TanStack Query, Zustand, Tailwind CSS |
| Backend | Vercel Serverless Functions (Node.js 20) |
| Base de datos | Turso (libSQL) |
| Autenticación | Auth0 (PKCE + JWT) |
| Pagos | Stripe (Checkout + Portal) |
| Email | Nodemailer + Gmail SMTP |

## Requisitos previos

- Node.js 20+
- Cuenta en [Turso](https://turso.tech)
- Cuenta en [Auth0](https://auth0.com)
- Cuenta en [Stripe](https://stripe.com) (opcional en dev)
- Cuenta en [Vercel](https://vercel.com) para despliegue

## Inicio rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales

# 3. Ejecutar migraciones
npm run migrate

# 4. (Opcional) Datos de ejemplo
npm run seed

# 5. Iniciar dev server
npm run dev
```

La app estará disponible en `http://localhost:5173`.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm test` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Tests E2E (Playwright) |
| `npm run migrate` | Ejecutar migraciones SQL |
| `npm run seed` | Insertar datos de ejemplo |

## Estructura del proyecto

```
├── api/                    # Serverless functions (Vercel)
│   ├── _lib/               # Código compartido (no expuesto)
│   │   ├── db/             # Cliente DB + schema
│   │   ├── middleware/     # Auth, tenant, rate limit, etc.
│   │   ├── services/       # Lógica de negocio
│   │   ├── utils/          # Helpers
│   │   └── validators/     # Schemas Zod
│   ├── auth/               # Endpoints autenticación
│   ├── contacts/           # CRUD contactos
│   ├── deals/              # CRUD deals
│   ├── tasks/              # CRUD tareas
│   ├── activities/         # Timeline actividades
│   ├── dashboard/          # Estadísticas
│   ├── organization/       # Gestión organización
│   ├── pipeline/           # Etapas pipeline
│   ├── stripe/             # Checkout, webhook, portal
│   ├── cron/               # Jobs programados
│   └── tags/               # Gestión etiquetas
├── src/                    # Frontend React
│   ├── components/
│   │   ├── ui/             # Componentes base reutilizables
│   │   ├── layout/         # Layout, sidebar, header
│   │   ├── dashboard/      # KPI cards
│   │   └── pipeline/       # Kanban board
│   ├── hooks/              # Custom hooks (TanStack Query)
│   ├── stores/             # Zustand stores
│   ├── pages/              # Vistas/páginas
│   ├── routes/             # React Router config
│   ├── lib/                # API client, formatters, utils
│   ├── styles/             # CSS tokens, tipografía
│   └── test/               # Test setup
├── scripts/                # Migrate, seed
├── public/                 # Assets estáticos
└── Docs/                   # Documentación del proyecto
```

## Variables de entorno

Consulta `.env.example` para la lista completa. Las variables con prefijo `VITE_` están disponibles en el frontend.

## Despliegue

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

Configura las variables de entorno en el dashboard de Vercel antes del primer despliegue.

## Licencia

Propietario — Todos los derechos reservados.
