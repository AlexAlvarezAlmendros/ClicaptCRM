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

## Funcionalidades

### Contactos
- CRUD completo con validación Zod
- Filtros por estado, fuente, etiquetas y búsqueda libre
- Sistema de etiquetas con colores personalizados
- Detalle de contacto con timeline de actividades y deals asociados
- Importación y exportación CSV (con mapeo de cabeceras ES/EN)

### Pipeline de ventas (Kanban)
- Tablero drag & drop con @dnd-kit
- Etapas configurables (nombre, color, orden)
- Formulario de deals con campos: valor, probabilidad, fecha estimada de cierre
- Mover deals entre etapas arrastrando o editando

### Tareas
- Creación, edición y completar/descompletar
- Filtros por estado (pendientes/completadas/todas) y prioridad
- Asignación a usuarios del equipo
- Vinculación opcional a contacto/deal
- Recordatorios diarios por email (cron job)

### Dashboard
- KPIs: contactos totales, deals activos, valor pipeline, tasa de conversión
- Funnel de ventas por etapa
- Timeline de actividad reciente
- Tareas pendientes para hoy

### Configuración
- Perfil de usuario (nombre, email, avatar)
- Datos de organización (nombre, teléfono, sitio web)
- Gestión de equipo (invitar miembros, asignar roles admin/member)
- Personalización de etapas del pipeline
- Gestión de suscripción (ver plan, cambiar, portal Stripe)

### Onboarding y Trial
- Banner de trial persistente con 3 niveles de severidad (info/warning/danger)
- Tour de bienvenida de 4 pasos (con persistencia en localStorage)
- Bloqueo de escritura cuando el trial expira o la suscripción se cancela
- Componentes `SubscriptionGate`, `UpgradeWall`, `WriteGuard`

### Pagos (Stripe)
- Checkout Sessions para planes Basic (14,99€/mes) y Pro (29,99€/mes)
- Webhook para sincronizar estado de suscripción con la base de datos
- Portal de facturación de Stripe (cambiar plan, cancelar, ver facturas)

### Emails
- Email de bienvenida al registrarse
- Avisos de expiración de trial (7 días y 1 día antes)
- Recordatorios diarios de tareas pendientes/vencidas

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
│   │   ├── middleware/     # Auth, tenant, rate limit, validation
│   │   ├── services/       # Lógica de negocio (stripe, email, contactos…)
│   │   ├── utils/          # Helpers (response)
│   │   └── validators/     # Schemas Zod
│   ├── auth/               # Endpoints autenticación (me.js, callback)
│   ├── contacts/           # CRUD + CSV import/export
│   ├── deals/              # CRUD deals + stage updates
│   ├── tasks/              # CRUD tareas + toggle completar
│   ├── activities/         # Timeline actividades
│   ├── dashboard/          # Estadísticas agregadas
│   ├── organization/       # Gestión org + miembros
│   ├── pipeline/           # Etapas pipeline (GET/PUT)
│   ├── stripe/             # Checkout, webhook, portal
│   ├── cron/               # trial-warnings, task-reminders
│   ├── tags/               # Gestión etiquetas
│   └── me.js               # Perfil de usuario
├── src/                    # Frontend React
│   ├── components/
│   │   ├── ui/             # Button, Card, Input, Badge, Modal, Drawer, etc.
│   │   ├── layout/         # AppLayout, Sidebar, Header, BottomNav
│   │   ├── contacts/       # ContactForm, ContactCard, ContactFilters, TagBadge
│   │   ├── pipeline/       # PipelineBoard, PipelineColumn, DealCard, DealForm
│   │   ├── tasks/          # TaskForm
│   │   ├── dashboard/      # KpiCard
│   │   ├── settings/       # Profile, Organization, Team, Pipeline, Subscription
│   │   └── onboarding/     # TrialBanner, WelcomeTour, SubscriptionGate
│   ├── hooks/              # useContacts, useDeals, useTasks, useStripe, etc.
│   ├── stores/             # filtersStore, uiStore (Zustand)
│   ├── pages/              # 8 páginas: Dashboard, Contacts, Pipeline, Tasks, Settings…
│   ├── routes/             # AppRouter (React Router v6)
│   ├── lib/                # API client, formatters, auth0 config, constants
│   ├── styles/             # CSS tokens, tipografía
│   └── test/               # Test setup
├── scripts/                # migrate.js, seed.js
├── public/                 # Assets estáticos
└── Docs/                   # Documentación funcional, técnica, plan de trabajo
```

## Variables de entorno

| Variable | Capa | Descripción |
|----------|------|-------------|
| `TURSO_DATABASE_URL` | Backend | URL de la base de datos Turso |
| `TURSO_AUTH_TOKEN` | Backend | Token de autenticación Turso |
| `AUTH0_DOMAIN` | Backend | Dominio Auth0 (ej. `xxx.eu.auth0.com`) |
| `AUTH0_AUDIENCE` | Backend | Audience/API identifier en Auth0 |
| `VITE_AUTH0_DOMAIN` | Frontend | Dominio Auth0 (mismo valor) |
| `VITE_AUTH0_CLIENT_ID` | Frontend | Client ID de la aplicación SPA en Auth0 |
| `VITE_AUTH0_AUDIENCE` | Frontend | Audience Auth0 (mismo valor) |
| `VITE_AUTH0_BYPASS` | Frontend | `true` para bypass en desarrollo local |
| `STRIPE_SECRET_KEY` | Backend | Clave secreta de Stripe |
| `STRIPE_PRICE_BASIC` | Backend | ID del precio Basic en Stripe (ej. `price_xxx`) |
| `STRIPE_PRICE_PRO` | Backend | ID del precio Pro en Stripe (ej. `price_xxx`) |
| `STRIPE_WEBHOOK_SECRET` | Backend | Secret del webhook endpoint de Stripe |
| `GMAIL_USER` | Backend | Email de Gmail para envío SMTP |
| `GMAIL_APP_PASSWORD` | Backend | App Password de Gmail (16 caracteres) |
| `CRON_SECRET` | Backend | Secret para autenticar cron jobs de Vercel |
| `APP_URL` | Backend | URL base de producción (ej. `https://clicapt-crm.vercel.app`) |

Consulta `.env.example` para la lista completa. Las variables con prefijo `VITE_` están disponibles en el frontend.

## API Endpoints

Todos los endpoints (excepto webhook y cron) requieren `Authorization: Bearer <token>` de Auth0.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/me` | Perfil del usuario actual |
| PUT | `/api/me` | Actualizar perfil |
| POST | `/api/auth/callback` | Provisionar org/usuario tras login |
| GET | `/api/contacts` | Listar contactos (con filtros) |
| POST | `/api/contacts` | Crear contacto |
| GET | `/api/contacts/[id]` | Detalle de contacto |
| PUT | `/api/contacts/[id]` | Actualizar contacto |
| DELETE | `/api/contacts/[id]` | Eliminar contacto |
| GET | `/api/contacts/export` | Exportar contactos a CSV |
| POST | `/api/contacts/import` | Importar contactos desde CSV |
| GET | `/api/deals` | Listar deals |
| POST | `/api/deals` | Crear deal |
| GET | `/api/deals/[id]` | Detalle de deal |
| PUT | `/api/deals/[id]` | Actualizar deal |
| PATCH | `/api/deals/[id]` | Mover deal de etapa |
| DELETE | `/api/deals/[id]` | Eliminar deal |
| GET | `/api/tasks` | Listar tareas |
| POST | `/api/tasks` | Crear tarea |
| PUT | `/api/tasks/[id]` | Actualizar tarea |
| PATCH | `/api/tasks/[id]` | Toggle completar tarea |
| GET | `/api/activities` | Listar actividades |
| POST | `/api/activities` | Crear actividad |
| GET | `/api/tags` | Listar etiquetas |
| POST | `/api/tags` | Crear etiqueta |
| GET | `/api/pipeline/stages` | Listar etapas pipeline |
| PUT | `/api/pipeline/stages` | Reordenar/actualizar etapas |
| GET | `/api/dashboard` | KPIs y estadísticas |
| GET | `/api/organization` | Info organización |
| PUT | `/api/organization` | Actualizar organización |
| GET | `/api/organization/members` | Listar miembros |
| POST | `/api/organization/members` | Invitar miembro |
| POST | `/api/stripe/create-checkout` | Crear sesión de checkout Stripe |
| POST | `/api/stripe/portal` | Crear sesión del portal Stripe |
| POST | `/api/stripe/webhook` | Webhook de Stripe (sin auth) |
| GET | `/api/cron/trial-warnings` | Enviar avisos de trial (cron) |
| GET | `/api/cron/task-reminders` | Enviar recordatorios de tareas (cron) |
| GET | `/api/health` | Health check |

## Despliegue

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

Configura las variables de entorno en el dashboard de Vercel antes del primer despliegue.

### Configuración de Stripe (producción)

1. Crear dos productos en Stripe Dashboard (Básico y Pro) con precios recurrentes mensuales
2. Copiar los `price_id` a las variables `STRIPE_PRICE_BASIC` y `STRIPE_PRICE_PRO`
3. Crear un webhook endpoint apuntando a `https://<tu-dominio>/api/stripe/webhook`
4. Habilitar eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
5. Copiar el webhook secret a `STRIPE_WEBHOOK_SECRET`

### Configuración de Cron Jobs

Los cron jobs se configuran en `vercel.json`:
- **trial-warnings**: Se ejecuta diariamente a las 09:00 UTC
- **task-reminders**: Se ejecuta diariamente a las 08:00 UTC

Requiere la variable `CRON_SECRET` configurada en Vercel.

## Documentación

- [Documentación funcional](Docs/DocumentacionFuncional.md)
- [Documentación técnica](Docs/DocumentacionTecnica.md)
- [Guía de estilos](Docs/GuiaDeEstilos.md)
- [Plan de trabajo](Docs/PlanDeTrabajo.md)
- [Contratos de API](Docs/Contratos.md)

## Licencia

Propietario — Todos los derechos reservados.
