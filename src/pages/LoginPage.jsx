import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "../components/ui/Button";
import { Zap } from "lucide-react";

export default function LoginPage() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface-app)",
        padding: "var(--space-4)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--surface-primary)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          padding: "var(--space-10) var(--space-8)",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--radius-xl)",
            background: "var(--color-primary-500)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            margin: "0 auto var(--space-6)",
          }}
        >
          <Zap size={28} />
        </div>

        <h1 className="text-h1" style={{ marginBottom: "var(--space-2)" }}>
          LeadFlow CRM
        </h1>
        <p className="text-body-sm" style={{ marginBottom: "var(--space-8)" }}>
          Gestiona tus contactos y oportunidades de venta de forma eficiente.
        </p>

        <Button
          variant="primary"
          size="lg"
          onClick={() => loginWithRedirect()}
          style={{ width: "100%" }}
        >
          Iniciar sesión
        </Button>

        <p
          className="text-caption"
          style={{ marginTop: "var(--space-4)" }}
        >
          ¿Primera vez? Se creará tu cuenta automáticamente.
        </p>
      </div>
    </div>
  );
}
