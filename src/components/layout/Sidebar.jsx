import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Kanban,
  CheckSquare,
  Settings,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";

const navItems = [
  { to: "/dashboard",     icon: LayoutDashboard, label: "Dashboard" },
  { to: "/contactos",     icon: Users,           label: "Contactos" },
  { to: "/pipeline",      icon: Kanban,          label: "Pipeline" },
  { to: "/tareas",        icon: CheckSquare,     label: "Tareas" },
  { to: "/configuracion", icon: Settings,        label: "Configuración" },
];

export function Sidebar() {
  return (
    <>
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <Zap size={18} />
        </div>
        <span className="sidebar__logo-text">LeadFlow</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            <Icon className="sidebar__link-icon" />
            <span className="sidebar__link-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <ThemeToggle />
      </div>
    </>
  );
}
