

# 📋 Documentación Funcional — CRM para Captación B2B Local

Te preparo a continuación la documentación funcional completa para tu proyecto. He estructurado todo pensando en un MVP viable, escalable y orientado a PYMEs y autónomos.

---

## 1. Visión General del Producto

### 1.1 Nombre del Proyecto (provisional)
**LeadFlow CRM** *(puedes cambiarlo más adelante)*

### 1.2 Propósito
Plataforma web CRM diseñada para autónomos y pequeñas/medianas empresas que necesitan gestionar sus clientes potenciales (leads) de forma sencilla, clara y profesional. Orientado especialmente a la **captación B2B local**: negocios que venden servicios o productos a otros negocios de su zona.

### 1.3 Propuesta de Valor
| Diferenciador | Descripción |
|---|---|
| **Simplicidad radical** | Sin curva de aprendizaje. Un autónomo puede empezar a usarlo en menos de 5 minutos. |
| **Mobile-first** | La experiencia en móvil es igual de completa y útil que en escritorio. |
| **Enfoque local B2B** | Pensado para negocios que captan clientes en su zona geográfica. |
| **Precio accesible** | Modelo de suscripción con prueba gratuita de 1 mes, dirigido a quien no puede pagar Salesforce o HubSpot. |

### 1.4 Público Objetivo
- **Autónomos** que gestionan sus propios clientes (consultores, freelancers, comerciales).
- **Microempresas** (1-10 empleados) con equipo comercial pequeño.
- **PYMEs** (10-50 empleados) que necesitan organizar su pipeline de ventas.
- **Sectores típicos**: servicios profesionales, agencias, distribuidores, comercios B2B locales.

---

## 2. Modelo de Negocio

### 2.1 Estrategia de Monetización

```
┌─────────────────────────────────────────────────────────┐
│                   MODELO FREEMIUM + TRIAL               │
├─────────────────┬───────────────────┬───────────────────┤
│   TRIAL (1 mes) │   PLAN BÁSICO     │   PLAN PRO        │
│   Gratis        │   ~14,99€/mes     │   ~29,99€/mes     │
├─────────────────┼───────────────────┼───────────────────┤
│ Todas las       │ 1 usuario         │ Hasta 5 usuarios  │
│ funciones PRO   │ 500 contactos     │ Contactos ilimit. │
│ Sin compromiso  │ Pipeline básico   │ Multi-pipeline    │
│ Sin tarjeta     │ Soporte email     │ Informes avanzados│
│                 │                   │ Soporte priorit.  │
└─────────────────┴───────────────────┴───────────────────┘
```

> **Nota**: Los precios y límites son orientativos. Se definirán en detalle en la fase de go-to-market.

### 2.2 Ciclo de Vida del Usuario
```
Registro → Trial 30 días (todas las funciones) → Selección de plan → Suscripción activa → Renovación mensual/anual
```

---

## 3. Funcionalidades del MVP

### 3.1 Mapa de Módulos

```
┌──────────────────────────────────────────────────────────────┐
│                        LEADFLOW CRM                          │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  AUTH &   │ GESTIÓN  │ PIPELINE │ ACTIVIDAD│  DASHBOARD      │
│  USUARIOS │ CONTACTOS│ DE VENTAS│ & TAREAS │  & MÉTRICAS     │
├──────────┼──────────┼──────────┼──────────┼─────────────────┤
│• Registro│• CRUD    │• Kanban  │• Tareas  │• KPIs clave     │
│• Login   │• Búsqueda│• Etapas  │• Notas   │• Gráficos       │
│• Perfil  │• Filtros │• Drag&   │• Historial│• Embudo         │
│• Roles   │• Import  │  Drop    │• Recordat.│• Actividad rec. │
│          │• Tags    │• Valor € │          │                 │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
```

---

### 3.2 Módulo 1: Autenticación y Gestión de Usuarios

#### Funcionalidades

| ID | Funcionalidad | Descripción | Prioridad |
|----|--------------|-------------|-----------|
| AUTH-01 | Registro | Registro con email y contraseña. Activación por email. | 🔴 Alta |
| AUTH-02 | Login / Logout | Inicio de sesión con email/contraseña. Sesión persistente. | 🔴 Alta |
| AUTH-03 | Recuperar contraseña | Flujo de "olvidé mi contraseña" por email. | 🔴 Alta |
| AUTH-04 | Perfil de usuario | Editar nombre, avatar, datos de contacto. | 🟡 Media |
| AUTH-05 | Roles básicos | Admin (todo), Usuario (uso estándar). | 🟡 Media |
| AUTH-06 | Gestión de cuenta/empresa | Nombre empresa, logo, datos fiscales. | 🟡 Media |

#### Reglas de Negocio
- Un **registro** crea automáticamente una **organización** (tenant).
- El primer usuario registrado es **Admin** de esa organización.
- El Admin puede invitar a otros usuarios por email (Plan PRO).
- Las contraseñas deben tener mínimo 8 caracteres, 1 mayúscula y 1 número.
- La sesión expira tras 7 días de inactividad.

---

### 3.3 Módulo 2: Gestión de Contactos (Leads / Clientes)

#### Funcionalidades

| ID | Funcionalidad | Descripción | Prioridad |
|----|--------------|-------------|-----------|
| CON-01 | Crear contacto | Formulario con campos: nombre, empresa, email, teléfono, dirección, notas, origen, tags. | 🔴 Alta |
| CON-02 | Listado de contactos | Tabla/lista con búsqueda en tiempo real y paginación. | 🔴 Alta |
| CON-03 | Ficha de contacto | Vista detalle con toda la información, historial de actividad y oportunidades asociadas. | 🔴 Alta |
| CON-04 | Editar contacto | Modificar cualquier campo del contacto. | 🔴 Alta |
| CON-05 | Eliminar contacto | Eliminación con confirmación. Soft delete. | 🔴 Alta |
| CON-06 | Búsqueda y filtros | Filtrar por: nombre, empresa, tag, origen, etapa pipeline, fecha creación. | 🔴 Alta |
| CON-07 | Tags/Etiquetas | Crear, asignar y filtrar por etiquetas personalizadas de colores. | 🟡 Media |
| CON-08 | Origen del lead | Campo que indica de dónde vino el contacto (web, referido, llamada fría, evento, etc.). | 🟡 Media |
| CON-09 | Importación CSV | Importar contactos desde un archivo CSV. | 🟢 Baja |
| CON-10 | Exportación CSV | Exportar listado filtrado a CSV. | 🟢 Baja |

#### Modelo de Datos del Contacto

```
CONTACTO
├── id                  (UUID, auto)
├── nombre              (string, requerido)
├── apellidos           (string, opcional)
├── empresa             (string, opcional)
├── cargo               (string, opcional)
├── email               (string, opcional, validado)
├── teléfono            (string, opcional)
├── dirección           (string, opcional)
├── ciudad              (string, opcional)
├── código postal       (string, opcional)
├── país                (string, opcional, default: España)
├── origen              (enum: web, referido, llamada_fría, evento, linkedin, otro)
├── tags                (array de strings)
├── notas               (text, opcional)
├── estado              (enum: nuevo, contactado, cualificado, cliente, perdido)
├── asignado_a          (ref: usuario)
├── creado_por          (ref: usuario)
├── fecha_creación      (datetime, auto)
├── fecha_actualización (datetime, auto)
└── eliminado           (boolean, soft delete)
```

#### Reglas de Negocio
- Un contacto pertenece siempre a una **organización** (multi-tenant).
- El campo **email** debe ser único dentro de la misma organización.
- Al crear un contacto, su estado por defecto es **"nuevo"**.
- Los **tags** son libres y se crean al vuelo. Se sugieren los ya existentes.
- La **eliminación** es lógica (soft delete), con posibilidad de restaurar en 30 días.

---

### 3.4 Módulo 3: Pipeline de Ventas (Kanban)

#### Funcionalidades

| ID | Funcionalidad | Descripción | Prioridad |
|----|--------------|-------------|-----------|
| PIP-01 | Vista Kanban | Tablero visual con columnas que representan etapas del pipeline. Drag & drop. | 🔴 Alta |
| PIP-02 | Oportunidad de venta | Crear una oportunidad vinculada a un contacto con: título, valor (€), etapa, fecha estimada de cierre. | 🔴 Alta |
| PIP-03 | Mover oportunidad | Arrastrar tarjeta entre columnas para cambiar etapa. | 🔴 Alta |
| PIP-04 | Detalle de oportunidad | Al hacer clic, ver/editar toda la info, notas, tareas y actividad asociada. | 🔴 Alta |
| PIP-05 | Etapas por defecto | Etapas iniciales: Nuevo Lead → Contactado → Propuesta Enviada → Negociación → Ganado → Perdido. | 🔴 Alta |
| PIP-06 | Personalizar etapas | El Admin puede renombrar, añadir o eliminar etapas. | 🟡 Media |
| PIP-07 | Filtrar pipeline | Filtrar por: usuario asignado, rango de valor, fecha. | 🟡 Media |
| PIP-08 | Vista lista | Alternar entre vista Kanban y vista tabla/lista. | 🟢 Baja |

#### Modelo de Datos de la Oportunidad

```
OPORTUNIDAD
├── id                      (UUID, auto)
├── título                  (string, requerido)
├── contacto                (ref: contacto, requerido)
├── valor_estimado          (decimal, €, opcional)
├── etapa                   (ref: etapa del pipeline)
├── probabilidad            (%, auto según etapa)
├── fecha_cierre_estimada   (date, opcional)
├── fecha_cierre_real       (date, auto al ganar/perder)
├── motivo_pérdida          (string, opcional, si estado=perdido)
├── asignado_a              (ref: usuario)
├── notas                   (text)
├── creado_por              (ref: usuario)
├── fecha_creación          (datetime, auto)
├── fecha_actualización     (datetime, auto)
└── archivada               (boolean)
```

#### Etapas por Defecto y Probabilidad

```
┌────────────────┬───────────────┬────────────┐
│ Etapa          │ Probabilidad  │ Color      │
├────────────────┼───────────────┼────────────┤
│ Nuevo Lead     │ 10%           │ 🔵 Azul    │
│ Contactado     │ 25%           │ 🟣 Morado  │
│ Propuesta Env. │ 50%           │ 🟡 Amarillo│
│ Negociación    │ 75%           │ 🟠 Naranja │
│ Ganado         │ 100%          │ 🟢 Verde   │
│ Perdido        │ 0%            │ 🔴 Rojo    │
└────────────────┴───────────────┴────────────┘
```

#### Reglas de Negocio
- Una **oportunidad** siempre está vinculada a un **contacto**.
- Un contacto puede tener **múltiples oportunidades**.
- Al mover a **"Ganado"**, el estado del contacto cambia automáticamente a **"cliente"**.
- Al mover a **"Perdido"**, se solicita un **motivo de pérdida** (opcional pero recomendado).
- El **valor ponderado** se calcula como: `valor_estimado × probabilidad`.
- En móvil, el Kanban se navega con **scroll horizontal** o vista de **acordeón por etapas**.

---

### 3.5 Módulo 4: Actividad y Tareas

#### Funcionalidades

| ID | Funcionalidad | Descripción | Prioridad |
|----|--------------|-------------|-----------|
| ACT-01 | Registrar actividad | Registrar una interacción: llamada, email, reunión, nota manual. | 🔴 Alta |
| ACT-02 | Historial de actividad | Timeline cronológico en la ficha del contacto/oportunidad. | 🔴 Alta |
| ACT-03 | Crear tarea | Crear tarea con: título, descripción, fecha vencimiento, prioridad, vinculada a contacto/oportunidad. | 🔴 Alta |
| ACT-04 | Lista de tareas | Vista global de "Mis tareas" con filtros: pendientes, hoy, vencidas, completadas. | 🔴 Alta |
| ACT-05 | Completar tarea | Marcar tarea como completada. Se registra en el historial. | 🔴 Alta |
| ACT-06 | Recordatorios | Notificación visual (badge/banner) de tareas vencidas y del día. | 🟡 Media |

#### Modelo de Datos

```
ACTIVIDAD                           TAREA
├── id                              ├── id
├── tipo (llamada/email/reunión/    ├── título
│        nota/tarea_completada)     ├── descripción
├── descripción                     ├── fecha_vencimiento
├── contacto (ref)                  ├── prioridad (alta/media/baja)
├── oportunidad (ref, opcional)     ├── completada (boolean)
├── creado_por (ref: usuario)       ├── contacto (ref, opcional)
├── fecha_creación                  ├── oportunidad (ref, opcional)
└── organización (ref)              ├── asignado_a (ref: usuario)
                                    ├── creado_por (ref: usuario)
                                    ├── fecha_creación
                                    └── organización (ref)
```

---

### 3.6 Módulo 5: Dashboard y Métricas

#### Funcionalidades

| ID | Funcionalidad | Descripción | Prioridad |
|----|--------------|-------------|-----------|
| DASH-01 | Panel principal | Primera pantalla al hacer login. Resumen visual del estado comercial. | 🔴 Alta |
| DASH-02 | KPIs principales | Tarjetas con: leads nuevos (mes), oportunidades abiertas, valor total pipeline, tasa de conversión. | 🔴 Alta |
| DASH-03 | Gráfico de embudo | Visualización del funnel de ventas con nº de oportunidades por etapa. | 🟡 Media |
| DASH-04 | Actividad reciente | Lista de las últimas 10-15 acciones realizadas (por cualquier usuario del equipo). | 🟡 Media |
| DASH-05 | Tareas pendientes | Resumen de tareas de hoy y vencidas. | 🔴 Alta |
| DASH-06 | Filtro por periodo | Selector de rango de fechas para todos los KPIs (esta semana, este mes, trimestre, personalizado). | 🟡 Media |

#### KPIs del Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                     DASHBOARD - LEADFLOW CRM                    │
├────────────────┬────────────────┬────────────────┬──────────────┤
│  📊 Leads      │  💼 Oportunid. │  💰 Valor      │  📈 Tasa     │
│  nuevos (mes)  │  abiertas      │  pipeline      │  conversión  │
│     23         │     12         │   45.800€      │    18%       │
├────────────────┴────────────────┴────────────────┴──────────────┤
│  🔽 EMBUDO DE VENTAS                                            │
│  ████████████████████████████████  Nuevo Lead (18)              │
│  ██████████████████████            Contactado (12)              │
│  ████████████████                  Propuesta (8)                │
│  ████████████                      Negociación (5)              │
│  ████████                          Ganado (3)                   │
├─────────────────────────────────────────────────────────────────┤
│  📋 TAREAS DE HOY          │  🕐 ACTIVIDAD RECIENTE            │
│  ☐ Llamar a García S.L.   │  • Nota añadida en Pérez Corp     │
│  ☐ Enviar propuesta Acme  │  • Oportunidad movida a Negociac. │
│  ☑ Reunión con López       │  • Nuevo lead: María Torres       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Navegación y Estructura de Pantallas

### 4.1 Mapa de Navegación

```
┌──────────────────────────────────────────────────────────┐
│  SIDEBAR (escritorio) / BOTTOM NAV (móvil)               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🏠  Dashboard ──────────────── /dashboard               │
│                                                          │
│  👥  Contactos ──────────────── /contactos                │
│      ├── Lista ─────────────── /contactos                │
│      └── Ficha detalle ─────── /contactos/:id            │
│                                                          │
│  📊  Pipeline ──────────────── /pipeline                  │
│      └── Detalle oportunidad ─ /pipeline/:id (modal)     │
│                                                          │
│  ✅  Tareas ────────────────── /tareas                    │
│                                                          │
│  ⚙️  Configuración ─────────── /configuracion            │
│      ├── Mi perfil ─────────── /configuracion/perfil     │
│      ├── Empresa ───────────── /configuracion/empresa    │
│      ├── Equipo ────────────── /configuracion/equipo     │
│      ├── Pipeline ──────────── /configuracion/pipeline   │
│      └── Suscripción ───────── /configuracion/suscripcion│
│                                                          │
└──────────────────────────────────────────────────────────┘

PANTALLAS PÚBLICAS (sin autenticación):
  /login
  /registro
  /recuperar-contraseña
  /landing (página de producto, futura)
```

### 4.2 Comportamiento Responsive

| Elemento | Escritorio (>1024px) | Tablet (768-1024px) | Móvil (<768px) |
|---|---|---|---|
| **Navegación** | Sidebar lateral fija | Sidebar colapsable | Bottom navigation bar (5 iconos) |
| **Contactos** | Tabla con columnas | Tabla simplificada | Lista tipo tarjeta |
| **Pipeline** | Kanban completo | Kanban con scroll horizontal | Acordeón por etapas o Kanban horizontal con 1 columna visible |
| **Dashboard** | Grid 2×2 de KPIs + gráfico | Grid 2×2 + gráfico debajo | Stack vertical: KPIs → gráfico → tareas |
| **Formularios** | Modal lateral (drawer) | Modal lateral | Pantalla completa |

---

## 5. Flujos de Usuario Principales

### 5.1 Flujo de Registro y Onboarding

```
USUARIO                          SISTEMA
  │                                │
  ├─ Accede a /registro ──────────►│
  │                                ├─ Muestra formulario
  ├─ Rellena: nombre, email, ─────►│
  │  contraseña, nombre empresa    │
  │                                ├─ Valida datos
  │                                ├─ Crea organización
  │                                ├─ Crea usuario (rol: admin)
  │                                ├─ Inicia trial 30 días
  │                                ├─ Envía email verificación
  │◄── Redirige a /dashboard ──────┤
  │                                │
  │  (Primer acceso: mini-tour)    │
  │  "Bienvenido, crea tu primer   │
  │   contacto" → botón CTA        │
  │                                │
```

### 5.2 Flujo de Captación de Lead → Cierre

```
1. CREAR CONTACTO
   Usuario añade nuevo contacto (nombre, empresa, teléfono, origen)
                    │
2. CREAR OPORTUNIDAD
   Desde la ficha del contacto → "Nueva oportunidad"
   (título, valor estimado, fecha cierre)
   → Se crea en etapa "Nuevo Lead" del Pipeline
                    │
3. TRABAJAR EL LEAD
   ├─ Registrar llamada/email → se guarda en historial
   ├─ Crear tarea: "Enviar propuesta el viernes"
   ├─ Mover a "Contactado" en el Kanban
   │          │
4. ENVIAR PROPUESTA
   ├─ Registrar actividad: "Propuesta enviada"
   ├─ Mover a "Propuesta Enviada"
   ├─ Crear tarea: "Seguimiento en 3 días"
   │          │
5. NEGOCIACIÓN
   ├─ Mover a "Negociación"
   ├─ Actualizar valor si cambia
   │          │
6. CIERRE
   ├─ Mover a "Ganado" ✅
   │   → Contacto pasa a estado "Cliente" automáticamente
   │   → Se registra fecha_cierre_real
   │
   └─ Mover a "Perdido" ❌
       → Se pide motivo de pérdida
       → Contacto pasa a estado "Perdido"
```

---

## 6. Gestión de la Suscripción (MVP)

### 6.1 Flujo del Trial

```
┌─────────────┐    30 días    ┌──────────────────┐
│  REGISTRO   │──────────────►│  FIN DEL TRIAL   │
│  Trial activo│               │                  │
│  Todas las  │               │  ¿Suscribirse?   │
│  funciones  │               │  Sí → Plan activo │
│             │               │  No → Cuenta      │
│             │               │       limitada    │
└─────────────┘               └──────────────────┘
```

### 6.2 Comportamiento Post-Trial (sin suscripción)
- El usuario **puede hacer login** y **ver sus datos** (solo lectura).
- **No puede** crear nuevos contactos, oportunidades ni tareas.
- Se muestra un **banner persistente**: *"Tu periodo de prueba ha terminado. Suscríbete para seguir usando LeadFlow."*
- La pasarela de pago se integrará con **Stripe** (detalle en documentación técnica).

---

## 7. Notificaciones (MVP)

| Tipo | Canal | Descripción |
|---|---|---|
| Tarea vencida | In-app (badge) | Badge rojo en el icono de tareas + banner en dashboard. |
| Tarea de hoy | In-app | Listado en dashboard al entrar. |
| Fin de trial (7 días antes) | In-app + Email | Aviso de que quedan 7 días de prueba. |
| Fin de trial (día final) | In-app + Email | Último aviso con CTA a suscripción. |
| Bienvenida | Email | Email de confirmación de registro con enlace de verificación. |

> **Nota**: Las notificaciones push y por email transaccional avanzado se plantean como mejora futura (post-MVP).

---

## 8. Requisitos No Funcionales

| Categoría | Requisito |
|---|---|
| **Rendimiento** | Carga inicial < 3s. Interacciones < 300ms. |
| **Responsive** | Funcional y usable al 100% en pantallas desde 320px. |
| **Accesibilidad** | Cumplir WCAG 2.1 nivel AA (contraste, navegación por teclado, labels). |
| **Idioma** | Español (España) por defecto. Preparado para i18n futura. |
| **Seguridad** | HTTPS, tokens JWT, contraseñas hasheadas (bcrypt), protección CSRF/XSS. |
| **Multi-tenant** | Cada organización ve solo sus datos. Aislamiento total. |
| **Navegadores** | Chrome, Firefox, Safari, Edge (últimas 2 versiones). |
| **Hosting** | Vercel (frontend) + Vercel Serverless Functions o servicio externo (backend). |
| **Disponibilidad** | Objetivo 99.5% uptime. |

---

## 9. Roadmap de Funcionalidades Futuras (Post-MVP)

| Fase | Funcionalidades |
|---|---|
| **v1.1** | Integración con Stripe para pagos reales. Landing page pública. |
| **v1.2** | Notificaciones por email (recordatorios de tareas). Campos personalizados en contactos. |
| **v1.3** | Integración con Google Calendar. Múltiples pipelines. |
| **v2.0** | API pública. Integración con WhatsApp Business. Automatizaciones simples (si lead en etapa X > 7 días → crear tarea). |
| **v2.5** | Reportes avanzados exportables (PDF). Multi-idioma (EN, PT). App PWA instalable. |
| **v3.0** | Marketplace de integraciones. IA para scoring de leads. |

---

## 10. Glosario

| Término | Definición |
|---|---|
| **Lead** | Contacto potencial que aún no es cliente. |
| **Oportunidad** | Una posible venta asociada a un contacto, con un valor estimado. |
| **Pipeline** | Proceso visual de ventas dividido en etapas secuenciales. |
| **Kanban** | Tablero visual con columnas donde las tarjetas se mueven entre etapas. |
| **Tenant** | Organización/empresa. Cada tenant tiene sus datos aislados. |
| **Soft delete** | Eliminación lógica: el registro se marca como eliminado pero no se borra de la base de datos. |
| **Trial** | Periodo de prueba gratuita con acceso completo. |
| **Funnel/Embudo** | Representación visual de la conversión desde lead hasta cliente. |

---

## Próximos Pasos

Cuando estés listo, puedo prepararte:

1. **📐 Documentación Técnica** — Arquitectura del monolito (React + Node.js), estructura de carpetas, API REST, base de datos, autenticación, despliegue en Vercel, etc.
2. **🎨 Guía de Estilos** — Paleta de colores, tipografía, componentes UI, espaciado, iconografía, tokens de diseño y ejemplos visuales.

¿Quieres ajustar algo de esta documentación funcional antes de pasar a la parte técnica?