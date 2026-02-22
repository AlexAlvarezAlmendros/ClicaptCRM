import { useAuth0 } from "@auth0/auth0-react";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { LogOut } from "lucide-react";

export function Header() {
  const { user, logout, isAuthenticated } = useAuth0();

  return (
    <header className="app-layout__header" role="banner">
      {/* Left side — page title (set via context/props) */}
      <div />

      {/* Right side — user info */}
      {isAuthenticated && user && (
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <Avatar src={user.picture} name={user.name || user.email} size={32} />
          <span
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
              color: "var(--text-primary)",
            }}
          >
            {user.name || user.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} />
          </Button>
        </div>
      )}
    </header>
  );
}
