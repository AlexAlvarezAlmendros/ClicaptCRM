

# 🎨 Guía de Estilos — LeadFlow CRM

---

## 1. Principios de Diseño

```
┌─────────────────────────────────────────────────────────────────┐
│                   PRINCIPIOS FUNDAMENTALES                      │
├─────────────────┬───────────────────────────────────────────────┤
│  CLARIDAD       │ Cada elemento tiene un propósito. Sin ruido  │
│                 │ visual. El usuario sabe qué hacer en < 3s.   │
├─────────────────┼───────────────────────────────────────────────┤
│  PROFESIONALIDAD│ Tipografía sobria, colores contenidos,       │
│                 │ espaciado generoso. Inspira confianza.        │
├─────────────────┼───────────────────────────────────────────────┤
│  CONSISTENCIA   │ Mismos patrones visuales en toda la app.     │
│                 │ Un botón siempre es un botón.                 │
├─────────────────┼───────────────────────────────────────────────┤
│  EFICIENCIA     │ Mínimos clics. Acciones principales siempre  │
│                 │ visibles. Mobile = Desktop en funcionalidad.  │
├─────────────────┼───────────────────────────────────────────────┤
│  ELEGANCIA      │ Transiciones suaves, sombras sutiles,        │
│                 │ bordes redondeados. Moderno sin ser trendy.   │
└─────────────────┴───────────────────────────────────────────────┘
```

---

## 2. Sistema de Tokens CSS (Custom Properties)

Toda la interfaz se controla desde variables CSS. Cambiar un tema es cambiar un bloque de variables.

### 2.1 Archivo de Variables Principal

```css name=src/styles/tokens.css
/* ================================================================
   LEADFLOW CRM — Design Tokens
   Toda la UI se construye sobre estas variables.
   Para crear un tema nuevo, basta con redefinir este bloque.
   ================================================================ */

/* ────────────────────────────────────────────────────────────────
   TEMA CLARO (por defecto)
   ──────────────────────────────────────────────────────────────── */
:root {
  /* ─── Colores de marca ─── */
  --color-primary-50:  #EFF6FF;
  --color-primary-100: #DBEAFE;
  --color-primary-200: #BFDBFE;
  --color-primary-300: #93C5FD;
  --color-primary-400: #60A5FA;
  --color-primary-500: #3B82F6;   /* ← Principal */
  --color-primary-600: #2563EB;
  --color-primary-700: #1D4ED8;
  --color-primary-800: #1E40AF;
  --color-primary-900: #1E3A8A;

  /* ─── Escala de grises (Slate) ─── */
  --color-gray-25:  #FCFCFD;
  --color-gray-50:  #F8FAFC;
  --color-gray-100: #F1F5F9;
  --color-gray-200: #E2E8F0;
  --color-gray-300: #CBD5E1;
  --color-gray-400: #94A3B8;
  --color-gray-500: #64748B;
  --color-gray-600: #475569;
  --color-gray-700: #334155;
  --color-gray-800: #1E293B;
  --color-gray-900: #0F172A;
  --color-gray-950: #020617;

  /* ─── Colores semánticos ─── */
  --color-success-50:  #F0FDF4;
  --color-success-100: #DCFCE7;
  --color-success-500: #22C55E;
  --color-success-600: #16A34A;
  --color-success-700: #15803D;

  --color-warning-50:  #FFFBEB;
  --color-warning-100: #FEF3C7;
  --color-warning-500: #F59E0B;
  --color-warning-600: #D97706;
  --color-warning-700: #B45309;

  --color-danger-50:  #FEF2F2;
  --color-danger-100: #FEE2E2;
  --color-danger-500: #EF4444;
  --color-danger-600: #DC2626;
  --color-danger-700: #B91C1C;

  --color-info-50:  #EFF6FF;
  --color-info-100: #DBEAFE;
  --color-info-500: #3B82F6;
  --color-info-600: #2563EB;

  /* ─── Colores del Pipeline ─── */
  --color-pipeline-new:       #3B82F6;
  --color-pipeline-contacted: #8B5CF6;
  --color-pipeline-proposal:  #F59E0B;
  --color-pipeline-negotiation: #F97316;
  --color-pipeline-won:       #10B981;
  --color-pipeline-lost:      #EF4444;

  /* ─── Superficies y fondos ─── */
  --surface-app:         #F8FAFC;       /* Fondo general de la app */
  --surface-primary:     #FFFFFF;       /* Tarjetas, modales, sidebar */
  --surface-secondary:   #F1F5F9;       /* Fondos secundarios, hover suave */
  --surface-tertiary:    #E2E8F0;       /* Inputs deshabilitados, separadores */
  --surface-elevated:    #FFFFFF;       /* Dropdowns, tooltips, popovers */
  --surface-overlay:     rgba(15, 23, 42, 0.5);  /* Overlay de modales */
  --surface-sidebar:     #FFFFFF;
  --surface-kanban-col:  #F1F5F9;

  /* ─── Texto ─── */
  --text-primary:    #0F172A;           /* Títulos, texto principal */
  --text-secondary:  #475569;           /* Texto secundario, descripciones */
  --text-tertiary:   #94A3B8;           /* Placeholders, texto deshabilitado */
  --text-inverse:    #FFFFFF;           /* Texto sobre fondos oscuros */
  --text-link:       #2563EB;           /* Enlaces */
  --text-link-hover: #1D4ED8;
  --text-on-primary: #FFFFFF;           /* Texto sobre color primario */

  /* ─── Bordes ─── */
  --border-default:  #E2E8F0;
  --border-hover:    #CBD5E1;
  --border-focus:    #3B82F6;
  --border-error:    #EF4444;

  /* ─── Sombras ─── */
  --shadow-xs:   0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm:   0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-md:   0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg:   0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl:   0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  --shadow-focus-ring: 0 0 0 3px rgba(59, 130, 246, 0.3);
  --shadow-error-ring: 0 0 0 3px rgba(239, 68, 68, 0.3);

  /* ─── Tipografía ─── */
  --font-sans:  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono:  'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

  --text-xs:    0.75rem;     /* 12px */
  --text-sm:    0.875rem;    /* 14px */
  --text-base:  1rem;        /* 16px */
  --text-lg:    1.125rem;    /* 18px */
  --text-xl:    1.25rem;     /* 20px */
  --text-2xl:   1.5rem;      /* 24px */
  --text-3xl:   1.875rem;    /* 30px */
  --text-4xl:   2.25rem;     /* 36px */

  --leading-tight:  1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  --font-weight-normal:   400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;

  /* ─── Espaciado (8px grid) ─── */
  --space-0:   0;
  --space-0-5: 0.125rem;    /* 2px */
  --space-1:   0.25rem;     /* 4px */
  --space-1-5: 0.375rem;    /* 6px */
  --space-2:   0.5rem;      /* 8px */
  --space-3:   0.75rem;     /* 12px */
  --space-4:   1rem;        /* 16px */
  --space-5:   1.25rem;     /* 20px */
  --space-6:   1.5rem;      /* 24px */
  --space-8:   2rem;        /* 32px */
  --space-10:  2.5rem;      /* 40px */
  --space-12:  3rem;        /* 48px */
  --space-16:  4rem;        /* 64px */
  --space-20:  5rem;        /* 80px */
  --space-24:  6rem;        /* 96px */

  /* ─── Border radius ─── */
  --radius-none: 0;
  --radius-sm:   0.25rem;   /* 4px  */
  --radius-md:   0.5rem;    /* 8px  */
  --radius-lg:   0.75rem;   /* 12px */
  --radius-xl:   1rem;      /* 16px */
  --radius-2xl:  1.5rem;    /* 24px */
  --radius-full: 9999px;    /* Píldora / círculo */

  /* ─── Transiciones ─── */
  --transition-fast:   150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base:   200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow:   300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring: 400ms cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ─── Z-index ─── */
  --z-base:     1;
  --z-dropdown: 10;
  --z-sticky:   20;
  --z-drawer:   30;
  --z-modal:    40;
  --z-toast:    50;
  --z-tooltip:  60;

  /* ─── Layout ─── */
  --sidebar-width:           260px;
  --sidebar-width-collapsed: 72px;
  --header-height:           64px;
  --bottom-nav-height:       64px;
  --content-max-width:       1280px;
  --kanban-column-width:     300px;
  --kanban-column-min:       280px;
}


/* ────────────────────────────────────────────────────────────────
   TEMA OSCURO
   Se activa con [data-theme="dark"] en <html>
   ──────────────────────────────────────────────────────────────── */
[data-theme="dark"] {
  /* ─── Colores de marca (ajustados para contraste en oscuro) ─── */
  --color-primary-50:  #172554;
  --color-primary-100: #1E3A8A;
  --color-primary-200: #1D4ED8;
  --color-primary-300: #2563EB;
  --color-primary-400: #3B82F6;
  --color-primary-500: #60A5FA;   /* ← Principal en dark */
  --color-primary-600: #93C5FD;
  --color-primary-700: #BFDBFE;
  --color-primary-800: #DBEAFE;
  --color-primary-900: #EFF6FF;

  /* ─── Colores semánticos (ajustados) ─── */
  --color-success-50:  #052E16;
  --color-success-100: #14532D;
  --color-success-500: #22C55E;
  --color-success-600: #4ADE80;
  --color-success-700: #86EFAC;

  --color-warning-50:  #422006;
  --color-warning-100: #713F12;
  --color-warning-500: #F59E0B;
  --color-warning-600: #FBBF24;
  --color-warning-700: #FCD34D;

  --color-danger-50:  #450A0A;
  --color-danger-100: #7F1D1D;
  --color-danger-500: #EF4444;
  --color-danger-600: #F87171;
  --color-danger-700: #FCA5A5;

  /* ─── Superficies ─── */
  --surface-app:         #0B0F19;
  --surface-primary:     #111827;
  --surface-secondary:   #1E293B;
  --surface-tertiary:    #334155;
  --surface-elevated:    #1E293B;
  --surface-overlay:     rgba(0, 0, 0, 0.7);
  --surface-sidebar:     #111827;
  --surface-kanban-col:  #1E293B;

  /* ─── Texto ─── */
  --text-primary:    #F1F5F9;
  --text-secondary:  #94A3B8;
  --text-tertiary:   #64748B;
  --text-inverse:    #0F172A;
  --text-link:       #60A5FA;
  --text-link-hover: #93C5FD;
  --text-on-primary: #FFFFFF;

  /* ─── Bordes ─── */
  --border-default:  #1E293B;
  --border-hover:    #334155;
  --border-focus:    #60A5FA;
  --border-error:    #F87171;

  /* ─── Sombras (más sutiles en oscuro) ─── */
  --shadow-xs:   0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-sm:   0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4);
  --shadow-md:   0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
  --shadow-lg:   0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
  --shadow-xl:   0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
  --shadow-focus-ring: 0 0 0 3px rgba(96, 165, 250, 0.35);
  --shadow-error-ring: 0 0 0 3px rgba(248, 113, 113, 0.35);
}


/* ────────────────────────────────────────────────────────────────
   DETECCIÓN AUTOMÁTICA (preferencia del sistema)
   Se aplica si el usuario no ha elegido tema manualmente.
   ──────────────────────────────────────────────────────────────── */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* Aplica todas las variables de dark automáticamente */
    --surface-app:         #0B0F19;
    --surface-primary:     #111827;
    --surface-secondary:   #1E293B;
    --surface-tertiary:    #334155;
    --surface-elevated:    #1E293B;
    --surface-overlay:     rgba(0, 0, 0, 0.7);
    --surface-sidebar:     #111827;
    --surface-kanban-col:  #1E293B;

    --text-primary:    #F1F5F9;
    --text-secondary:  #94A3B8;
    --text-tertiary:   #64748B;
    --text-inverse:    #0F172A;
    --text-link:       #60A5FA;
    --text-link-hover: #93C5FD;

    --border-default:  #1E293B;
    --border-hover:    #334155;
    --border-focus:    #60A5FA;
    --border-error:    #F87171;

    --shadow-xs:   0 1px 2px 0 rgba(0, 0, 0, 0.3);
    --shadow-sm:   0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4);
    --shadow-md:   0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
    --shadow-lg:   0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
    --shadow-xl:   0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
    --shadow-focus-ring: 0 0 0 3px rgba(96, 165, 250, 0.35);
    --shadow-error-ring: 0 0 0 3px rgba(248, 113, 113, 0.35);

    --color-primary-500: #60A5FA;
    --color-success-500: #22C55E;
    --color-warning-500: #F59E0B;
    --color-danger-500:  #EF4444;
  }
}
```

---

## 3. Gestión del Tema (React)

### 3.1 Hook de Tema

```javascript name=src/hooks/useTheme.js
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "leadflow-theme";

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return "light";
    return localStorage.getItem(STORAGE_KEY) || "system";
  });

  const applyTheme = useCallback((value) => {
    const root = document.documentElement;

    if (value === "system") {
      root.removeAttribute("data-theme");
      localStorage.removeItem(STORAGE_KEY);
    } else {
      root.setAttribute("data-theme", value);
      localStorage.setItem(STORAGE_KEY, value);
    }
  }, []);

  const setTheme = useCallback((value) => {
    setThemeState(value);
    applyTheme(value);
  }, [applyTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Escuchar cambios del sistema (para modo "system")
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme("system");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [applyTheme]);

  return {
    theme,             // "light" | "dark" | "system"
    setTheme,
    isDark: theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches),
  };
}
```

### 3.2 Selector de Tema (Componente)

```jsx name=src/components/ui/ThemeToggle.jsx
import { useTheme } from "../../hooks/useTheme";
import { Sun, Moon, Monitor } from "lucide-react";

const options = [
  { value: "light",  icon: Sun,     label: "Claro" },
  { value: "dark",   icon: Moon,    label: "Oscuro" },
  { value: "system", icon: Monitor, label: "Sistema" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Seleccionar tema">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          className={`theme-toggle__btn ${theme === value ? "theme-toggle__btn--active" : ""}`}
          onClick={() => setTheme(value)}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  );
}
```

```css name=src/components/ui/ThemeToggle.css
.theme-toggle {
  display: inline-flex;
  gap: var(--space-0-5);
  padding: var(--space-0-5);
  background: var(--surface-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-default);
}

.theme-toggle__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.theme-toggle__btn:hover {
  color: var(--text-secondary);
  background: var(--surface-tertiary);
}

.theme-toggle__btn--active {
  color: var(--color-primary-500);
  background: var(--surface-primary);
  box-shadow: var(--shadow-xs);
}
```

---

## 4. Tipografía

### 4.1 Fuente Principal: Inter

```html name=index.html (head)
<!-- Google Fonts — Inter (variable font) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

### 4.2 Escala Tipográfica

```
ESCALA TIPOGRÁFICA — LEADFLOW CRM
══════════════════════════════════════════════════════════════

Display (solo landing)
  font-size:    var(--text-4xl)    → 36px
  font-weight:  var(--font-weight-bold)
  line-height:  var(--leading-tight)
  letter-spacing: -0.025em
  color:        var(--text-primary)

H1 — Título de página
  font-size:    var(--text-2xl)    → 24px
  font-weight:  var(--font-weight-semibold)
  line-height:  var(--leading-tight)
  letter-spacing: -0.02em
  color:        var(--text-primary)

H2 — Título de sección / tarjeta
  font-size:    var(--text-xl)     → 20px
  font-weight:  var(--font-weight-semibold)
  line-height:  var(--leading-tight)
  color:        var(--text-primary)

H3 — Subtítulo
  font-size:    var(--text-lg)     → 18px
  font-weight:  var(--font-weight-medium)
  line-height:  var(--leading-tight)
  color:        var(--text-primary)

Body — Texto principal
  font-size:    var(--text-base)   → 16px
  font-weight:  var(--font-weight-normal)
  line-height:  var(--leading-normal)
  color:        var(--text-primary)

Body Small — Texto secundario
  font-size:    var(--text-sm)     → 14px
  font-weight:  var(--font-weight-normal)
  line-height:  var(--leading-normal)
  color:        var(--text-secondary)

Caption — Metadatos, timestamps
  font-size:    var(--text-xs)     → 12px
  font-weight:  var(--font-weight-medium)
  line-height:  var(--leading-normal)
  color:        var(--text-tertiary)
  text-transform: none
  letter-spacing: 0.01em

Label — Labels de formularios
  font-size:    var(--text-sm)     → 14px
  font-weight:  var(--font-weight-medium)
  line-height:  var(--leading-normal)
  color:        var(--text-primary)

KPI Number — Números grandes del dashboard
  font-size:    var(--text-3xl)    → 30px
  font-weight:  var(--font-weight-bold)
  line-height:  var(--leading-tight)
  letter-spacing: -0.02em
  color:        var(--text-primary)
  font-variant-numeric: tabular-nums
```

### 4.3 Clases Tipográficas

```css name=src/styles/typography.css
/* ─── Headings ─── */
.text-display  { font-size: var(--text-4xl); font-weight: var(--font-weight-bold); line-height: var(--leading-tight); letter-spacing: -0.025em; color: var(--text-primary); }
.text-h1       { font-size: var(--text-2xl); font-weight: var(--font-weight-semibold); line-height: var(--leading-tight); letter-spacing: -0.02em; color: var(--text-primary); }
.text-h2       { font-size: var(--text-xl); font-weight: var(--font-weight-semibold); line-height: var(--leading-tight); color: var(--text-primary); }
.text-h3       { font-size: var(--text-lg); font-weight: var(--font-weight-medium); line-height: var(--leading-tight); color: var(--text-primary); }

/* ─── Body ─── */
.text-body     { font-size: var(--text-base); font-weight: var(--font-weight-normal); line-height: var(--leading-normal); color: var(--text-primary); }
.text-body-sm  { font-size: var(--text-sm); font-weight: var(--font-weight-normal); line-height: var(--leading-normal); color: var(--text-secondary); }
.text-caption  { font-size: var(--text-xs); font-weight: var(--font-weight-medium); line-height: var(--leading-normal); color: var(--text-tertiary); }

/* ─── Special ─── */
.text-label    { font-size: var(--text-sm); font-weight: var(--font-weight-medium); line-height: var(--leading-normal); color: var(--text-primary); }
.text-kpi      { font-size: var(--text-3xl); font-weight: var(--font-weight-bold); line-height: var(--leading-tight); letter-spacing: -0.02em; font-variant-numeric: tabular-nums; color: var(--text-primary); }
.text-link     { color: var(--text-link); text-decoration: none; transition: color var(--transition-fast); }
.text-link:hover { color: var(--text-link-hover); text-decoration: underline; }
```

---

## 5. Paleta de Color — Referencia Visual

```
PALETA PRINCIPAL
════════════════════════════════════════════════════════════════

Primary (Azul — Confianza, profesionalidad)
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ 50  │ 100 │ 200 │ 300 │ 400 │ 500★│ 600 │ 700 │ 800 │ 900 │
│#EFF │#DBE │#BFD │#93C │#60A │#3B8 │#256 │#1D4 │#1E4 │#1E3 │
│6FF  │AFE  │BFE  │5FD  │5FA  │2F6  │3EB  │ED8  │0AF  │A8A  │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘

Gray (Slate — Neutros elegantes)
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ 50  │ 100 │ 200 │ 300 │ 400 │ 500 │ 600 │ 700 │ 800 │ 900 │
│#F8F │#F1F │#E2E │#CBD │#94A │#647 │#475 │#334 │#1E2 │#0F1 │
│AFC  │5F9  │8F0  │5E1  │3B8  │48B  │569  │155  │93B  │72A  │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘

Semánticos
┌────────────┬──────────────┬──────────────┬──────────────┐
│ ✅ Success  │ ⚠️ Warning    │ ❌ Danger     │ ℹ️ Info       │
│ #22C55E    │ #F59E0B      │ #EF4444      │ #3B82F6      │
└────────────┴──────────────┴──────────────┴──────────────┘

Pipeline
┌────────┬────────┬────────┬────────┬────────┬────────┐
│Nuevo   │Contact.│Propuest│Negociac│Ganado  │Perdido │
│#3B82F6 │#8B5CF6 │#F59E0B │#F97316 │#10B981 │#EF4444 │
│  🔵    │  🟣    │  🟡    │  🟠    │  🟢    │  🔴    │
└────────┴────────┴────────┴────────┴────────┴────────┘
```

---

## 6. Iconografía

### 6.1 Librería: Lucide React

```
Librería elegida:  lucide-react
Motivo:            Consistente, limpio, ligero (tree-shakeable),
                   bien mantenido, 1000+ iconos, estilo stroke.
Tamaños estándar:  16px (inline), 20px (UI), 24px (nav), 32px (empty states)
Stroke:            2px (default)
Color:             currentColor (hereda del texto)
```

### 6.2 Iconos por Módulo

```
NAVEGACIÓN                    ACCIONES
────────────                  ────────
LayoutDashboard  → Dashboard  Plus          → Crear nuevo
Users            → Contactos  Search        → Buscar
Kanban           → Pipeline   Filter        → Filtrar
CheckSquare      → Tareas     MoreVertical  → Menú contextual
Settings         → Config     Pencil        → Editar
                              Trash2        → Eliminar
ACTIVIDADES                   Download      → Exportar
────────────                  Upload        → Importar
Phone            → Llamada    ChevronDown   → Desplegable
Mail             → Email      X             → Cerrar
Calendar         → Reunión    Check         → Confirmar
StickyNote       → Nota       ArrowLeft     → Volver
Clock            → Historial

ESTADO                        PIPELINE
──────                        ────────
CircleDot        → Nuevo      ArrowRight    → Mover etapa
CheckCircle2     → Completado GripVertical  → Drag handle
AlertCircle      → Alerta     Eye           → Ver detalle
XCircle          → Error/Lost TrendingUp    → KPI positivo
Star             → Destacado  TrendingDown  → KPI negativo
Bell             → Notificac.
```

---

## 7. Componentes UI — Catálogo

### 7.1 Botones

```css name=src/components/ui/Button.css
/* ─── BASE ─── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  user-select: none;
  text-decoration: none;
}

.btn:focus-visible {
  outline: none;
  box-shadow: var(--shadow-focus-ring);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* ─── TAMAÑOS ─── */
.btn--sm {
  height: 32px;
  padding: 0 var(--space-3);
  font-size: var(--text-xs);
  border-radius: var(--radius-md);
}

.btn--md {
  height: 40px;
  padding: 0 var(--space-4);
}

.btn--lg {
  height: 48px;
  padding: 0 var(--space-6);
  font-size: var(--text-base);
}

/* ─── VARIANTES ─── */

/* Primary — Acción principal */
.btn--primary {
  background: var(--color-primary-500);
  color: var(--text-on-primary);
  border-color: var(--color-primary-500);
}
.btn--primary:hover {
  background: var(--color-primary-600);
  border-color: var(--color-primary-600);
}
.btn--primary:active {
  background: var(--color-primary-700);
}

/* Secondary — Acción secundaria */
.btn--secondary {
  background: var(--surface-primary);
  color: var(--text-primary);
  border-color: var(--border-default);
}
.btn--secondary:hover {
  background: var(--surface-secondary);
  border-color: var(--border-hover);
}
.btn--secondary:active {
  background: var(--surface-tertiary);
}

/* Ghost — Acción terciaria, sin borde */
.btn--ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: transparent;
}
.btn--ghost:hover {
  background: var(--surface-secondary);
  color: var(--text-primary);
}

/* Danger — Acción destructiva */
.btn--danger {
  background: var(--color-danger-500);
  color: white;
  border-color: var(--color-danger-500);
}
.btn--danger:hover {
  background: var(--color-danger-600);
  border-color: var(--color-danger-600);
}

/* Link style */
.btn--link {
  background: transparent;
  color: var(--text-link);
  border: none;
  padding: 0;
  height: auto;
  font-weight: var(--font-weight-medium);
}
.btn--link:hover {
  color: var(--text-link-hover);
  text-decoration: underline;
}

/* Icon only */
.btn--icon {
  width: 40px;
  padding: 0;
}
.btn--icon.btn--sm { width: 32px; }
.btn--icon.btn--lg { width: 48px; }
```

```jsx name=src/components/ui/Button.jsx
import { forwardRef } from "react";
import { Spinner } from "./Spinner";

export const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",  // primary | secondary | ghost | danger | link
    size = "md",           // sm | md | lg
    iconOnly = false,
    isLoading = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    className = "",
    disabled,
    ...props
  },
  ref
) {
  const classes = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    iconOnly && "btn--icon",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Spinner size={size === "sm" ? 14 : 18} />
      ) : (
        <>
          {LeftIcon && <LeftIcon size={size === "sm" ? 14 : 18} />}
          {!iconOnly && children}
          {RightIcon && <RightIcon size={size === "sm" ? 14 : 18} />}
        </>
      )}
    </button>
  );
});
```

### 7.2 Inputs

```css name=src/components/ui/Input.css
/* ─── INPUT BASE ─── */
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1-5);
}

.input-label {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.input-label--required::after {
  content: " *";
  color: var(--color-danger-500);
}

.input {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-3);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-primary);
  background: var(--surface-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  outline: none;
}

.input::placeholder {
  color: var(--text-tertiary);
}

.input:hover {
  border-color: var(--border-hover);
}

.input:focus {
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus-ring);
}

.input--error {
  border-color: var(--border-error);
}

.input--error:focus {
  box-shadow: var(--shadow-error-ring);
}

.input-error-text {
  font-size: var(--text-xs);
  color: var(--color-danger-500);
  margin-top: var(--space-1);
}

.input-help-text {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

/* ─── Con icono ─── */
.input-icon-wrapper {
  position: relative;
}

.input-icon-wrapper .input {
  padding-left: var(--space-10);
}

.input-icon-wrapper .input-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
  pointer-events: none;
}

/* ─── Textarea ─── */
.textarea {
  min-height: 100px;
  padding: var(--space-3);
  resize: vertical;
  line-height: var(--leading-normal);
}
```

```jsx name=src/components/ui/Input.jsx
import { forwardRef } from "react";

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helpText,
    required = false,
    icon: Icon,
    className = "",
    id,
    ...props
  },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`input-label ${required ? "input-label--required" : ""}`}
        >
          {label}
        </label>
      )}

      <div className={Icon ? "input-icon-wrapper" : ""}>
        {Icon && <Icon size={18} className="input-icon" />}
        <input
          ref={ref}
          id={inputId}
          className={`input ${error ? "input--error" : ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>

      {error && (
        <span id={`${inputId}-error`} className="input-error-text" role="alert">
          {error}
        </span>
      )}
      {helpText && !error && (
        <span className="input-help-text">{helpText}</span>
      )}
    </div>
  );
});
```

### 7.3 Card

```css name=src/components/ui/Card.css
.card {
  background: var(--surface-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
  transition: box-shadow var(--transition-fast);
}

.card--hoverable:hover {
  box-shadow: var(--shadow-md);
}

.card--clickable {
  cursor: pointer;
}

.card--clickable:active {
  transform: scale(0.995);
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-default);
}

.card__title {
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.card__body {
  padding: var(--space-5);
}

.card__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--border-default);
}
```

### 7.4 Badge

```css name=src/components/ui/Badge.css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-0-5) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  line-height: 1.6;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

/* Variantes semánticas */
.badge--neutral  { background: var(--surface-secondary); color: var(--text-secondary); }
.badge--primary  { background: var(--color-primary-50);  color: var(--color-primary-700); }
.badge--success  { background: var(--color-success-50);  color: var(--color-success-700); }
.badge--warning  { background: var(--color-warning-50);  color: var(--color-warning-700); }
.badge--danger   { background: var(--color-danger-50);   color: var(--color-danger-700); }

/* Badge con dot (indicador de estado) */
.badge__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: currentColor;
}
```

### 7.5 KPI Card (Dashboard)

```css name=src/components/dashboard/KpiCard.css
.kpi-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-5) var(--space-6);
  background: var(--surface-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xs);
}

.kpi-card__label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.kpi-card__label-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: var(--color-primary-50);
  color: var(--color-primary-500);
}

.kpi-card__value {
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  margin-top: var(--space-1);
}

.kpi-card__trend {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  margin-top: var(--space-1);
}

.kpi-card__trend--up   { color: var(--color-success-600); }
.kpi-card__trend--down { color: var(--color-danger-600); }
```

### 7.6 Deal Card (Pipeline Kanban)

```css name=src/components/pipeline/DealCard.css
.deal-card {
  padding: var(--space-3) var(--space-4);
  background: var(--surface-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  cursor: grab;
  transition: all var(--transition-fast);
  user-select: none;
}

.deal-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-hover);
}

.deal-card:active {
  cursor: grabbing;
  box-shadow: var(--shadow-lg);
  transform: rotate(1.5deg);
}

/* Mientras se arrastra (clase añadida por dnd-kit) */
.deal-card--dragging {
  box-shadow: var(--shadow-xl);
  opacity: 0.9;
  transform: rotate(2deg) scale(1.02);
  z-index: var(--z-modal);
}

.deal-card__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.deal-card__company {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
}

.deal-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.deal-card__value {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-500);
  font-variant-numeric: tabular-nums;
}

.deal-card__date {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
```

---

## 8. Layout y Navegación

### 8.1 Layout General

```css name=src/components/layout/AppLayout.css
/* ─── LAYOUT PRINCIPAL ─── */
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--surface-app);
}

.app-layout__sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--surface-sidebar);
  border-right: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  z-index: var(--z-sticky);
  transition: width var(--transition-slow);
  overflow: hidden;
}

.app-layout__main {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left var(--transition-slow);
}

.app-layout__header {
  position: sticky;
  top: 0;
  height: var(--header-height);
  background: var(--surface-primary);
  border-bottom: 1px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  z-index: var(--z-sticky);
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.85);
}

[data-theme="dark"] .app-layout__header {
  background: rgba(17, 24, 39, 0.85);
}

.app-layout__content {
  flex: 1;
  padding: var(--space-6);
  max-width: var(--content-max-width);
  width: 100%;
}

/* ─── Pipeline: sin max-width, ocupa todo ─── */
.app-layout__content--full {
  max-width: none;
  padding: var(--space-4);
}


/* ─── SIDEBAR ─── */
.sidebar__logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-5);
  border-bottom: 1px solid var(--border-default);
}

.sidebar__logo-icon {
  width: 32px;
  height: 32px;
  background: var(--color-primary-500);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.sidebar__logo-text {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.sidebar__nav {
  flex: 1;
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2-5) var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  text-decoration: none;

  /* Custom property for vertical padding */
  --space-2-5: 0.625rem;
}

.sidebar__link:hover {
  background: var(--surface-secondary);
  color: var(--text-primary);
}

.sidebar__link--active {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
}

[data-theme="dark"] .sidebar__link--active {
  background: rgba(96, 165, 250, 0.1);
  color: var(--color-primary-500);
}

.sidebar__link-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidebar__footer {
  padding: var(--space-4);
  border-top: 1px solid var(--border-default);
}


/* ─── RESPONSIVE: TABLET ─── */
@media (max-width: 1024px) {
  .app-layout__sidebar {
    width: var(--sidebar-width-collapsed);
  }

  .app-layout__main {
    margin-left: var(--sidebar-width-collapsed);
  }

  .sidebar__logo-text,
  .sidebar__link-label {
    display: none;
  }

  .sidebar__link {
    justify-content: center;
    padding: var(--space-3);
  }
}


/* ─── RESPONSIVE: MÓVIL ─── */
@media (max-width: 768px) {
  .app-layout__sidebar {
    display: none;
  }

  .app-layout__main {
    margin-left: 0;
    padding-bottom: var(--bottom-nav-height);
  }

  .app-layout__content {
    padding: var(--space-4);
  }

  .app-layout__header {
    padding: 0 var(--space-4);
  }
}
```

### 8.2 Bottom Navigation (Móvil)

```css name=src/components/layout/BottomNav.css
.bottom-nav {
  display: none;
}

@media (max-width: 768px) {
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--bottom-nav-height);
    background: var(--surface-primary);
    border-top: 1px solid var(--border-default);
    display: flex;
    align-items: center;
    justify-content: space-around;
    z-index: var(--z-sticky);
    padding-bottom: env(safe-area-inset-bottom, 0px); /* Notch de iPhone */
  }

  .bottom-nav__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-0-5);
    padding: var(--space-1) var(--space-2);
    font-size: 10px;
    font-weight: var(--font-weight-medium);
    color: var(--text-tertiary);
    text-decoration: none;
    border: none;
    background: none;
    cursor: pointer;
    transition: color var(--transition-fast);
    -webkit-tap-highlight-color: transparent;
  }

  .bottom-nav__item--active {
    color: var(--color-primary-500);
  }

  .bottom-nav__item:active {
    transform: scale(0.92);
  }

  .bottom-nav__badge {
    position: absolute;
    top: -2px;
    right: -6px;
    min-width: 16px;
    height: 16px;
    font-size: 10px;
    font-weight: var(--font-weight-bold);
    background: var(--color-danger-500);
    color: white;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
  }
}
```

---

## 9. Pipeline Kanban — Estilos

```css name=src/components/pipeline/PipelineBoard.css
/* ─── TABLERO KANBAN ─── */
.pipeline-board {
  display: flex;
  gap: var(--space-4);
  height: calc(100vh - var(--header-height) - var(--space-8) - 60px);
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: var(--space-4);

  /* Scrollbar personalizado */
  scrollbar-width: thin;
  scrollbar-color: var(--border-hover) transparent;
}

.pipeline-board::-webkit-scrollbar {
  height: 6px;
}
.pipeline-board::-webkit-scrollbar-track {
  background: transparent;
}
.pipeline-board::-webkit-scrollbar-thumb {
  background: var(--border-hover);
  border-radius: var(--radius-full);
}


/* ─── COLUMNA ─── */
.pipeline-column {
  flex: 0 0 var(--kanban-column-width);
  min-width: var(--kanban-column-min);
  display: flex;
  flex-direction: column;
  background: var(--surface-kanban-col);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-default);
  overflow: hidden;
}

.pipeline-column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-default);
}

.pipeline-column__title-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.pipeline-column__color-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.pipeline-column__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.pipeline-column__count {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-tertiary);
  background: var(--surface-primary);
  padding: var(--space-0-5) var(--space-2);
  border-radius: var(--radius-full);
  min-width: 24px;
  text-align: center;
}

.pipeline-column__total {
  font-size: var(--text