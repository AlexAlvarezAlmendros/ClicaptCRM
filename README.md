<div align="center">

# CliCapt CRM

**Un CRM para el que trabaja solo: contactos, pipeline y tareas — y nada más, porque lo demás no se usa.**

[![Demo](https://img.shields.io/badge/demo-clicapt--crm.vercel.app-4dd4ac)](https://clicapt-crm.vercel.app)
[![React 18](https://img.shields.io/badge/React-18-61dafb)](package.json)
[![Serverless](https://img.shields.io/badge/Vercel-Serverless%20Functions-000000)](api/)
[![Turso](https://img.shields.io/badge/Turso-libSQL-4ff8d2)](scripts/migrate.js)
[![Stripe](https://img.shields.io/badge/Stripe-suscripciones-635bff)](api/stripe/)

[Qué resuelve](#qué-resuelve) ·
[Lo que hace](#lo-que-hace) ·
[Multi-tenant y suscripción](#multi-tenant-desde-la-primera-consulta) ·
[Arrancarlo](#arrancarlo) ·
[API](#la-api)

</div>

---

## Qué resuelve

Un freelance o una empresa de tres personas no necesita Salesforce: necesita saber **a quién tiene
que llamar mañana** y **qué presupuestos siguen vivos**. Los CRM grandes cobran por asiento y
esconden esas dos respuestas detrás de quince pantallas de configuración; las hojas de cálculo no
avisan de nada.

CliCapt es el punto intermedio: un CRM en español, con pipeline de arrastrar y soltar, tareas que
te recuerdan solas por correo, e importación CSV que entiende cabeceras en español y en inglés
—porque los contactos siempre llegan exportados de otro sitio.

## Lo que hace

**Contactos.** CRUD validado con Zod, filtros por estado, fuente, etiquetas y búsqueda libre;
etiquetas con color; ficha con línea de tiempo de actividades y los deals asociados. Importación y
exportación **CSV con mapeo de cabeceras ES/EN**.

**Pipeline.** Tablero kanban con `@dnd-kit`: etapas configurables (nombre, color, orden) y deals
con valor, probabilidad y fecha estimada de cierre. Se mueven arrastrando o editando.

**Tareas.** Prioridad, asignación a miembros del equipo, vínculo opcional a un contacto o a un
deal, y **recordatorio diario por correo** de lo pendiente y lo vencido — un cron, no una
notificación que hay que ir a mirar.

**Dashboard.** Contactos, deals activos, valor del pipeline, tasa de conversión, embudo por etapa y
lo que toca hoy. Nada de gráficas decorativas.

**Configuración.** Perfil, organización, equipo con roles `admin`/`member`, etapas del pipeline y
gestión de la suscripción.

## Multi-tenant desde la primera consulta

Cada organización ve solo lo suyo, y eso **no** depende de que la pantalla filtre bien: hay un
middleware de tenant en `api/_lib/middleware/` por el que pasa toda petición autenticada, junto con
la verificación del JWT de **Auth0** (PKCE en el SPA), el rate limit y la validación Zod. Una ruta
nueva hereda las cuatro cosas por construcción.

El ciclo comercial también está en el código, no en un documento:

- **Trial** con banner de tres niveles de urgencia y avisos por correo a 7 días y a 1 día.
- **Bloqueo de escritura** al expirar — `SubscriptionGate`, `UpgradeWall` y `WriteGuard`. Los datos
  se siguen leyendo y exportando siempre: quien no paga no pierde su información.
- **Stripe Checkout** para los planes Básico (14,99 €/mes) y Pro (29,99 €/mes), **webhook** que
  sincroniza el estado de la suscripción con la base, y el **portal de facturación** de Stripe para
  cambiar de plan o cancelar sin pasar por soporte.

## Arrancarlo

```bash
npm install
cp .env.example .env     # Turso, Auth0, Stripe, Gmail
npm run migrate          # esquema
npm run seed             # datos de ejemplo (opcional)
npm run dev              # http://localhost:5173
```

`VITE_AUTH0_BYPASS=true` salta la autenticación en local. Para levantar también las funciones
serverless: `npm run dev:full` (necesita la CLI de Vercel).

| Comando | Qué hace |
|---|---|
| `npm test` | Vitest (unitarios) |
| `npm run test:e2e` | Playwright |
| `npm run lint` | ESLint 9, cero warnings admitidos |
| `npm run build` | Bundle de producción |

<details>
<summary>Variables de entorno</summary>

| Variable | Capa | Descripción |
|---|---|---|
| `TURSO_DATABASE_URL` · `TURSO_AUTH_TOKEN` | Backend | Base de datos |
| `AUTH0_DOMAIN` · `AUTH0_AUDIENCE` | Backend | Verificación del JWT |
| `VITE_AUTH0_DOMAIN` · `VITE_AUTH0_CLIENT_ID` · `VITE_AUTH0_AUDIENCE` | Frontend | SPA Auth0 |
| `VITE_AUTH0_BYPASS` | Frontend | `true` para saltar el login en local |
| `STRIPE_SECRET_KEY` · `STRIPE_PRICE_BASIC` · `STRIPE_PRICE_PRO` · `STRIPE_WEBHOOK_SECRET` | Backend | Cobros |
| `GMAIL_USER` · `GMAIL_APP_PASSWORD` | Backend | Envío de correo |
| `CRON_SECRET` | Backend | Autentica los cron de Vercel |
| `APP_URL` | Backend | URL base de producción |

La lista completa está en `.env.example`. Las `VITE_` llegan al navegador: nada secreto ahí.

</details>

## La api

Funciones serverless en `api/`, una carpeta por recurso. Todo endpoint —salvo el webhook de Stripe
y los cron— exige `Authorization: Bearer <token>`.

<details>
<summary>Endpoints</summary>

| Método | Ruta | Descripción |
|---|---|---|
| GET · PUT | `/api/me` | Perfil del usuario |
| POST | `/api/auth/callback` | Provisiona organización y usuario tras el login |
| GET · POST | `/api/contacts` | Listar (con filtros) y crear |
| GET · PUT · DELETE | `/api/contacts/[id]` | Detalle, actualizar, eliminar |
| GET | `/api/contacts/export` | Exportar a CSV |
| POST | `/api/contacts/import` | Importar desde CSV |
| GET · POST | `/api/deals` | Listar y crear |
| GET · PUT · PATCH · DELETE | `/api/deals/[id]` | Detalle, actualizar, mover de etapa, eliminar |
| GET · POST | `/api/tasks` | Listar y crear |
| PUT · PATCH | `/api/tasks/[id]` | Actualizar · completar |
| GET · POST | `/api/activities` | Línea de tiempo |
| GET · POST | `/api/tags` | Etiquetas |
| GET · PUT | `/api/pipeline/stages` | Etapas del pipeline |
| GET | `/api/dashboard` | KPIs y estadísticas |
| GET · PUT | `/api/organization` | Datos de la organización |
| GET · POST | `/api/organization/members` | Equipo e invitaciones |
| POST | `/api/stripe/create-checkout` · `/api/stripe/portal` | Alta y gestión de suscripción |
| POST | `/api/stripe/webhook` | Webhook de Stripe (sin auth, firma verificada) |
| GET | `/api/cron/trial-warnings` · `/api/cron/task-reminders` | Cron diarios |
| GET | `/api/health` | Health check |

</details>

## Desplegar

```bash
vercel --prod
```

Antes del primer despliegue: variables en el dashboard de Vercel, dos productos con precio mensual
en Stripe, el webhook apuntando a `https://<dominio>/api/stripe/webhook` con los eventos
`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted` e
`invoice.payment_failed`, y `CRON_SECRET` puesto. Los cron viven en `vercel.json`: avisos de trial
a las 09:00 UTC y recordatorios de tareas a las 08:00 UTC.

## Stack

**React 18** + Vite · React Router 6 · TanStack Query · Zustand · Tailwind · Recharts ·
**Vercel Serverless Functions** (Node 20) · **Turso** (libSQL) · **Auth0** · **Stripe** ·
Nodemailer · Zod · Vitest + Playwright.

Documentación en [`Docs/`](Docs/): [funcional](Docs/DocumentacionFuncional.md) ·
[técnica](Docs/DocumentacionTecnica.md) · [contratos de API](Docs/Contratos.md) ·
[guía de estilos](Docs/GuiaDeEstilos.md) · [plan de trabajo](Docs/PlanDeTrabajo.md).

## Licencia

Propietario — todos los derechos reservados.
