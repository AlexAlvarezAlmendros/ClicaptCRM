import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Kanban,
  CheckSquare,
  Settings,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useUiStore } from "../../stores/uiStore";

const navItems = [
  { to: "/dashboard",     icon: LayoutDashboard, label: "Dashboard" },
  { to: "/contactos",     icon: Users,           label: "Contactos" },
  { to: "/pipeline",      icon: Kanban,          label: "Pipeline" },
  { to: "/tareas",        icon: CheckSquare,     label: "Tareas" },
  { to: "/configuracion", icon: Settings,        label: "Configuración" },
];

export function Sidebar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <>
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <Zap size={18} />
        </div>
        {sidebarOpen && <span className="sidebar__logo-text">LeadFlow</span>}
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav" aria-label="Navegación principal">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon className="sidebar__link-icon" />
            {sidebarOpen && <span className="sidebar__link-label">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <div style={{ display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "space-between" : "center", gap: "var(--space-2)" }}>
          {sidebarOpen && <ThemeToggle />}
          <button
            onClick={toggleSidebar}
            className="sidebar__toggle-btn"
            aria-label={sidebarOpen ? "Minimizar barra lateral" : "Expandir barra lateral"}
            title={sidebarOpen ? "Minimizar" : "Expandir"}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>
      </div>
    </>
  );
}
