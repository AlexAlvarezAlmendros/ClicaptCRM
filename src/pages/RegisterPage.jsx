import { useState } from "react";
import { useRegister } from "@alexalvarez.dev/react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Zap } from "lucide-react";

export default function RegisterPage() {
  const { register, isLoading, error } = useRegister();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password, name);
      navigate("/dashboard", { replace: true });
    } catch {
      // error is available via the hook
    }
  };

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
          Crear cuenta
        </h1>
        <p className="text-body-sm" style={{ marginBottom: "var(--space-8)" }}>
          Regístrate para empezar a gestionar tus contactos y ventas.
        </p>

        {error && (
          <p
            style={{
              color: "var(--color-danger-500)",
              fontSize: "var(--text-sm)",
              marginBottom: "var(--space-4)",
            }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <Input
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Contraseña (mín. 8 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />

          <Button
            variant="primary"
            size="lg"
            type="submit"
            disabled={isLoading}
            style={{ width: "100%", marginTop: "var(--space-2)" }}
          >
            {isLoading ? "Registrando…" : "Crear cuenta"}
          </Button>
        </form>

        <p
          className="text-caption"
          style={{ marginTop: "var(--space-4)" }}
        >
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" style={{ color: "var(--color-primary-500)", textDecoration: "none" }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
