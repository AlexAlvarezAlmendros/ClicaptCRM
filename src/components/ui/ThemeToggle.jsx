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
