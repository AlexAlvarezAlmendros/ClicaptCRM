

# 🏗️ Plan de Equipo y Coordinación con Agentes IA — LeadFlow CRM

---

## 1. Equipo Necesario (Roles de Agentes)

```
┌─────────────────────────────────────────────────────────────────┐
│                    EQUIPO LEADFLOW CRM                          │
│              (5 Agentes IA + 1 Humano Coordinador)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  👤 TÚ (Alex) ─── Product Owner / Coordinador General          │
│      │                                                          │
│      ├── 🤖 Agente 1 — BACKEND                                 │
│      ├── 🤖 Agente 2 — FRONTEND                                │
│      ├── 🤖 Agente 3 — INTEGRATIONS (Auth0/Stripe/Email)       │
│      ├── 🤖 Agente 4 — QA & TESTING                            │
│      └── 🤖 Agente 5 — DEVOPS & DATABASE                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.1 Detalle de Cada Rol

| Agente | Rol | Responsabilidad Principal | Tecnologías |
|---|---|---|---|
| **Agente 1** | Backend Engineer | API REST, lógica de negocio, servicios, validaciones | Node.js, Express, Zod, libSQL |
| **Agente 2** | Frontend Engineer | UI completa, componentes, páginas, estado, responsive | React, Tailwind, Zustand, TanStack Query, dnd-kit |
| **Agente 3** | Integration Engineer | Auth0, Stripe, Nodemailer, webhooks, cron jobs | Auth0 SDK, Stripe SDK, Nodemailer, Vercel Cron |
| **Agente 4** | QA & Testing | Tests unitarios, integración, E2E, accesibilidad | Vitest, Testing Library, Playwright, axe-core |
| **Agente 5** | DevOps & Database | Setup Turso, migraciones, CI/CD, Vercel config, seeds | Turso CLI, Vercel CLI, GitHub Actions |

---

## 2. El Problema de la Coordinación entre Agentes

```
⚠️  RIESGO PRINCIPAL: QUE SE PISEN ENTRE ELLOS

Problemas típicos:
  • Agente Backend crea un endpoint que devuelve { contacts: [...] }
    pero Agente Frontend espera { data: [...] }
  • Agente Integraciones configura Auth0 de una forma
    pero Backend espera el JWT con otra estructura
  • Dos agentes editan el mismo archivo a la vez → conflictos
  • Un agente asume que algo existe que otro aún no ha creado

SOLUCIÓN: CONTRATOS + FASES + REGLAS ESTRICTAS
```

---

## 3. Arquitectura de Coordinación

### 3.1 El "Contrato" — El Documento que Todos Comparten

Antes de que NINGÚN agente escriba código, necesitas crear un **documento de contratos** que todos deben respetar. Este es el documento más importante de todo el proyecto:

````markdown name=docs/CONTRACTS.md
# 📋 Contratos del Proyecto — LeadFlow CRM

Este documento es la FUENTE DE VERDAD para todos los agentes.
Ningún agente puede desviarse de lo aquí definido sin aprobación de Alex.

---

## 1. Estructura de Respuesta API (OBLIGATORIA)

Toda respuesta exitosa:
```json
{
  "data": { ... }           // objeto o array
}
```

Respuesta con paginación:
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 142,
    "totalPages": 6
  }
}
```

Toda respuesta de error:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descripción legible",
    "details": []              // opcional
  }
}
```

## 2. Autenticación — Flujo

- Frontend usa `@auth0/auth0-react`
- Cada request lleva header: `Authorization: Bearer <jwt>`
- Backend verifica con `jose` (jwtVerify contra JWKS)
- El JWT contiene claim `sub` (auth0_id)
- Backend busca usuario en DB por `auth0_id` → obtiene `organization_id`
- TODOS los queries filtran por `organization_id` (multi-tenant)

## 3. Variables de Entorno

```env
# Auth0
VITE_AUTH0_DOMAIN=leadflow.eu.auth0.com
VITE_AUTH0_CLIENT_ID=xxxxx
VITE_AUTH0_AUDIENCE=https://api.leadflow.app
AUTH0_DOMAIN=leadflow.eu.auth0.com
AUTH0_AUDIENCE=https://api.leadflow.app

# Turso
TURSO_DATABASE_URL=libsql://leadflow-xxx.turso.io
TURSO_AUTH_TOKEN=xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_BASIC=price_xxxxx
STRIPE_PRICE_PRO=price_xxxxx

# Email
GMAIL_USER=leadflow.crm@gmail.com
GMAIL_APP_PASSWORD=xxxxx

# App
APP_URL=https://leadflow.vercel.app
CRON_SECRET=xxxxx
```

## 4. Nombrado de Archivos

- Backend endpoints: `api/<recurso>/index.js`, `api/<recurso>/[id].js`
- Componentes React: `PascalCase.jsx`
- Hooks: `use<Nombre>.js`
- Servicios backend: `<nombre>Service.js`
- CSS: mismo nombre que componente `<Componente>.css`
- Todo en INGLÉS excepto textos visibles al usuario (español)

## 5. Endpoints — Firma Exacta

### GET /api/contacts
Query params: `page`, `limit`, `search`, `status`, `source`, `tag`, `sort`, `order`
Response: `{ data: Contact[], pagination: {...} }`

### POST /api/contacts
Body: `{ name, surname?, company?, job_title?, email?, phone?, ... }`
Response: `{ data: Contact }` — 201

### GET /api/contacts/:id
Response: `{ data: Contact }` (incluye tags, actividades recientes, deals)

### PUT /api/contacts/:id
Body: campos parciales a actualizar
Response: `{ data: Contact }` — 200

### DELETE /api/contacts/:id
Response: `{ data: { id, deleted: true } }` — 200

### GET /api/deals
Query params: `stage_id`, `assigned_to`, `contact_id`
Response: `{ data: Deal[] }` (agrupados por stage_id en frontend, NO en backend)

### POST /api/deals
Body: `{ title, contact_id, stage_id, value?, expected_close?, ... }`
Response: `{ data: Deal }` — 201

### PATCH /api/deals/:id/stage
Body: `{ stage_id, position }`
Response: `{ data: Deal }` — 200
Side effect: si stage.is_won → contact.status = 'customer'
             si stage.is_lost → contact.status = 'lost'

### GET /api/tasks
Query params: `filter` (today|overdue|upcoming|completed), `contact_id`, `deal_id`
Response: `{ data: Task[] }`

### PATCH /api/tasks/:id/complete
Body: (vacío)
Response: `{ data: Task }` — 200
Side effect: crea Activity tipo 'task_completed'

### GET /api/dashboard/stats
Query params: `from`, `to` (ISO dates)
Response:
```json
{
  "data": {
    "newLeads": 23,
    "openDeals": 12,
    "pipelineValue": 45800.00,
    "conversionRate": 18.5,
    "dealsByStage": [
      { "stage_id": "...", "name": "Nuevo Lead", "count": 18, "value": 5400 }
    ],
    "recentActivity": [ Activity, Activity, ... ],
    "todayTasks": [ Task, Task, ... ]
  }
}
```

### POST /api/stripe/create-checkout
Body: `{ plan: "basic" | "pro" }`
Response: `{ data: { checkout_url: "https://checkout.stripe.com/..." } }`

### POST /api/auth/callback
Body: (vacío, usa JWT para datos)
Response: `{ data: { user_id, org_id?, is_new: boolean } }`

### GET /api/auth/me
Response: `{ data: { user, organization } }`

## 6. Modelos — TypeScript Types (referencia para ambos lados)

```typescript
interface Contact {
  id: string;
  name: string;
  surname: string | null;
  company: string | null;
  job_title: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
  source: 'web' | 'referral' | 'cold_call' | 'event' | 'linkedin' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'customer' | 'lost';
  notes: string | null;
  tags: Tag[];
  assigned_to: UserSummary | null;
  created_by: UserSummary;
  created_at: string;   // ISO 8601
  updated_at: string;
}

interface Deal {
  id: string;
  title: string;
  contact: ContactSummary;
  stage_id: string;
  stage_name: string;
  stage_color: string;
  value: number;
  probability: number;
  expected_close: string | null;
  actual_close: string | null;
  loss_reason: string | null;
  notes: string | null;
  position: number;
  assigned_to: UserSummary | null;
  created_by: UserSummary;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: 'high' | 'medium' | 'low';
  is_completed: boolean;
  completed_at: string | null;
  contact: ContactSummary | null;
  deal: DealSummary | null;
  assigned_to: UserSummary | null;
  created_at: string;
}

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task_completed' | 'stage_change' | 'deal_created' | 'deal_won' | 'deal_lost';
  description: string | null;
  contact_id: string | null;
  deal_id: string | null;
  created_by: UserSummary;
  created_at: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface UserSummary {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface ContactSummary {
  id: string;
  name: string;
  surname: string | null;
  company: string | null;
}

interface DealSummary {
  id: string;
  title: string;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  probability: number;
  position: number;
  is_won: boolean;
  is_lost: boolean;
}
```

## 7. Reglas de Archivos — Quién Toca Qué

```
AGENTE 1 (Backend):     SOLO toca api/**  (excepto api/stripe/*, api/auth/*, api/cron/*)
AGENTE 2 (Frontend):    SOLO toca src/**
AGENTE 3 (Integrations): SOLO toca api/stripe/*, api/auth/*, api/cron/*, api/_lib/services/emailService.js, api/_lib/services/stripeService.js
AGENTE 4 (QA):           SOLO toca tests/**, *.test.js, *.spec.js, playwright/**
AGENTE 5 (DevOps):       SOLO toca vercel.json, .github/**, scripts/**, api/_lib/db/**
```

SI UN AGENTE NECESITA MODIFICAR UN ARCHIVO QUE NO LE CORRESPONDE → DEBE PEDIR PERMISO A ALEX.
```
````

---

## 4. Plan de Ejecución por Fases

### Visión General del Timeline

```
SEMANA 1          SEMANA 2          SEMANA 3          SEMANA 4
────────          ────────          ────────          ────────
FASE 0            FASE 1            FASE 2            FASE 3
Cimientos         Core CRUD         Pipeline +        Integraciones
                                    Dashboard         + Polish

Todos en          Backend +         Backend +         Integrations +
paralelo          Frontend en       Frontend en       QA en
(setup)           paralelo          paralelo          paralelo

                  QA empieza        QA testea         QA E2E
                  unitarios         FASE 1             completo

DevOps            DevOps            DevOps            DevOps
setup             CI/CD             monitoring        pre-launch
```

---

### FASE 0 — Cimientos (Días 1-3)

> **Objetivo**: Todo el mundo puede empezar a trabajar sin bloqueos.

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 0: CIMIENTOS (paralelo total, sin dependencias)           │
├─────────────┬───────────────────────────────────────────────────┤
│ AGENTE 5    │ • Crear repo en GitHub                           │
│ DevOps      │ • Inicializar proyecto (Vite + estructura)       │
│             │ • Configurar Turso: crear DB, tokens             │
│ DÍA 1      │ • Ejecutar schema.sql completo                   │
│             │ • Crear script de seed con datos de prueba       │
│             │ • Configurar vercel.json                         │
│             │ • Crear .env.example con todas las variables     │
���             │ • Primer deploy vacío a Vercel                   │
│             │ • Configurar GitHub Actions (lint + test)        │
├─────────────┼───────────────────────────────────────────────────┤
│ AGENTE 3    │ • Crear tenant en Auth0                          │
│ Integrations│ • Configurar Application (SPA) en Auth0          │
│             │ • Crear API en Auth0                             │
│ DÍA 1-2    │ • Configurar cuenta Gmail + App Password         │
│             │ • Crear cuenta Stripe (modo test)                │
│             │ • Crear Products y Prices en Stripe              │
│             │ • Documentar todos los IDs/tokens en .env        │
├─────────────┼───────────────────────────────────────────────────┤
│ AGENTE 1    │ • Crear api/_lib/db/client.js (conexión Turso)   │
│ Backend     │ • Crear api/_lib/middleware/auth.js (stub)       │
│             │ • Crear api/_lib/middleware/tenant.js (stub)      │
│ DÍA 1-2    │ • Crear api/_lib/utils/response.js               │
│             │ • Crear api/_lib/utils/pagination.js             │
│             │ • Crear api/_lib/config.js                       │
│             │ • Crear api/health.js (endpoint de prueba)       │
│             │ │                                                │
│             │ ⚠️ Los stubs de auth devuelven un user fake      │
│             │   para que el desarrollo no dependa de Auth0     │
│             │   hasta que Agente 3 lo tenga listo              │
├─────────────┼───────────────────────────────────────────────────┤
│ AGENTE 2    │ • Configurar Tailwind + tokens.css               │
│ Frontend    │ • Crear componentes ui/ base:                    │
│             │   Button, Input, Card, Badge, Modal,             │
│ DÍA 1-3    │   Spinner, Toast, EmptyState, Table              │
│             │ • Crear AppLayout + Sidebar + BottomNav          │
│             │ • Crear AppRouter con rutas placeholder          │
│             │ • Crear hook useTheme + ThemeToggle              │
│             │ • Crear api.js (fetch wrapper con Bearer token)  │
│             │ │                                                │
│             │ ⚠️ Usa datos mock hardcodeados en los            │
│             │   componentes para poder ver la UI               │
├─────────────┼───────────────────────────────────────────────────┤
│ AGENTE 4    │ • Configurar Vitest                              │
│ QA          │ • Configurar Testing Library                     │
│             │ • Configurar Playwright                          │
│ DÍA 2-3    │ • Crear helpers de test (render con providers,    │
│             │   mock de Auth0, mock de fetch)                  │
│             │ • Crear primer test: Button.test.jsx             │
│             │ • Crear primer test API: health.test.js          │
└─────────────┴───────────────────────────────────────────────────┘

✅ CHECKPOINT FASE 0:
   □ Repo creado y deployado en Vercel (vacío pero funcional)
   □ DB Turso creada con schema completo + datos seed
   □ Auth0, Stripe y Gmail configurados
   □ GET /api/health responde { data: { status: "ok" } }
   □ UI: Layout con sidebar visible, tema claro/oscuro funciona
   □ Tests: framework configurado, 2 tests pasan
```

---

### FASE 1 — Core CRUD: Contactos + Tareas + Actividades (Días 4-10)

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 1: CORE CRUD (Backend y Frontend en paralelo)             │
├─────────────┬───────────────────────────────────────────────────┤
│ AGENTE 1    │                                                   │
│ Backend     │ BLOQUE A (Días 4-6): CONTACTOS                   │
│             │ • contactService.js (CRUD completo)              │
│ Días 4-10  │ • Validators: contact.js (Zod)                   │
│             │ • api/contacts/index.js (GET lista + POST)       │
│             │ • api/contacts/[id].js (GET, PUT, DELETE)        │
│             │ • Búsqueda: LIKE por name, surname, company      │
│             │ • Filtros: status, source, tag                   │
│             │ • Paginación + ordenación                        │
│             │ • Soft delete                                    │
│             │ • api/tags/index.js (GET, POST, DELETE)          │
│             │ │                                                │
│             │ BLOQUE B (Días 7-8): TAREAS                      │
│             │ • taskService.js                                 │
│             │ • api/tasks/index.js                             │
│             │ • api/tasks/[id].js                              │
│             │ • api/tasks/[id]/complete.js                     │
│             │ • Filtro: today, overdue, upcoming, completed    │
│             │ │                                                │
│             │ BLOQUE C (Días 9-10): ACTIVIDADES                │
│             │ • activityService.js                             │
│             │ • api/activities/index.js (GET filtrado, POST)   │
│             │ • Auto-registro de actividades al completar task │
│             │                                                   │
├─────────────┼───────────────────────────────────────────────────┤
│ AGENTE 2    │                                                   │
│ Frontend    │ BLOQUE A (Días 4-7): CONTACTOS                   │
│             │ • ContactsPage.jsx (lista + búsqueda + filtros)  │
│ Días 4-10  │ • ContactList.jsx (tabla desktop)                │
│             │ • ContactCard.jsx (tarjeta móvil)                │
│             │ • ContactForm.jsx (crear/editar en Drawer)       │
│             │ • ContactDetail.jsx (ficha completa)             │
│             │ • ContactDetailPage.jsx                          │
│             │ • ContactFilters.jsx                             │
│             │ • TagBadge.jsx                                   │
│             │ • useContacts.js (TanStack Query hooks)          │
│             │ │                                                │
│             │ ⚠️ Desde día 4 conecta al backend REAL           │
│             │   (eliminar datos mock)                          │
│             │ │                                                │
│             │ BLOQUE B (Días 8-9): TAREAS                      │
│             │ • TasksPage.jsx                                  │
│             │ • TaskList.jsx + TaskItem.jsx                    │
│             │ • TaskForm.jsx                                   │
│             │ • TaskFilters.jsx                                │
│             │ • useTasks.js                                    │
│             │ │                                                │
│             │ BLOQUE C (Día 10): ACTIVIDADES                   │
│             │ • Timeline de actividades en ContactDetail       │
│             │ • Formulario "Registrar actividad"               │
│             │ • useActivities.js                               │
│             │                                                   │
├─────────────┼───────────────────────────────────────────────────┤
│ AGENTE 3    │                                                   │
│ Integrations│ Días 4-6: AUTH0 COMPLETO                         │
│             │ • api/auth/callback.js (sync user → DB)          │
│             │ • api/auth/me.js                                 │
│             │ • Middleware auth.js REAL (no stub)               │
│             │ • Middleware tenant.js REAL                       │
│             │ • LoginPage.jsx (Auth0 redirect)                 │
│             │ • CallbackPage.jsx                               │
│             │ • ProtectedRoute.jsx                             │
│             │ │                                                │
│             │ ⚠️ Cuando auth.js REAL esté listo, notificar     │
│             │   a Agente 1 para que quite el stub              │
│             │ │                                                │
│             │ Días 7-8: EMAIL                                  │
│             │ • emailService.js completo                       │
│             │ • sendWelcomeEmail (llamar desde callback.js)    │
│             │ • Templates HTML para todos los emails           │
│             │ │                                                │
│             │ Días 9-10: STRIPE (inicio)                       │
│             │ • stripeService.js                               │
│             │ • api/stripe/create-checkout.js                  │
│             │ • api/stripe/webhook.js                          │
│             │ • api/stripe/portal.js                           │
│             │                                                   │
├─────────────┼───────────────────────────────────────────────────┤
│ AGENTE 4    │                                                   │
│ QA          │ Días 5-7: (espera a que haya código)             │
│             │ • Tests unitarios: contactService.js             │
│ Días 5-10  │ • Tests unitarios: validators (Zod schemas)      │
│             │ • Tests componentes: Button, Input, Card, Badge  │
│             │ │                                                │
│             │ Días 8-10:                                       │
│             │ • Tests unitarios: taskService.js                │
│             │ • Tests componentes: ContactList, ContactForm    │
│             │ • Tests integración: API contacts (con DB test)  │
│             │ • Primer test E2E: login → ver contactos         │
│             │                                                   │
├─────────────┼───────────────────────────────────────────────────┤
│ AGENTE 5    │                                                   │
│ DevOps      │ Días 4-6:                                        │
│             │ • GitHub Actions: test en PR, lint en PR          │
│             │ • Vercel: configurar preview deploys por branch  │
│             │ • Script migrate.js funcional                    │
│             │ │                                                │
│             │ Días 7-10:                                       │
│             │ • Turso: crear DB de test separada               │
│             │ • Configurar variables de entorno en Vercel      │
│             │ • Monitoring: logs en Vercel                     │
│             │ • Script seed.js con datos realistas             │
└─────────────┴───────────────────────────────────────────────────┘

✅ CHECKPOINT FASE 1:
   □ CRUD contactos completo (crear, listar, buscar, editar, eliminar)
   □ Tareas: crear, completar, filtrar
   □ Actividades: registrar y ver historial en ficha de contacto
   □ Auth0 funcionando: login real, JWT validado, multi-tenant
   □ Email de bienvenida se envía al registrarse
   □ Stripe: checkout session funciona en modo test
   □ Tests: >70% cobertura en services, componentes básicos testeados
   □ CI: tests pasan en GitHub Actions
```

---

### FASE 2 — Pipeline Kanban + Dashboard (Días 11-18)

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 2: PIPELINE + DASHBOARD                                   │
├─────────────┬───────────────────────────────────────────────────┤
│ AGENTE 1    │                                                   │
│ Backend     │ Días 11-14: DEALS & PIPELINE                     │
│             │ • dealService.js (CRUD + mover etapa + reorder)  │
│ Días 11-18 │ • api/deals/index.js                             │
│             │ • api/deals/[id].js                              │
│             │ • api/deals/[id]/stage.js (PATCH)                │
│             │ • api/deals/[id]/reorder.js (PATCH)              │
│             │ • api/pipeline/stages.js (GET, PUT)              │
│             │ • Lógica: mover a "Ganado" → contact=customer    │
│             │ • Lógica: mover a "Perdido" → pedir motivo       │
│             │ • Auto-crear actividades al mover deal           │
│             │ │                                                │
│             │ Días 15-17: DASHBOARD                            │
│             │ • dashboardService.js                            │
│             │ • api/dashboard/stats.js                         │
│             │ • Queries optimizados con CTEs para KPIs         │
│             │ • Filtrado por rango de fechas                   │
│             │ │                                                │
│             │ Día 18: ORGANIZACIÓN                             │
│             │ • api/organization/index.js                      │
│             │ • api/organization/members.js                    │
│             │                                                   │
├─────────────┼───────────────────────────────────────────────────┤
│ AGENTE 2    │                                                   │
│ Frontend    │ Días 11-15: PIPELINE KANBAN                      │
│             │ • PipelinePage.jsx                               │
│ Días 11-18 │ • PipelineBoard.jsx (contenedor con dnd-kit)     │
│             │ • PipelineColumn.jsx                             │
│             │ • DealCard.jsx (tarjeta arrastrable)             │
│             │ • DealForm.jsx (crear/editar en Drawer)          │
│             │ • DealDetail.jsx (modal con actividades+tareas)  │
│             │ • PipelineAccordion.jsx (vista móvil)            │
│             │ • useDeals.js (hooks con invalidación de cache   │
│             │   al mover etapa)                                │
│             │ │                                                │
│             │ ⚠️ El drag & drop debe hacer PATCH inmediato    │
│             │   + optimistic update en la cache                │
│             │ │                                                │
│             │ Días 16-18: DASHBOARD                            │
│             │ • DashboardPage.jsx                              │
│             │ • KpiCard.jsx (4 tarjetas)                       │
│             │ • FunnelChart.jsx (Recharts)                     │
│             │ • RecentActivity.jsx                             │
│             │ • TodayTasks.jsx                                 │
│             │ • DateRangeSelector.jsx                          │
│             │ • useDashboard.js                                │
│             │                                                   │
├─────────────┼───────────────────────────────────────────────────┤
│ AGENTE 3    │                                                   │
│ Integrations│ Días 11-14: STRIPE COMPLETO                      │
│             │ • Webhook handler con TODOS los eventos:         │
│             │   checkout.session.completed                     │
│             │   invoice.payment_succeeded                      │
│             │   invoice.payment_failed                         │
│             │   customer.subscription.updated                  │
│             │   customer.subscription.deleted                  │
│             │ • api/stripe/portal.js (gestión de suscripción)  │
│             │ • SubscriptionSettings.jsx                       │
│             │ • TrialBanner.jsx (banner persistente)           │
│             │ • Lógica de bloqueo post-trial (solo lectura)    │
│             │ │                                                │
│             │ Días 15-18: CRON JOBS + EMAIL                    │
│             │ • api/cron/trial-warnings.js                     │
│             │ • api/cron/task-reminders.js                     │
│             │ • Configurar Vercel Cron en vercel.json          │
│             │ • Email: trial warning (7 días, 3 días, último)  │
│             │ • Email: task reminder (mañana a las 8:00)       │
│             │                                                   │
├─────────────┼───────────────────────────────────────────────────┤
│ AGENTE 4    │                                                   │
│ QA          │ Días 11-14: TESTS FASE 1                         │
│             │ • Tests E2E: crear contacto → editar → eliminar  │
│ Días 11-18 │ • Tests E2E: crear tarea → completar             │
│             │ • Tests integración: todos los endpoints contacts│
│             │ • Tests accesibilidad: axe-core en páginas       │
│             │ │                                                │
│             │ Días 15-18: TESTS FASE 2                         │
│             │ • Tests unitarios: dealService.js                │
│             │ • Tests unitarios: dashboardService.js           │
│             │ • Tests componentes: DealCard, KpiCard           │
│             │ • Tests integración: endpoints deals + dashboard │
│             │ • Test E2E: mover deal en kanban                 │
│             │                                                   │
├─────────────┼───────────────────────────────────────────────────┤
│ AGENTE 5    │                                                   │
│ DevOps      │ Días 11-13:                                      │
│             │ • Configurar Vercel Cron (vercel.json crons)     │
│             │ • Configurar Stripe webhook URL en Stripe        │
│ Días 11-18 │   Dashboard (producción + test)                  │
│             │ • Stripe CLI para testing local de webhooks      │
│             │ │                                                │
│             │ Días 14-18:                                      │
│             │ • Performance: analizar queries lentos en Turso  │
│             │ • Añadir índices si es necesario                 │
│             │ • Configurar error tracking (Sentry free tier)   │
│             │ • Documentar runbook de deploy                   │
└─────────────┴───────────────────────────────────────────────────┘

✅ CHECKPOINT FASE 2:
   □ Pipeline Kanban funcional: crear deal, drag & drop, cerrar
   □ Dashboard con 4 KPIs + gráfico embudo + actividad reciente
   □ Stripe: flujo completo de suscripción (test mode)
   □ Cron jobs: avisos de trial + recordatorios de tareas
   □ Tests E2E: flujos críticos cubiertos
   □ Performance: todas las páginas cargan < 3s
```

---

### FASE 3 — Settings, Polish, Lanzamiento (Días 19-25)

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 3: POLISH & LAUNCH                                        │
├─────────────┬───────────────────────────────────────────────────┤
│ AGENTE 1    │                                                   │
│ Backend     │ • api/contacts/import.js (CSV)                   │
│             │ • api/contacts/export.js (CSV)                   │
│ Días 19-22 │ • Rate limiting en todos los endpoints            │
│             │ • Revisar TODOS los endpoints: edge cases,       │
│             │   validaciones, errores                          │
│             │ • Optimizar queries N+1                          │
│             │ • Añadir logs estructurados                      │
│             │                                                   │
├─────────────┼────────────────────────────────��──────────────────┤
│ AGENTE 2    │                                                   │
│ Frontend    │ • SettingsPage.jsx completa:                     │
│             │   ProfileSettings, OrganizationSettings,         │
│ Días 19-23 │   PipelineSettings, TeamSettings,                │
│             │   SubscriptionSettings                           │
│             │ • WelcomeTour.jsx (onboarding primer uso)        │
│             │ • Import/Export en ContactsPage                  │
│             │ • NotFoundPage.jsx (404)                         │
│             │ • Estados vacíos en TODAS las listas             │
│             │ • Loading skeletons en TODAS las páginas         │
│             │ • Revisar responsive en TODAS las pantallas      │
│             │ • Animaciones de entrada (fade-in en páginas)    │
│             │ • Favicon, meta tags, manifest.json              │
│             │                                                   │
├─────────────┼───────────────────────────────────────────────────┤
│ AGENTE 3    │                                                   │
│ Integrations│ • Test completo del flujo Stripe en Vercel       │
│             │ • Verificar emails llegan a bandeja de entrada   │
│ Días 19-22 │   (no spam)                                      │
│             │ • Auth0: personalizar página de login con logo   │
│             │   y colores de LeadFlow                          │
│             │ • Auth0: configurar email templates              │
│             │ • Stripe: modo live (cuando se decida lanzar)    │
│             │                                                   │
├─────────────┼───────────────────────────────────────────────────┤
│ AGENTE 4    │                                                   │
│ QA          │ • Suite E2E COMPLETA:                            │
│             │   1. Registro → onboarding → crear contacto      │
│ Días 19-25 │   2. Crear deal → mover por pipeline → ganar    │
│             │   3. Crear tarea → completar → ver en historial  ���
│             │   4. Dashboard muestra datos correctos           │
│             │   5. Suscripción: trial → checkout → plan activo │
│             │   6. Mobile: navegación completa                 │
│             │ • Accessibility audit completo                   │
│             │ • Performance audit (Lighthouse > 90)            │
│             │ • Cross-browser testing (Chrome, Firefox, Safari)│
│             │ • Security review: XSS, CSRF, injection         │
│             │ • CREAR DOCUMENTO DE BUGS encontrados            │
│             │                                                   │
├─────────────┼───────────────────────────────────────────────────┤
│ AGENTE 5    │                                                   │
│ DevOps      │ • Dominio personalizado en Vercel                │
│             │ • SSL verificado                                 │
│ Días 19-25 │ • Variables de entorno de PRODUCCIÓN             │
│             │ • Turso: crear DB de producción separada         │
│             │ • Backup strategy para Turso                     │
│             │ • Monitoring dashboards                          │
│             │ • README.md completo                             │
│             │ • Deploy final de producción                     │
└─────────────┴───────────────────────────────────────────────────┘

✅ CHECKPOINT FINAL (LAUNCH READY):
   □ Todos los flujos E2E pasan sin errores
   □ Lighthouse: Performance > 90, Accessibility > 90
   □ Funciona perfectamente en Chrome, Firefox, Safari
   □ Funciona en móvil (iPhone SE como mínimo)
   □ Auth0 login → usar app → Stripe checkout → plan activo ✅
   □ Emails llegan correctamente (no spam)
   □ Cron jobs ejecutan en Vercel
   □ 0 bugs críticos abiertos
   □ Deploy de producción estable
```

---

## 5. Reglas de Coordinación para los Agentes

### 5.1 Prompt Base (System Prompt para TODOS los Agentes)

````markdown name=docs/AGENT_SYSTEM_PROMPT.md
# System Prompt — LeadFlow CRM

Eres un agente de desarrollo trabajando en el proyecto LeadFlow CRM.
Eres el Agente [N] con rol [ROL].

## Reglas INQUEBRANTABLES:

1. **LEE CONTRACTS.md** antes de escribir CUALQUIER código.
   Nunca inventes formatos de respuesta, nombres de campos o estructuras.

2. **SOLO toca tus archivos**:
   [insertar la lista de archivos según el agente]
   Si necesitas que otro archivo cambie, escribe un comentario
   `// TODO-AGENTE-[N]: [descripción del cambio necesario]`

3. **Nombrado**: Archivos en inglés. Texto visible al usuario en español.

4. **Cada archivo debe tener**:
   - Comentario de cabecera: `// LeadFlow CRM — [módulo] — [descripción breve]`
   - Imports organizados: externos → internos → relativos
   - Sin console.log en producción (usa el logger)

5. **Git**:
   - Branch: `agent-[n]/[feature]` (ej: `agent-1/contacts-crud`)
   - Commits: `[agent-1] feat: add contacts CRUD endpoints`
   - Un PR por feature, nunca PRs gigantes

6. **Si algo no está definido en CONTRACTS.md**: PARA y pregunta a Alex.
   No asumas. No inventes. Pregunta.

7. **Testing**: Todo servicio debe tener al menos tests de los happy paths.
   (Agente 4 hará los edge cases)

8. **NO instales dependencias** sin aprobación. Usa SOLO las del stack definido.
````

### 5.2 Prompt Específico por Agente

````markdown name=docs/AGENT_1_BACKEND_PROMPT.md
# Agente 1 — Backend Engineer

## Tu alcance:
```
api/
├── _lib/
│   ├── middleware/auth.js      (solo stub inicial, luego Agente 3 lo reemplaza)
│   ├── middleware/tenant.js    (solo stub inicial, luego Agente 3 lo reemplaza)
│   ├── middleware/rateLimit.js ✅ TUYO
│   ├── middleware/validate.js  ✅ TUYO
│   ├── middleware/errorHandler.js ✅ TUYO
│   ├── services/contactService.js ✅ TUYO
│   ├── services/dealService.js    ✅ TUYO
│   ├── services/taskService.js    ✅ TUYO
│   ├── services/activityService.js ✅ TUYO
│   ├── services/dashboardService.js ✅ TUYO
│   ├── validators/*.js         ✅ TUYO
│   ├── utils/*.js              ✅ TUYO
│   └── config.js               ✅ TUYO
├── contacts/**                 ✅ TUYO
├── deals/**                    ✅ TUYO
├── tasks/**                    ✅ TUYO
├── activities/**               ✅ TUYO
├── dashboard/**                ✅ TUYO
├── pipeline/**                 ✅ TUYO
├── organization/**             ✅ TUYO
├── tags/**                     ✅ TUYO
└── health.js                   ✅ TUYO
```

## NO toques:
- `api/auth/**` (Agente 3)
- `api/stripe/**` (Agente 3)
- `api/cron/**` (Agente 3)
- `api/_lib/services/emailService.js` (Agente 3)
- `api/_lib/services/stripeService.js` (Agente 3)
- `api/_lib/db/**` (Agente 5)
- `src/**` (Agente 2)

## Patrón de endpoint:
```javascript
import { verifyAuth } from "../_lib/middleware/auth.js";
import { resolveTenant } from "../_lib/middleware/tenant.js";
import { sendSuccess, sendError } from "../_lib/utils/response.js";

export default async function handler(req, res) {
  try {
    const authUser = await verifyAuth(req);
    const tenant = await resolveTenant(authUser.auth0Id);

    if (tenant.isExpired && req.method !== "GET") {
      return sendError(res, 403, "FORBIDDEN", "Suscripción expirada");
    }

    switch (req.method) {
      case "GET": { /* ... */ }
      case "POST": { /* ... */ }
      default:
        return sendError(res, 405, "METHOD_NOT_ALLOWED", "Método no permitido");
    }
  } catch (err) {
    return sendError(res, err.status || 500, err.code || "INTERNAL_ERROR", err.message);
  }
}
```
````

````markdown name=docs/AGENT_2_FRONTEND_PROMPT.md
# Agente 2 — Frontend Engineer

## Tu alcance: `src/**` completo

## NO toques:
- `api/**` (Backend + Integraciones)
- `scripts/**` (DevOps)
- `tests/**` (QA — pero sí puedes crear `*.test.jsx` junto a tus componentes)
- `vercel.json` (DevOps)

## Reglas de componentes:
1. Cada componente tiene su `.jsx` y su `.css` (mismo nombre)
2. Usa SOLO variables CSS de tokens.css. NUNCA colores hardcodeados.
3. Los componentes ui/ son genéricos y NO conocen la lógica de negocio
4. Los hooks use*.js usan TanStack Query para TODA la comunicación con API
5. Zustand SOLO para estado de UI (sidebar abierta, modal activo, filtros)
6. TanStack Query para TODOS los datos del servidor. NUNCA guardes datos de API en Zustand.

## Patrón de hook:
```javascript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useContacts(filters) {
  return useQuery({
    queryKey: ["contacts", filters],
    queryFn: () => api.get("/contacts", { params: filters }),
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/contacts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });
}
```

## Patrón de api.js:
```javascript
class ApiClient {
  constructor() {
    this.baseUrl = "/api";
  }

  async request(method, path, { params, body } = {}) {
    const token = await getAccessTokenSilently();    // de Auth0
    const url = new URL(this.baseUrl + path, window.location.origin);
    if (params) Object.entries(params).forEach(([k, v]) => {
      if (v != null) url.searchParams.set(k, v);
    });

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();
    if (!res.ok) throw json.error;
    return json.data;
  }

  get(path, opts)  { return this.request("GET", path, opts); }
  post(path, body) { return this.request("POST", path, { body }); }
  put(path, body)  { return this.request("PUT", path, { body }); }
  patch(path, body){ return this.request("PATCH", path, { body }); }
  del(path)        { return this.request("DELETE", path); }
}
```
````

````markdown name=docs/AGENT_3_INTEGRATIONS_PROMPT.md
# Agente 3 — Integration Engineer

## Tu alcance:
```
api/auth/**                         ✅ TUYO
api/stripe/**                       ✅ TUYO
api/cron/**                         ✅ TUYO
api/_lib/services/emailService.js   ✅ TUYO
api/_lib/services/stripeService.js  ✅ TUYO
api/_lib/middleware/auth.js         ✅ TUYO (reemplazar stub del Agente 1)
api/_lib/middleware/tenant.js       ✅ TUYO (reemplazar stub del Agente 1)
src/components/onboarding/TrialBanner.jsx     ✅ TUYO (excepción frontend)
src/components/settings/SubscriptionSettings.jsx ✅ TUYO (excepción frontend)
src/pages/LoginPage.jsx             ✅ TUYO (excepción frontend)
src/pages/CallbackPage.jsx          ✅ TUYO (excepción frontend)
src/components/layout/ProtectedRoute.jsx ✅ TUYO (excepción frontend)
```

## Regla especial:
Cuando reemplaces auth.js y tenant.js (stubs → real),
avisa a Alex para coordinar con Agente 1.
Hazlo en un PR separado y limpio.

## Stripe webhooks — eventos que DEBES manejar:
- checkout.session.completed
- invoice.payment_succeeded
- invoice.payment_failed
- customer.subscription.updated
- customer.subscription.deleted

## Cron jobs — DEBEN tener protección:
```javascript
export default async function handler(req, res) {
  // Verificar que viene de Vercel Cron
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }
  // ...
}
```
````

````markdown name=docs/AGENT_4_QA_PROMPT.md
# Agente 4 — QA & Testing

## Tu alcance:
```
tests/**                    ✅ TUYO
playwright/**               ✅ TUYO
*.test.js / *.test.jsx      ✅ TUYO (en cualquier directorio)
*.spec.js / *.spec.jsx      ✅ TUYO
```

## NO toques código de producción. Si encuentras un bug:
1. Crea un test que lo reproduce
2. Documenta en docs/BUGS.md:
   - Archivo afectado
   - Descripción del bug
   - Test que lo reproduce
   - Agente responsable de arreglarlo

## Estructura de tests:
```
tests/
├── unit/
│   ├── services/
│   │   ├── contactService.test.js
│   │   ├── dealService.test.js
│   │   └── taskService.test.js
│   └── validators/
│       ├── contact.test.js
│       └── deal.test.js
├── integration/
│   ├── api/
│   │   ├── contacts.test.js
│   │   ├── deals.test.js
│   │   └── tasks.test.js
│   └── stripe/
│       └── webhook.test.js
├── components/
│   ├── ui/
│   │   ├── Button.test.jsx
│   │   ├── Input.test.jsx
│   │   └── Card.test.jsx
│   ├── contacts/
│   │   ├── ContactList.test.jsx
│   │   └── ContactForm.test.jsx
│   └── pipeline/
│       └── DealCard.test.jsx
└── e2e/
    ├── auth.spec.js
    ├── contacts.spec.js
    ├── pipeline.spec.js
    ├── tasks.spec.js
    ├── dashboard.spec.js
    └── subscription.spec.js
```
````

````markdown name=docs/AGENT_5_DEVOPS_PROMPT.md
# Agente 5 — DevOps & Database

## Tu alcance:
```
api/_lib/db/**              ✅ TUYO (client.js, schema.sql, migrations/)
scripts/**                  ✅ TUYO
vercel.json                 ✅ TUYO
.github/**                  ✅ TUYO
.env.example                ✅ TUYO
package.json                ✅ TUYO (solo scripts y dependencias base)
vite.config.js              ✅ TUYO
tailwind.config.js          ✅ TUYO (setup inicial, luego Agente 2 lo ajusta)
README.md                   ✅ TUYO
```

## Vercel.json mínimo:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ],
  "crons": [
    { "path": "/api/cron/trial-warnings", "schedule": "0 9 * * *" },
    { "path": "/api/cron/task-reminders", "schedule": "0 8 * * *" }
  ]
}
```

## Migraciones:
- Numeradas: 001_, 002_, 003_...
- Idempotentes (IF NOT EXISTS)
- Script migrate.js las ejecuta en orden
- NUNCA borres una migración existente, solo añade nuevas
````

---

## 6. Protocolo de Comunicación entre Agentes

### 6.1 Cómo se Comunican (a través de ti)

```
┌──────────────────────────────────────────────────────────────────┐
│              PROTOCOLO DE COMUNICACIÓN                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Los agentes NO hablan entre sí directamente.                   │
│  TODO pasa por Alex (tú).                                       │
│                                                                  │
│  FLUJO:                                                         │
│                                                                  │
│  Agente 1 ──► "Necesito que auth.js deje de ser stub"           │
│       │                                                          │
│       ▼                                                          │
│     ALEX ──► Revisa si Agente 3 ya tiene auth.js real listo     │
│       │                                                          │
│       ▼                                                          │
│  Agente 3 ──► "Sí, auth.js real está en PR #12"                │
│       │                                                          │
│       ▼                                                          │
│     ALEX ──► Mergea PR #12, avisa a Agente 1: "Ya puedes       │
│              hacer pull y quitar el stub"                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 Sistema de Dependencias (Qué Bloquea a Quién)

```
FASE 0 — Sin dependencias (todos trabajan en paralelo)

FASE 1 — Dependencias:
──────────────────────────────────────────────────
Agente 2 DEPENDE DE Agente 1:
  • Frontend necesita endpoints reales para conectar
  • Solución: Agente 1 hace contactos PRIMERO (días 4-6)
             Agente 2 hace UI con mocks (días 4-5) y conecta (día 6+)

Agente 1 DEPENDE DE Agente 3:
  • Backend necesita auth.js real para validar JWT
  • Solución: Agente 1 usa stub hasta que Agente 3 entregue
             Agente 3 prioriza Auth0 (días 4-6)

Agente 4 DEPENDE DE Agentes 1+2:
  • QA no puede testear lo que no existe
  • Solución: Agente 4 empieza por setup + tests de componentes ui/
             que ya existen desde Fase 0

FASE 2 — Dependencias:
──────────────────────────────────────────────────
Agente 2 DEPENDE DE Agente 1:
  • Frontend Kanban necesita endpoints de deals
  • Mismo patrón: Backend primero, Frontend conecta 2-3 días después

FASE 3 — Sin dependencias críticas (todos puliendo)
```

---

## 7. Checklist para Cada Agente Antes de un PR

````markdown name=docs/PR_CHECKLIST.md
# ✅ Checklist Pre-PR

Antes de crear un Pull Request, verifica:

## Todos los agentes:
- [ ] He leído CONTRACTS.md y mi código lo cumple
- [ ] No he tocado archivos fuera de mi alcance
- [ ] No hay console.log (usa logger en backend)
- [ ] No hay credenciales hardcodeadas
- [ ] Todas las strings de usuario están en español
- [ ] Mi código tiene comentarios de cabecera
- [ ] He probado manualmente que funciona

## Agente 1 (Backend):
- [ ] Cada endpoint maneja todos los métodos HTTP (o devuelve 405)
- [ ] Cada endpoint tiene validación con Zod
- [ ] Cada query filtra por organization_id
- [ ] Los errores siguen el formato estándar
- [ ] Soft delete (nunca DELETE real)
- [ ] Paginación funciona correctamente

## Agente 2 (Frontend):
- [ ] Funciona en móvil (320px mínimo)
- [ ] Funciona en modo claro Y oscuro
- [ ] Solo uso variables CSS, ningún color hardcodeado
- [ ] Estados: loading, error, vacío, datos — todos implementados
- [ ] Accesibilidad: labels, aria, contraste, focus visible
- [ ] No hay warnings en consola del navegador

## Agente 3 (Integrations):
- [ ] Webhooks validan la firma de Stripe
- [ ] Cron jobs validan CRON_SECRET
- [ ] Emails no van a spam (SPF, format correcto)
- [ ] Auth0 redirect URLs incluyen localhost Y producción

## Agente 4 (QA):
- [ ] Todos los tests pasan localmente
- [ ] Tests no dependen de orden de ejecución
- [ ] Tests limpian sus datos (no contaminan otros tests)
- [ ] Bugs documentados en BUGS.md

## Agente 5 (DevOps):
- [ ] Migraciones son idempotentes
- [ ] vercel.json es JSON válido
- [ ] Variables de entorno documentadas en .env.example
- [ ] Scripts tienen instrucciones en README
````

---

## 8. Resumen Ejecutivo para Ti (Alex)

```
┌──────────────────────────────────────────────────────────────────┐
│                    TU ROL COMO COORDINADOR                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ANTES DE EMPEZAR:                                           │
│     • Crea el repo en GitHub                                    │
│     • Sube CONTRACTS.md y todos los docs/AGENT_*.md             │
│     • Configura las cuentas: Auth0, Stripe, Turso, Gmail        │
│                                                                  │
│  2. CADA DÍA:                                                   │
│     • Revisa los PRs de cada agente                             │
│     • Verifica que no se pisen (archivos, contratos)            │
│     • Mergea en orden: DevOps → Backend → Integrations →        │
│       Frontend → QA                                             │
│     • Resuelve conflictos de merge si los hay                   │
│                                                                  │
│  3. EN CADA CAMBIO DE FASE:                                     │
│     • Verifica el CHECKPOINT completo                           │
│     • No avances a la siguiente fase si hay items rojos         │
│     • Haz un deploy a Vercel y prueba tú mismo                 │
│                                                                  │
│  4. DECISIONES QUE SOLO TÚ TOMAS:                              │
│     • Aprobar nuevas dependencias                               │
│     • Resolver conflictos entre agentes                         │
│     • Cambiar contratos o alcances                              │
│     • Priorizar bugs (crítico vs. puede esperar)                │
│     • Dar el OK final para lanzamiento                          │
│                                                                  │
│  5. ORDEN DE MERGE RECOMENDADO:                                 │
│     Agente 5 (infra) → Agente 1 (API) → Agente 3 (auth/stripe) │
│     → Agente 2 (UI) → Agente 4 (tests)                         │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```
