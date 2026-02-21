import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { FileQuestion } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface-app)",
        padding: "var(--space-4)",
        textAlign: "center",
      }}
    >
      <FileQuestion size={64} style={{ color: "var(--text-tertiary)", marginBottom: "var(--space-4)" }} />
      <h1 className="text-display" style={{ marginBottom: "var(--space-2)" }}>404</h1>
      <p className="text-body-sm" style={{ marginBottom: "var(--space-6)" }}>
        La página que buscas no existe.
      </p>
      <Button onClick={() => navigate("/dashboard")}>Ir al Dashboard</Button>
    </div>
  );
}
