import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Kanban, CheckSquare, Settings } from "lucide-react";

const navItems = [
  { to: "/dashboard",     icon: LayoutDashboard, label: "Dashboard" },
  { to: "/contactos",     icon: Users,           label: "Contactos" },
  { to: "/pipeline",      icon: Kanban,          label: "Pipeline" },
  { to: "/tareas",        icon: CheckSquare,     label: "Tareas" },
  { to: "/configuracion", icon: Settings,        label: "Config" },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""}`
          }
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
