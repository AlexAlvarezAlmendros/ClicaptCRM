# 📋 Plan de Trabajo — LeadFlow CRM

---

## Estado Actual del Proyecto

| Área | Progreso | Notas |
|------|----------|-------|
| **Infraestructura** (Vercel, Turso, Auth0) | ~90% | Deploy funcional, Auth0 login OK |
| **Backend API** | ~85% | 17 endpoints, 3 stubs (Stripe), 2 stubs (Cron) |
| **Frontend — Base** (UI components, hooks, stores, routing) | ~95% | 14 UI components, 9 hooks, 2 stores |
| **Frontend — Páginas funcionales** | ~25% | Páginas existen pero sin interactividad real |

---

## FASE 0 — Bugs Críticos en Producción *(bloqueantes)*

| # | Tarea | Prioridad | Estado |
|---|-------|-----------|--------|
| 0.1 | **Arreglar env vars de Vercel** — Las variables (`TURSO_DATABASE_URL`, `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`) tienen `\r\n` al final, lo que rompe todas las conexiones DB y autenticación. Eliminar y re-crear limpias. | 🔴 Crítica | ⬜ |
| 0.2 | **Eliminar `api/debug.js`** — Endpoint de diagnóstico temporal que expone info sensible. | 🟡 Media | ⬜ |

---

## FASE 1 — Contactos *(módulo core del CRM)*

| # | Tarea | Estado |
|---|-------|--------|
| 1.1 | `ContactForm.jsx` — Drawer con formulario crear/editar contacto (validación Zod) | ⬜ |
| 1.2 | `ContactFilters.jsx` — Filtros por estado, origen, tag | ⬜ |
| 1.3 | `ContactCard.jsx` — Vista tarjeta para móvil | ⬜ |
| 1.4 | `TagBadge.jsx` — Badge de etiqueta con color | ⬜ |
| 1.5 | Cablear `ContactsPage.jsx` — Conectar botón "Nuevo contacto", filtros, paginación, stores | ⬜ |
| 1.6 | Cablear `ContactDetailPage.jsx` — Botón editar, timeline de actividades, deals y tareas asociadas | ⬜ |

---

## FASE 2 — Pipeline / Kanban *(vista visual de ventas)*

| # | Tarea | Estado |
|---|-------|--------|
| 2.1 | `PipelineBoard.jsx` — Tablero Kanban con `@dnd-kit/core` y `@dnd-kit/sortable` | ⬜ |
| 2.2 | `PipelineColumn.jsx` — Columna de etapa con drop zone | ⬜ |
| 2.3 | `DealCard.jsx` — Tarjeta de oportunidad (valor, contacto, probabilidad) | ⬜ |
| 2.4 | `DealForm.jsx` — Drawer crear/editar oportunidad | ⬜ |
| 2.5 | `DealDetail.jsx` — Modal/Drawer con info completa, notas, historial | ⬜ |
| 2.6 | `PipelineAccordion.jsx` — Vista alternativa móvil (acordeón por etapas) | ⬜ |
| 2.7 | Cablear `PipelinePage.jsx` — Integrar componentes + drag & drop real | ⬜ |

---

## FASE 3 — Tareas *(gestión de seguimiento)*

| # | Tarea | Estado |
|---|-------|--------|
| 3.1 | `TaskItem.jsx` — Fila de tarea con toggle completar, prioridad, fecha | ⬜ |
| 3.2 | `TaskForm.jsx` — Drawer crear/editar tarea vinculada a contacto/deal | ⬜ |
| 3.3 | `TaskFilters.jsx` — Filtros por estado, prioridad, fecha | ⬜ |
| 3.4 | Cablear `TasksPage.jsx` — Botón nueva tarea, toggle completar con mutation, filtros | ⬜ |

---

## FASE 4 — Dashboard completo *(panel de métricas)*

| # | Tarea | Estado |
|---|-------|--------|
| 4.1 | `FunnelChart.jsx` — Gráfico de embudo de ventas con `recharts` | ⬜ |
| 4.2 | `RecentActivity.jsx` — Timeline de últimas 10-15 actividades del equipo | ⬜ |
| 4.3 | `TodayTasks.jsx` — Lista de tareas de hoy + vencidas con acción rápida | ⬜ |
| 4.4 | Completar `DashboardPage.jsx` — Integrar los 3 componentes + filtro por periodo | ⬜ |

---

## FASE 5 — Configuración *(perfil, empresa, equipo, pipeline)*

| # | Tarea | Estado |
|---|-------|--------|
| 5.1 | `ProfileSettings.jsx` — Editar nombre, avatar, datos personales | ⬜ |
| 5.2 | `OrganizationSettings.jsx` — Nombre empresa, logo, datos fiscales | ⬜ |
| 5.3 | `TeamSettings.jsx` — Lista de miembros + invitar (plan PRO) | ⬜ |
| 5.4 | `PipelineSettings.jsx` — Renombrar/añadir/eliminar etapas | ⬜ |
| 5.5 | `SubscriptionSettings.jsx` — Ver plan actual, botón cambiar plan | ⬜ |
| 5.6 | Cablear `SettingsPage.jsx` — Navegación a sub-páginas, rutas anidadas | ⬜ |
| 5.7 | API `PUT /api/pipeline/stages` — Implementar edición de etapas (actualmente 501) | ⬜ |
| 5.8 | API `POST /api/organization/members` — Implementar invitación de miembros (actualmente 501) | ⬜ |

---

## FASE 6 — Onboarding & Trial *(primera experiencia y conversión)*

| # | Tarea | Estado |
|---|-------|--------|
| 6.1 | `TrialBanner.jsx` — Banner persistente con días restantes + CTA a suscripción | ⬜ |
| 6.2 | `WelcomeTour.jsx` — Mini-tour para primer acceso ("Crea tu primer contacto") | ⬜ |
| 6.3 | Lógica de bloqueo post-trial — Solo lectura si suscripción expirada | ⬜ |

---

## FASE 7 — Stripe *(pagos y monetización)*

| # | Tarea | Estado |
|---|-------|--------|
| 7.1 | Implementar `stripeService.js` — `createCheckoutSession`, `createPortalSession`, `handleWebhook` | ⬜ |
| 7.2 | Implementar `api/stripe/create-checkout.js` — Sesión de Checkout | ⬜ |
| 7.3 | Implementar `api/stripe/webhook.js` — Actualizar plan/status en DB | ⬜ |
| 7.4 | Implementar `api/stripe/portal.js` — Portal de cliente para gestionar suscripción | ⬜ |
| 7.5 | Configurar productos/precios en Stripe Dashboard (test mode) | ⬜ |
| 7.6 | Conectar `SubscriptionSettings.jsx` con Stripe Checkout | ⬜ |

---

## FASE 8 — Cron Jobs & Emails *(automatización)*

| # | Tarea | Estado |
|---|-------|--------|
| 8.1 | Implementar `cron/trial-warnings.js` — Email 7 días y 1 día antes de fin trial | ⬜ |
| 8.2 | Implementar `cron/task-reminders.js` — Email recordatorio de tareas vencidas | ⬜ |
| 8.3 | Configurar Gmail App Password en Vercel env vars | ⬜ |

---

## FASE 9 — Pulido y Producción

| # | Tarea | Estado |
|---|-------|--------|
| 9.1 | Responsive completo — Verificar todas las páginas en mobile/tablet | ⬜ |
| 9.2 | Empty states en todas las listas (contactos, deals, tareas vacíos) | ⬜ |
| 9.3 | Error boundaries por módulo | ⬜ |
| 9.4 | Loading skeletons en vez de spinners genéricos | ⬜ |
| 9.5 | Importación/exportación CSV de contactos | ⬜ |
| 9.6 | Accesibilidad (WCAG AA) — labels, focus, contraste, keyboard nav | ⬜ |
| 9.7 | Tests unitarios (servicios backend) + tests de componentes | ⬜ |
| 9.8 | `README.md` con instrucciones de setup | ⬜ |

---

## Orden Recomendado de Ejecución

```
FASE 0 (30 min) → FASE 1 (1 día) → FASE 3 (0.5 día) → FASE 2 (1 día)
→ FASE 4 (0.5 día) → FASE 5 (1 día) → FASE 6 (0.5 día) → FASE 7 (1 día)
→ FASE 8 (0.5 día) → FASE 9 (1-2 días)
```

**Total estimado: 7-8 días de trabajo**

---

## Componentes que Faltan por Crear

### `src/components/contacts/` (6 archivos)
- `ContactForm.jsx`
- `ContactFilters.jsx`
- `ContactCard.jsx`
- `ContactDetail.jsx`
- `ContactList.jsx`
- `TagBadge.jsx`

### `src/components/pipeline/` (6 archivos JSX — solo existen CSS)
- `PipelineBoard.jsx`
- `PipelineColumn.jsx`
- `DealCard.jsx`
- `DealForm.jsx`
- `DealDetail.jsx`
- `PipelineAccordion.jsx`

### `src/components/tasks/` (4 archivos)
- `TaskList.jsx`
- `TaskItem.jsx`
- `TaskForm.jsx`
- `TaskFilters.jsx`

### `src/components/dashboard/` (3 archivos — solo `KpiCard` existe)
- `FunnelChart.jsx`
- `RecentActivity.jsx`
- `TodayTasks.jsx`

### `src/components/settings/` (5 archivos)
- `ProfileSettings.jsx`
- `OrganizationSettings.jsx`
- `TeamSettings.jsx`
- `PipelineSettings.jsx`
- `SubscriptionSettings.jsx`

### `src/components/onboarding/` (2 archivos)
- `WelcomeTour.jsx`
- `TrialBanner.jsx`

**Total: 26 componentes por crear**
