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