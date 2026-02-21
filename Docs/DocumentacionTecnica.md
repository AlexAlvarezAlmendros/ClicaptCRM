

# 📐 Documentación Técnica — LeadFlow CRM

---

## 1. Visión Técnica General

### 1.1 Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────────┐
│                      STACK LEADFLOW CRM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FRONTEND          BACKEND            INFRAESTRUCTURA           │
│  ─────────         ────────           ───────────────           │
│  React 18+         Node.js 20+       Vercel (hosting)           │
│  Vite              Express.js        Turso (SQLite edge DB)     │
│  React Router v6   API REST          Auth0 (autenticación)      │
│  TanStack Query    Nodemailer        Stripe (pagos)             │
��  Zustand           + Gmail SMTP      Gmail SMTP (emails)        │
│  Tailwind CSS      libSQL client     Vercel Cron (jobs)         │
│  dnd-kit           Zod (validación)                             │
│  Recharts          helmet, cors,                                │
│                    rate-limit                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Decisiones Arquitectónicas Clave

| Decisión | Justificación |
|---|---|
| **Monolito** | Simplicidad para MVP. Un solo repo, un solo despliegue. Separación lógica front/back. |
| **Turso (libSQL)** | Base de datos edge, réplicas globales, compatible SQLite, tier gratuito generoso, ideal para Vercel. |
| **Auth0** | Autenticación delegada, segura, con soporte social login futuro. Evita implementar auth desde cero. |
| **Nodemailer + Gmail** | Coste cero para MVP. Límite de ~500 emails/día suficiente para arrancar. Migrable a SendGrid/Resend en el futuro. |
| **Stripe** | Estándar de la industria para suscripciones SaaS. SDK excelente, webhooks fiables. |
| **Vercel** | Despliegue automático desde GitHub, serverless functions para el backend, edge network global. |

---

## 2. Arquitectura del Sistema

### 2.1 Diagrama de Arquitectura General

```
                         ┌─────────────┐
                         │   USUARIO   │
                         │  (Browser)  │
                         └──────┬──────┘
                                │ HTTPS
                                ▼
                    ┌───────────────────────┐
                    │       VERCEL          │
                    │   (Edge Network)      │
                    ├───────────���───────────┤
                    │  FRONTEND │  BACKEND  │
                    │  (Static) │(Serverless│
                    │  React    │Functions) │
                    │  SPA      │ /api/*    │
                    └─────┬─────┴─────┬─────┘
                          │           │
              ┌───────────┘           └───────────┐
              │                                   │
              ▼                                   ▼
     ┌─────────────────┐                ┌──────────────────┐
     │     AUTH0        │                │      TURSO       │
     │  (Autenticación) │                │  (Base de Datos)  │
     │                 │                │   libSQL edge     │
     │ • Login/Signup  │                │                  │
     │ • JWT tokens    │                │  Primary (región) │
     │ • User mgmt     │                │  + Replicas edge  │
     └──────────────���──┘                └──────────────────┘
              │                                   │
              │           ┌───────────────────┐   │
              │           │     STRIPE        │   │
              │           │  (Pagos/Suscripc.)│   │
              │           │                   │   │
              │           │ • Checkout        │   │
              │           │ • Webhooks        │   │
              │           │ • Customer Portal │   │
              │           └───────────────────┘   │
              │                                   │
              │           ┌───────────────────┐   │
              │           │   GMAIL SMTP      │   │
              │           │  (Nodemailer)     │   │
              │           │                   │   │
              │           │ • Verificación    │   │
              │           │ • Recordatorios   │   │
              │           │ • Trial warnings  │   │
              │           └───────────────────┘   │
              │                                   │
```

### 2.2 Flujo de una Petición Típica

```
1. Usuario interactúa con React SPA
2. React hace fetch a /api/contacts (con Bearer token JWT de Auth0)
3. Vercel Serverless Function recibe la petición
4. Middleware verifica JWT con Auth0 JWKS
5. Middleware extrae tenant_id (organización) del token
6. Handler ejecuta query contra Turso (libSQL)
7. Respuesta JSON al frontend
8. React actualiza UI (TanStack Query cache)

Tiempo total objetivo: < 300ms
```

---

## 3. Estructura del Proyecto (Monolito)

```
leadflow-crm/
├── 📁 api/                          # Backend — Vercel Serverless Functions
│   ├── 📁 _lib/                     # Código compartido del backend
│   │   ├── 📁 db/
│   │   │   ├── client.js            # Conexión Turso (libSQL)
│   │   │   ├── schema.sql           # Schema completo DDL
│   │   │   └── migrations/          # Migraciones SQL ordenadas
│   │   │       ├── 001_initial.sql
│   │   │       ├── 002_pipeline.sql
│   │   │       └── ...
│   │   ├── 📁 middleware/
│   │   │   ├── auth.js              # Verificación JWT Auth0
│   │   │   ├── tenant.js            # Extracción y validación tenant
│   │   │   ├── rateLimit.js         # Rate limiting
│   │   │   ├── validate.js          # Validación con Zod
│   │   │   └── errorHandler.js      # Manejo centralizado de errores
│   │   ├── 📁 services/
│   │   │   ├── contactService.js    # Lógica de negocio: contactos
│   │   │   ├── dealService.js       # Lógica de negocio: oportunidades
│   │   │   ├── taskService.js       # Lógica de negocio: tareas
│   │   │   ├── activityService.js   # Lógica de negocio: actividades
│   │   │   ├── dashboardService.js  # Lógica de negocio: métricas
│   │   │   ├── emailService.js      # Envío de emails (Nodemailer)
│   │   │   └── stripeService.js     # Lógica de Stripe
│   │   ├── 📁 validators/
│   │   │   ├── contact.js           # Schemas Zod para contactos
│   │   │   ├── deal.js              # Schemas Zod para oportunidades
│   │   │   └── task.js              # Schemas Zod para tareas
│   │   ├── 📁 utils/
│   │   │   ├── response.js          # Helpers de respuesta HTTP
│   │   │   ├── pagination.js        # Utilidades de paginación
│   │   │   └── constants.js         # Constantes globales
│   │   └── config.js                # Variables de entorno centralizadas
│   │
│   ├── 📁 contacts/
│   │   ├── index.js                 # GET /api/contacts (listar)
│   │   │                            # POST /api/contacts (crear)
│   │   └── [id].js                  # GET /api/contacts/:id
│   │                                # PUT /api/contacts/:id
│   │                                # DELETE /api/contacts/:id
│   ├── 📁 deals/
│   │   ├── index.js                 # GET, POST /api/deals
│   │   └── [id].js                  # GET, PUT, DELETE /api/deals/:id
│   │
│   ├── 📁 tasks/
│   │   ├── index.js                 # GET, POST /api/tasks
│   │   └── [id].js                  # GET, PUT, DELETE /api/tasks/:id
│   │
│   ├── 📁 activities/
│   │   └── index.js                 # GET, POST /api/activities
│   │
│   ├── 📁 dashboard/
│   │   └── index.js                 # GET /api/dashboard/stats
│   │
│   ├── 📁 pipeline/
│   │   └── stages.js                # GET, PUT /api/pipeline/stages
│   │
│   ├── 📁 organization/
│   │   ├── index.js                 # GET, PUT /api/organization
│   │   └── members.js               # GET, POST, DELETE miembros
│   │
│   ├── 📁 stripe/
│   │   ├── create-checkout.js       # POST crear sesión Stripe Checkout
│   │   ├── webhook.js               # POST webhook de Stripe
│   │   └── portal.js                # POST crear sesión Customer Portal
│   │
│   ├── 📁 auth/
│   │   ├── callback.js              # POST post-login hook (sync user)
│   │   └── me.js                    # GET /api/auth/me (perfil actual)
│   │
│   └── 📁 cron/
│       ├── trial-warnings.js        # Cron: avisos fin de trial
│       └── task-reminders.js        # Cron: recordatorios de tareas
│
├── 📁 src/                          # Frontend — React SPA
│   ├── 📁 assets/
│   │   ├── logo.svg
│   │   └── illustrations/
│   │
│   ├── 📁 components/
│   │   ├── 📁 ui/                   # Componentes base reutilizables
│   │   │   ��── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Drawer.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   └── index.js             # Re-exports
│   │   │
│   │   ├── 📁 layout/
│   │   │   ├── AppLayout.jsx        # Layout principal (sidebar + content)
│   │   │   ├── Sidebar.jsx          # Navegación lateral (desktop)
│   │   │   ├── BottomNav.jsx        # Navegación inferior (móvil)
│   │   │   ├── Header.jsx           # Barra superior con usuario
│   │   │   └── ProtectedRoute.jsx   # Wrapper auth
│   │   │
│   │   ├── 📁 contacts/
│   │   │   ├── ContactList.jsx
│   │   │   ├── ContactCard.jsx      # Tarjeta en vista móvil
│   │   │   ├── ContactDetail.jsx
│   │   │   ├── ContactForm.jsx
│   │   │   ├── ContactFilters.jsx
│   │   │   └── TagBadge.jsx
│   │   │
│   │   ├── 📁 pipeline/
│   │   │   ├── PipelineBoard.jsx    # Tablero Kanban completo
│   │   │   ├── PipelineColumn.jsx   # Columna del Kanban
│   │   │   ├── DealCard.jsx         # Tarjeta de oportunidad
│   │   │   ├── DealDetail.jsx       # Modal/Drawer detalle
│   │   │   ├── DealForm.jsx
│   │   │   └── PipelineAccordion.jsx # Vista móvil alternativa
│   │   │
│   │   ├── 📁 tasks/
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskItem.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── TaskFilters.jsx
│   │   │
│   │   ├── 📁 dashboard/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── KpiCard.jsx
│   │   │   ├── FunnelChart.jsx
│   │   │   ├── RecentActivity.jsx
│   │   │   └── TodayTasks.jsx
│   │   │
│   │   ├── 📁 settings/
│   │   │   ├── ProfileSettings.jsx
│   │   │   ├── OrganizationSettings.jsx
│   │   │   ├── PipelineSettings.jsx
│   │   │   ├── TeamSettings.jsx
│   │   │   └── SubscriptionSettings.jsx
│   │   │
│   │   └── 📁 onboarding/
│   │       ├── WelcomeTour.jsx
│   │       └── TrialBanner.jsx
│   │
│   ├── 📁 hooks/
│   │   ├── useContacts.js           # TanStack Query hooks para contactos
│   │   ├── useDeals.js
│   │   ├── useTasks.js
│   │   ├── useActivities.js
│   │   ├── useDashboard.js
│   │   ├── useOrganization.js
│   │   ├── useMediaQuery.js         # Responsive breakpoints
│   │   └── useDebounce.js           # Debounce para búsqueda
│   │
│   ├── 📁 stores/
│   │   ├── uiStore.js               # Zustand: estado UI (sidebar, modals)
│   │   └── filtersStore.js          # Zustand: filtros activos
│   │
│   ├── 📁 lib/
│   │   ├── api.js                   # Cliente HTTP (fetch wrapper + auth)
│   │   ├── auth0.js                 # Configuración Auth0 React SDK
│   │   ├── formatters.js            # Formateo fechas, moneda, etc.
│   │   ├── constants.js             # Constantes del frontend
│   │   └── utils.js                 # Utilidades generales (cn, etc.)
│   │
│   ├── 📁 pages/
│   │   ├── LoginPage.jsx
│   │   ├── CallbackPage.jsx         # Auth0 redirect callback
│   │   ├── DashboardPage.jsx
│   │   ├── ContactsPage.jsx
│   │   ├── ContactDetailPage.jsx
│   │   ├── PipelinePage.jsx
│   │   ├── TasksPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── NotFoundPage.jsx
│   │
│   ├── 📁 routes/
│   │   └── AppRouter.jsx            # Definición de rutas
│   │
│   ├── App.jsx                      # Root component
│   ├── main.jsx                     # Entry point (Vite)
│   └── index.css                    # Tailwind directives + globals
│
├── 📁 public/
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
│
├── 📁 scripts/
│   ├── seed.js                      # Datos de prueba para desarrollo
│   └── migrate.js                   # Ejecutar migraciones en Turso
│
├── .env.example                     # Variables de entorno (plantilla)
├── .env.local                       # Variables de entorno (local, gitignored)
├── .gitignore
├── vercel.json                      # Configuración Vercel
├── vite.config.js                   # Configuración Vite
├── tailwind.config.js               # Configuración Tailwind
├── postcss.config.js
├── package.json
├── package-lock.json
└── README.md
```

---

## 4. Base de Datos — Turso (libSQL)

### 4.1 Configuración de Turso

```javascript name=api/_lib/db/client.js
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,       // libsql://leadflow-xxxx.turso.io
  authToken: process.env.TURSO_AUTH_TOKEN,    // Token de autenticación
});

export default db;
```

### 4.2 Schema Completo (DDL)

```sql name=api/_lib/db/schema.sql
-- ============================================
-- LEADFLOW CRM — Database Schema (Turso/SQLite)
-- ============================================

-- Activar foreign keys (SQLite)
PRAGMA foreign_keys = ON;

-- ─────────────────────────────────────────────
-- ORGANIZACIONES (Tenants)
-- ─────────────────────────────────────────────
CREATE TABLE organizations (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name              TEXT NOT NULL,
    logo_url          TEXT,
    fiscal_name       TEXT,
    fiscal_id         TEXT,           -- CIF/NIF
    address           TEXT,
    city              TEXT,
    postal_code       TEXT,
    country           TEXT DEFAULT 'España',

    -- Suscripción
    stripe_customer_id    TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    plan              TEXT DEFAULT 'trial' CHECK (plan IN ('trial', 'basic', 'pro', 'cancelled')),
    trial_ends_at     DATETIME,
    subscription_status TEXT DEFAULT 'trialing' CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'cancelled', 'expired')),

    created_at        DATETIME DEFAULT (datetime('now')),
    updated_at        DATETIME DEFAULT (datetime('now'))
);

-- ────────────────────��────────────────────────
-- USUARIOS
-- ─────────────────────────────────────────────
CREATE TABLE users (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    auth0_id          TEXT UNIQUE NOT NULL,     -- sub de Auth0 (auth0|xxx)
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    email             TEXT NOT NULL,
    name              TEXT NOT NULL,
    surname           TEXT,
    avatar_url        TEXT,
    role              TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active         BOOLEAN DEFAULT 1,

    created_at        DATETIME DEFAULT (datetime('now')),
    updated_at        DATETIME DEFAULT (datetime('now')),

    UNIQUE(email, organization_id)
);

CREATE INDEX idx_users_auth0 ON users(auth0_id);
CREATE INDEX idx_users_org ON users(organization_id);

-- ─────────────────────────────────────────────
-- CONTACTOS
-- ─────────────────────────────────────────────
CREATE TABLE contacts (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    name              TEXT NOT NULL,
    surname           TEXT,
    company           TEXT,
    job_title         TEXT,
    email             TEXT,
    phone             TEXT,
    address           TEXT,
    city              TEXT,
    postal_code       TEXT,
    country           TEXT DEFAULT 'España',
    source            TEXT DEFAULT 'other' CHECK (source IN ('web', 'referral', 'cold_call', 'event', 'linkedin', 'other')),
    status            TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'customer', 'lost')),
    notes             TEXT,
    assigned_to       TEXT REFERENCES users(id),
    created_by        TEXT NOT NULL REFERENCES users(id),

    is_deleted        BOOLEAN DEFAULT 0,
    deleted_at        DATETIME,
    created_at        DATETIME DEFAULT (datetime('now')),
    updated_at        DATETIME DEFAULT (datetime('now')),

    UNIQUE(email, organization_id)
);

CREATE INDEX idx_contacts_org ON contacts(organization_id);
CREATE INDEX idx_contacts_status ON contacts(organization_id, status);
CREATE INDEX idx_contacts_deleted ON contacts(organization_id, is_deleted);
CREATE INDEX idx_contacts_search ON contacts(organization_id, name, surname, company);

-- ─────────────────────────────────────────────
-- TAGS Y RELACIÓN CON CONTACTOS
-- ─────────────────────────────────────────────
CREATE TABLE tags (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    name              TEXT NOT NULL,
    color             TEXT DEFAULT '#6B7280',  -- gray-500

    created_at        DATETIME DEFAULT (datetime('now')),

    UNIQUE(name, organization_id)
);

CREATE TABLE contact_tags (
    contact_id        TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    tag_id            TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (contact_id, tag_id)
);

-- ─────────────────────────────────────────────
-- ETAPAS DEL PIPELINE
-- ─────────────────────────────────────────────
CREATE TABLE pipeline_stages (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    name              TEXT NOT NULL,
    color             TEXT NOT NULL DEFAULT '#3B82F6',
    probability       INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
    position          INTEGER NOT NULL,         -- Orden de la etapa
    is_won            BOOLEAN DEFAULT 0,        -- ¿Es etapa de cierre ganado?
    is_lost           BOOLEAN DEFAULT 0,        -- ¿Es etapa de cierre perdido?

    created_at        DATETIME DEFAULT (datetime('now')),

    UNIQUE(name, organization_id)
);

-- ─────────────────────────────────────────────
-- OPORTUNIDADES (DEALS)
-- ─────────────────────────────────────────────
CREATE TABLE deals (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    contact_id        TEXT NOT NULL REFERENCES contacts(id),
    stage_id          TEXT NOT NULL REFERENCES pipeline_stages(id),
    title             TEXT NOT NULL,
    value             REAL DEFAULT 0,            -- Valor en €
    probability       INTEGER,                   -- Hereda de stage o manual
    expected_close    DATE,
    actual_close      DATE,
    loss_reason       TEXT,
    notes             TEXT,
    assigned_to       TEXT REFERENCES users(id),
    created_by        TEXT NOT NULL REFERENCES users(id),
    position          INTEGER DEFAULT 0,          -- Orden dentro de la columna

    is_archived       BOOLEAN DEFAULT 0,
    created_at        DATETIME DEFAULT (datetime('now')),
    updated_at        DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX idx_deals_org ON deals(organization_id);
CREATE INDEX idx_deals_stage ON deals(organization_id, stage_id);
CREATE INDEX idx_deals_contact ON deals(contact_id);

-- ─────────────────────────────────────────────
-- ACTIVIDADES (Historial)
-- ─────────────────────────────────────────────
CREATE TABLE activities (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    contact_id        TEXT REFERENCES contacts(id),
    deal_id           TEXT REFERENCES deals(id),
    type              TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'task_completed', 'stage_change', 'deal_created', 'deal_won', 'deal_lost')),
    description       TEXT,
    metadata          TEXT,                        -- JSON extra si se necesita
    created_by        TEXT NOT NULL REFERENCES users(id),

    created_at        DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX idx_activities_contact ON activities(contact_id, created_at DESC);
CREATE INDEX idx_activities_deal ON activities(deal_id, created_at DESC);
CREATE INDEX idx_activities_org ON activities(organization_id, created_at DESC);

-- ─────────────────────────────────────────────
-- TAREAS
-- ─────────────────────────────────────────────
CREATE TABLE tasks (
    id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id   TEXT NOT NULL REFERENCES organizations(id),
    contact_id        TEXT REFERENCES contacts(id),
    deal_id           TEXT REFERENCES deals(id),
    title             TEXT NOT NULL,
    description       TEXT,
    due_date          DATE,
    priority          TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    is_completed      BOOLEAN DEFAULT 0,
    completed_at      DATETIME,
    assigned_to       TEXT REFERENCES users(id),
    created_by        TEXT NOT NULL REFERENCES users(id),

    created_at        DATETIME DEFAULT (datetime('now')),
    updated_at        DATETIME DEFAULT (datetime('now'))
);

CREATE INDEX idx_tasks_org ON tasks(organization_id, is_completed);
CREATE INDEX idx_tasks_user ON tasks(assigned_to, is_completed, due_date);
CREATE INDEX idx_tasks_due ON tasks(organization_id, due_date);
```

### 4.3 Datos Iniciales (Seed de Pipeline)

```sql name=api/_lib/db/migrations/001_seed_stages.sql
-- Se ejecuta al crear una nueva organización
-- Insertado dinámicamente desde el servicio, aquí como referencia:

-- INSERT INTO pipeline_stages (organization_id, name, color, probability, position, is_won, is_lost) VALUES
-- (:org_id, 'Nuevo Lead',        '#3B82F6', 10,  1, 0, 0),
-- (:org_id, 'Contactado',        '#8B5CF6', 25,  2, 0, 0),
-- (:org_id, 'Propuesta Enviada', '#F59E0B', 50,  3, 0, 0),
-- (:org_id, 'Negociación',       '#F97316', 75,  4, 0, 0),
-- (:org_id, 'Ganado',            '#10B981', 100, 5, 1, 0),
-- (:org_id, 'Perdido',           '#EF4444', 0,   6, 0, 1);
```

---

## 5. API REST — Diseño de Endpoints

### 5.1 Convenciones Generales

| Aspecto | Convención |
|---|---|
| **Base URL** | `https://leadflow.vercel.app/api` |
| **Formato** | JSON (`Content-Type: application/json`) |
| **Autenticación** | Bearer token JWT (Auth0) en header `Authorization` |
| **Tenant** | Extraído del JWT (claim personalizado `org_id`). Nunca en la URL. |
| **Paginación** | Query params `?page=1&limit=25` → Response header `X-Total-Count` |
| **Ordenación** | `?sort=created_at&order=desc` |
| **Errores** | Formato consistente: `{ error: { code, message, details? } }` |
| **Soft delete** | DELETE marca `is_deleted=1`. No borra físicamente. |
| **Timestamps** | ISO 8601 (`2026-02-21T10:30:00Z`) |

### 5.2 Tabla de Endpoints

```
AUTENTICACIÓN & USUARIO
────────────────────────────────────────────────────────────────
POST   /api/auth/callback          Sync usuario Auth0 → DB local
GET    /api/auth/me                Perfil del usuario actual

CONTACTOS
────────────────────────────────────────────────────────────────
GET    /api/contacts               Listar contactos (paginado, filtrable)
POST   /api/contacts               Crear contacto
GET    /api/contacts/:id           Obtener detalle de contacto
PUT    /api/contacts/:id           Actualizar contacto
DELETE /api/contacts/:id           Eliminar contacto (soft delete)
POST   /api/contacts/import        Importar CSV
GET    /api/contacts/export        Exportar CSV

OPORTUNIDADES (DEALS)
────────────────────────────────────────────────────────────────
GET    /api/deals                  Listar oportunidades (pipeline view)
POST   /api/deals                  Crear oportunidad
GET    /api/deals/:id              Obtener detalle
PUT    /api/deals/:id              Actualizar oportunidad
DELETE /api/deals/:id              Archivar oportunidad
PATCH  /api/deals/:id/stage        Mover de etapa (drag & drop)
PATCH  /api/deals/:id/reorder      Reordenar dentro de columna

PIPELINE
────────────────────────────────────────────────────────────────
GET    /api/pipeline/stages        Obtener etapas configuradas
PUT    /api/pipeline/stages        Actualizar etapas (admin)

TAREAS
────────────────────────────────────────────────────────────────
GET    /api/tasks                  Listar tareas (filtrable)
POST   /api/tasks                  Crear tarea
GET    /api/tasks/:id              Obtener detalle
PUT    /api/tasks/:id              Actualizar tarea
PATCH  /api/tasks/:id/complete     Marcar como completada
DELETE /api/tasks/:id              Eliminar tarea

ACTIVIDADES
────────────────────────────────────────────────────────────────
GET    /api/activities             Listar actividades (por contacto/deal)
POST   /api/activities             Registrar actividad

DASHBOARD
──────────────────────────────────────���─────────────────────────
GET    /api/dashboard/stats        KPIs y métricas (con filtro de fechas)

ORGANIZACIÓN
────────────────────────────────────────────────────────────────
GET    /api/organization           Datos de la organización
PUT    /api/organization           Actualizar datos
GET    /api/organization/members   Listar miembros
POST   /api/organization/members   Invitar miembro (email)
DELETE /api/organization/members/:id  Eliminar miembro

TAGS
────────────────────────────────────────────────────────────────
GET    /api/tags                   Listar tags de la organización
POST   /api/tags                   Crear tag
DELETE /api/tags/:id               Eliminar tag

STRIPE (PAGOS)
────────────────────────────────────────────────────────────────
POST   /api/stripe/create-checkout Crear sesión de Stripe Checkout
POST   /api/stripe/portal          Crear sesión Customer Portal
POST   /api/stripe/webhook         Webhook de Stripe (no autenticado con JWT)

CRON JOBS (Vercel Cron)
────────────────────────────────────────────────────────────────
GET    /api/cron/trial-warnings    Enviar avisos de fin de trial
GET    /api/cron/task-reminders    Enviar recordatorios de tareas
```

### 5.3 Ejemplos de Request/Response

#### Crear Contacto

```
POST /api/contacts
Authorization: Bearer eyJhbGciOi...

{
  "name": "Carlos",
  "surname": "García López",
  "company": "Distribuciones García S.L.",
  "job_title": "Director Comercial",
  "email": "carlos@distgarcia.es",
  "phone": "+34 612 345 678",
  "city": "Valencia",
  "postal_code": "46001",
  "source": "referral",
  "tags": ["distribuidor", "valencia"],
  "notes": "Contacto referido por Marta Sánchez"
}
```

```
201 Created

{
  "data": {
    "id": "a1b2c3d4e5f6...",
    "name": "Carlos",
    "surname": "García López",
    "company": "Distribuciones García S.L.",
    "job_title": "Director Comercial",
    "email": "carlos@distgarcia.es",
    "phone": "+34 612 345 678",
    "city": "Valencia",
    "postal_code": "46001",
    "country": "España",
    "source": "referral",
    "status": "new",
    "tags": [
      { "id": "t1", "name": "distribuidor", "color": "#3B82F6" },
      { "id": "t2", "name": "valencia", "color": "#10B981" }
    ],
    "notes": "Contacto referido por Marta Sánchez",
    "assigned_to": null,
    "created_by": { "id": "u1", "name": "Alex" },
    "created_at": "2026-02-21T10:30:00Z",
    "updated_at": "2026-02-21T10:30:00Z"
  }
}
```

#### Mover Deal de Etapa (Drag & Drop)

```
PATCH /api/deals/d1a2b3/stage
Authorization: Bearer eyJhbGciOi...

{
  "stage_id": "stage_negociacion_id",
  "position": 2
}
```

```
200 OK

{
  "data": {
    "id": "d1a2b3",
    "title": "Contrato anual distribución",
    "stage_id": "stage_negociacion_id",
    "stage_name": "Negociación",
    "position": 2,
    "updated_at": "2026-02-21T11:00:00Z"
  }
}
```

#### Formato de Error Estándar

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Error de validación en los datos enviados",
    "details": [
      { "field": "email", "message": "El formato del email no es válido" },
      { "field": "name", "message": "El nombre es obligatorio" }
    ]
  }
}
```

### 5.4 Códigos de Error

| Código HTTP | Code | Uso |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Datos de entrada inválidos |
| 401 | `UNAUTHORIZED` | Token ausente o inválido |
| 403 | `FORBIDDEN` | Sin permisos (rol insuficiente o trial expirado) |
| 404 | `NOT_FOUND` | Recurso no encontrado |
| 409 | `CONFLICT` | Recurso duplicado (ej: email ya existe) |
| 429 | `RATE_LIMITED` | Demasiadas peticiones |
| 500 | `INTERNAL_ERROR` | Error del servidor |

---

## 6. Autenticación — Auth0

### 6.1 Arquitectura de Autenticación

```
┌─────────────┐       ┌──────────┐       ┌──────────────────┐
│  React SPA  │──────►│  AUTH0   │──────►│  Auth0 Universal │
│             │redirect│          │       │  Login Page      │
│             │       │          │       │  (hosted)        │
│             │◄──────│          │◄──────│                  │
│             │callback│          │       └──────────────────┘
│             │+ code │          │
│             │       │  Token   │
│             │◄──────│  (JWT)   │
│             │       │          │
│  Stores JWT │       └──────────┘
│  in memory  │
│             │       ┌──────────────────┐
│  API calls  │──────►│  Vercel API      │
│  + Bearer   │       │  Functions       │
│  token      │       │                  │
│             │       │  Verifies JWT    │
│             │◄──────│  with JWKS       │
│             │  data │                  │
└─────────────┘       └──────────────────┘
```

### 6.2 Configuración Auth0

```
AUTH0 TENANT CONFIG
─────────────────────────────────────────
Application Type:      Single Page Application
Allowed Callback URLs: https://leadflow.vercel.app/callback,
                       http://localhost:5173/callback
Allowed Logout URLs:   https://leadflow.vercel.app,
                       http://localhost:5173
Allowed Origins:       https://leadflow.vercel.app,
                       http://localhost:5173
API Identifier:        https://api.leadflow.app
Token Expiration:      86400 (24h)
```

### 6.3 Configuración Frontend (Auth0 React SDK)

```javascript name=src/lib/auth0.js
// Configuración del Auth0Provider
export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,           // leadflow.eu.auth0.com
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,      // xxxxxxxxxxxxxx
  authorizationParams: {
    redirect_uri: window.location.origin + "/callback",
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,     // https://api.leadflow.app
    scope: "openid profile email",
  },
  cacheLocation: "localstorage",    // Persistir sesión entre recargas
};
```

```jsx name=src/App.jsx
import { Auth0Provider } from "@auth0/auth0-react";
import { auth0Config } from "./lib/auth0";
import { AppRouter } from "./routes/AppRouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,      // 2 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <Auth0Provider {...auth0Config}>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
      </QueryClientProvider>
    </Auth0Provider>
  );
}
```

### 6.4 Middleware de Verificación JWT (Backend)

```javascript name=api/_lib/middleware/auth.js
import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS = createRemoteJWKSet(
  new URL(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`)
);

export async function verifyAuth(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw { status: 401, code: "UNAUTHORIZED", message: "Token no proporcionado" };
  }

  const token = authHeader.split(" ")[1];

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      audience: process.env.AUTH0_AUDIENCE,
    });

    return {
      auth0Id: payload.sub,
      email: payload.email,
      permissions: payload.permissions || [],
    };
  } catch (err) {
    throw { status: 401, code: "UNAUTHORIZED", message: "Token inválido o expirado" };
  }
}
```

### 6.5 Middleware de Tenant (Multi-tenancy)

```javascript name=api/_lib/middleware/tenant.js
import db from "../db/client.js";

export async function resolveTenant(auth0Id) {
  const result = await db.execute({
    sql: `SELECT u.id as user_id, u.role, u.organization_id, u.name, u.email,
                 o.plan, o.subscription_status, o.trial_ends_at
          FROM users u
          JOIN organizations o ON u.organization_id = o.id
          WHERE u.auth0_id = ? AND u.is_active = 1`,
    args: [auth0Id],
  });

  if (result.rows.length === 0) {
    throw { status: 404, code: "NOT_FOUND", message: "Usuario no registrado" };
  }

  const user = result.rows[0];

  // Verificar si el trial ha expirado o la suscripción está cancelada
  const isExpired =
    user.subscription_status === "expired" ||
    (user.subscription_status === "trialing" &&
      new Date(user.trial_ends_at) < new Date());

  return {
    userId: user.user_id,
    orgId: user.organization_id,
    role: user.role,
    userName: user.name,
    userEmail: user.email,
    plan: user.plan,
    subscriptionStatus: user.subscription_status,
    isExpired,
  };
}
```

### 6.6 Post-Login: Sincronización de Usuario

```javascript name=api/auth/callback.js
import db from "../_lib/db/client.js";
import { verifyAuth } from "../_lib/middleware/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const authUser = await verifyAuth(req);

  // Comprobar si el usuario ya existe en la DB
  const existing = await db.execute({
    sql: "SELECT id, organization_id FROM users WHERE auth0_id = ?",
    args: [authUser.auth0Id],
  });

  if (existing.rows.length > 0) {
    return res.status(200).json({ data: { user_id: existing.rows[0].id, is_new: false } });
  }

  // Nuevo usuario → crear organización + usuario + etapas por defecto
  const orgId = crypto.randomUUID().replace(/-/g, "");
  const userId = crypto.randomUUID().replace(/-/g, "");
  const trialEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const batch = [
    {
      sql: `INSERT INTO organizations (id, name, plan, trial_ends_at, subscription_status)
            VALUES (?, ?, 'trial', ?, 'trialing')`,
      args: [orgId, `Empresa de ${authUser.email}`, trialEnd],
    },
    {
      sql: `INSERT INTO users (id, auth0_id, organization_id, email, name, role)
            VALUES (?, ?, ?, ?, ?, 'admin')`,
      args: [userId, authUser.auth0Id, orgId, authUser.email, authUser.email.split("@")[0]],
    },
    // Seed pipeline stages...
    {
      sql: `INSERT INTO pipeline_stages (id, organization_id, name, color, probability, position, is_won, is_lost) VALUES
            (lower(hex(randomblob(16))), ?, 'Nuevo Lead',        '#3B82F6', 10,  1, 0, 0),
            (lower(hex(randomblob(16))), ?, 'Contactado',        '#8B5CF6', 25,  2, 0, 0),
            (lower(hex(randomblob(16))), ?, 'Propuesta Enviada', '#F59E0B', 50,  3, 0, 0),
            (lower(hex(randomblob(16))), ?, 'Negociación',       '#F97316', 75,  4, 0, 0),
            (lower(hex(randomblob(16))), ?, 'Ganado',            '#10B981', 100, 5, 1, 0),
            (lower(hex(randomblob(16))), ?, 'Perdido',           '#EF4444', 0,   6, 0, 1)`,
      args: [orgId, orgId, orgId, orgId, orgId, orgId],
    },
  ];

  await db.batch(batch);

  return res.status(201).json({ data: { user_id: userId, org_id: orgId, is_new: true } });
}
```

---

## 7. Ejemplo de Endpoint Completo — Contactos

```javascript name=api/contacts/index.js
import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { createContact, listContacts } from "../_lib/services/contactService.js";
import { contactCreateSchema } from "../_lib/validators/contact.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";

export default async function handler(req, res) {
  try {
    // 1. Autenticación
    const authUser = await verifyAuth(req);

    // 2. Resolver tenant
    const tenant = await resolveTenant(authUser.auth0Id);

    // 3. Comprobar si la cuenta está expirada (solo lectura)
    if (tenant.isExpired && req.method !== "GET") {
      return sendError(res, 403, "FORBIDDEN", "Tu suscripción ha expirado. Renueva para continuar.");
    }

    switch (req.method) {
      case "GET": {
        const { page = 1, limit = 25, search, status, source, tag, sort, order } = req.query;

        const result = await listContacts(tenant.orgId, {
          page: parseInt(page),
          limit: Math.min(parseInt(limit), 100),
          search,
          status,
          source,
          tag,
          sort: sort || "created_at",
          order: order || "desc",
        });

        res.setHeader("X-Total-Count", result.total);
        return sendSuccess(res, 200, result);
      }

      case "POST": {
        // Validar con Zod
        const parsed = contactCreateSchema.safeParse(req.body);
        if (!parsed.success) {
          return sendError(res, 400, "VALIDATION_ERROR", "Datos inválidos", parsed.error.issues);
        }

        const contact = await createContact(tenant.orgId, tenant.userId, parsed.data);
        return sendSuccess(res, 201, contact);
      }

      default:
        res.setHeader("Allow", "GET, POST");
        return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
    }
  } catch (err) {
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
```

### 7.1 Validador con Zod

```javascript name=api/_lib/validators/contact.js
import { z } from "zod";

export const contactCreateSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  surname: z.string().max(100).optional(),
  company: z.string().max(200).optional(),
  job_title: z.string().max(100).optional(),
  email: z.string().email("Email no válido").optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  postal_code: z.string().max(10).optional(),
  country: z.string().max(60).optional(),
  source: z.enum(["web", "referral", "cold_call", "event", "linkedin", "other"]).optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  assigned_to: z.string().optional(),
});

export const contactUpdateSchema = contactCreateSchema.partial();
```

### 7.2 Utilidades de Respuesta

```javascript name=api/_lib/utils/response.js
export function sendSuccess(res, status, data) {
  return res.status(status).json({ data });
}

export function sendError(res, status, code, message, details = null) {
  const error = { code, message };
  if (details) error.details = details;
  return res.status(status).json({ error });
}
```

---

## 8. Emails — Nodemailer + Gmail

### 8.1 Configuración

```javascript name=api/_lib/services/emailService.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,              // leadflow.crm@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD,      // App Password de Google (no la contraseña normal)
  },
});

const FROM = `"LeadFlow CRM" <${process.env.GMAIL_USER}>`;

// ─── Plantillas ─────────────────────────────────────────────

export async function sendWelcomeEmail(to, userName) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: "🎉 Bienvenido a LeadFlow CRM",
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E293B;">¡Hola, ${userName}!</h1>
        <p style="color: #475569; font-size: 16px;">
          Tu cuenta en <strong>LeadFlow CRM</strong> está lista.
          Tienes <strong>30 días de prueba gratuita</strong> con acceso a todas las funcionalidades.
        </p>
        <a href="https://leadflow.vercel.app/dashboard"
           style="display: inline-block; background: #3B82F6; color: white;
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;
                  font-weight: 600; margin-top: 16px;">
          Empezar ahora →
        </a>
        <p style="color: #94A3B8; font-size: 14px; margin-top: 32px;">
          ¿Dudas? Responde a este email y te ayudamos.
        </p>
      </div>
    `,
  });
}

export async function sendTrialWarningEmail(to, userName, daysLeft) {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: `⏰ Tu prueba gratuita termina en ${daysLeft} días`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E293B;">Hola, ${userName}</h1>
        <p style="color: #475569; font-size: 16px;">
          Tu periodo de prueba en LeadFlow CRM finaliza en <strong>${daysLeft} días</strong>.
        </p>
        <p style="color: #475569; font-size: 16px;">
          Suscríbete para no perder acceso a tus datos y seguir gestionando tus oportunidades.
        </p>
        <a href="https://leadflow.vercel.app/configuracion/suscripcion"
           style="display: inline-block; background: #3B82F6; color: white;
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;
                  font-weight: 600; margin-top: 16px;">
          Ver planes de suscripción →
        </a>
      </div>
    `,
  });
}

export async function sendTaskReminderEmail(to, userName, tasks) {
  const taskListHtml = tasks
    .map((t) => `<li style="margin-bottom: 8px;">${t.title} — vence: ${t.due_date}</li>`)
    .join("");

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `📋 Tienes ${tasks.length} tarea(s) pendiente(s) hoy`,
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E293B;">Hola, ${userName}</h1>
        <p style="color: #475569; font-size: 16px;">Estas son tus tareas para hoy:</p>
        <ul style="color: #334155; font-size: 15px;">${taskListHtml}</ul>
        <a href="https://leadflow.vercel.app/tareas"
           style="display: inline-block; background: #3B82F6; color: white;
                  padding: 12px 24px; border-radius: 8px; text-decoration: none;
                  font-weight: 600; margin-top: 16px;">
          Ver mis tareas →
        </a>
      </div>
    `,
  });
}
```

### 8.2 Límites y Migración Futura

```
GMAIL SMTP LIMITS (con App Password)
──────────────────────────────────────
• 500 emails/día (cuenta normal)
• 2.000 emails/día (Google Workspace)

PLAN DE MIGRACIÓN (cuando se superen los límites):
Gmail → Resend.com o SendGrid
  • Cambiar solo el transporter de Nodemailer
  • Misma API de nodemailer, distinto transport
  • Sin cambios en las plantillas
```

---

## 9. Pagos — Stripe

### 9.1 Arquitectura de Pagos

```
┌─────────────────────────────────────────────────────────────┐
│                   FLUJO DE SUSCRIPCIÓN                       │
│                                                             │
│  1. Usuario clica "Suscribirse" en /configuracion/suscripcion│
│                         │                                   │
│  2. Frontend → POST /api/stripe/create-checkout             │
│     { plan: "basic" | "pro" }                               │
│                         │                                   │
│  3. Backend crea Stripe Checkout Session                    │
│     → Devuelve session.url                                  │
│                         │                                   │
│  4. Frontend redirige a Stripe Checkout (hosted)            │
│     → Usuario introduce tarjeta y paga                      │
│                         │                                   │
│  5. Stripe redirige a /configuracion/suscripcion?success=1  │
│                         │                                   │
│  6. Stripe envía webhook (POST /api/stripe/webhook)         │
│     → Evento: checkout.session.completed                    │
│     → Backend actualiza organization.plan y .status en DB   │
│                         │                                   │
│  7. Usuario recarga → plan activo ✅                        │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Configuración de Productos en Stripe

```
STRIPE PRODUCTS (Dashboard de Stripe)
──────────────────────────────────────────────
Product: "LeadFlow CRM — Plan Básico"
  Price: 14,99€/mes (recurring, EUR)
  Price ID: price_basic_monthly

Product: "LeadFlow CRM — Plan Pro"
  Price: 29,99€/mes (recurring, EUR)
  Price ID: price_pro_monthly

(Opcional futuro: precios anuales con descuento)
```

### 9.3 Crear Sesión de Checkout

```javascript name=api/stripe/create-checkout.js
import Stripe from "stripe";
import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import db from "../_lib/db/client.js";
import { sendError, sendSuccess } from "../_lib/utils/response.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_MAP = {
  basic: process.env.STRIPE_PRICE_BASIC,     // price_basic_monthly
  pro: process.env.STRIPE_PRICE_PRO,         // price_pro_monthly
};

export default async function handler(req, res) {
  if (req.method !== "POST") return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");

  try {
    const authUser = await verifyAuth(req);
    const tenant = await resolveTenant(authUser.auth0Id);

    if (tenant.role !== "admin") {
      return sendError(res, 403, "FORBIDDEN", "Solo el administrador puede gestionar la suscripción");
    }

    const { plan } = req.body;
    if (!PRICE_MAP[plan]) {
      return sendError(res, 400, "VALIDATION_ERROR", "Plan no válido");
    }

    // Buscar o crear Stripe Customer
    let stripeCustomerId = null;

    const org = await db.execute({
      sql: "SELECT stripe_customer_id FROM organizations WHERE id = ?",
      args: [tenant.orgId],
    });

    if (org.rows[0]?.stripe_customer_id) {
      stripeCustomerId = org.rows[0].stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: tenant.userEmail,
        metadata: { org_id: tenant.orgId },
      });
      stripeCustomerId = customer.id;

      await db.execute({
        sql: "UPDATE organizations SET stripe_customer_id = ? WHERE id = ?",
        args: [stripeCustomerId, tenant.orgId],
      });
    }

    // Crear Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_MAP[plan], quantity: 1 }],
      success_url: `${process.env.APP_URL}/configuracion/suscripcion?success=1`,
      cancel_url: `${process.env.APP_URL}/configuracion/suscripcion?cancelled=1`,
      metadata: { org_id: tenant.orgId, plan },
    });

    return sendSuccess(res, 200, { checkout_url: session.url });
  } catch (err) {
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
```

### 9.4 Webhook de Stripe

```javascript name=api/stripe/webhook.js
import Stripe from "stripe";
import db from "../_lib/db/client.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// IMPORTANTE: No usar bodyParser — Stripe necesita el raw body
export const config = { api: { bodyParser: false } };

async function buffer(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  const rawBody = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orgId = session.metadata.org_id;
      const plan = session.metadata.plan;

      await db.execute({
        sql: `UPDATE organizations
              SET plan = ?, subscription_status = 'active',
                  stripe_subscription_id = ?, updated_at = datetime('now')
              WHERE id = ?`,
        args: [plan, session.subscription, orgId],
      });
      break;
    }