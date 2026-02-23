import { useEffect } from "react";
import { useAuth } from "@alexalvarez.dev/react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../components/ui/Spinner";
import { apiClient } from "../lib/api";
import { useToken } from "../hooks/useToken";

export default function CallbackPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const getToken = useToken();
  const navigate = useNavigate();

  useEffect(() => {
    async function syncUser() {
      if (!isAuthenticated) return;
      try {
        const token = await getToken();
        await apiClient.post("/api/auth/callback", { email: user?.email, name: user?.name }, token);
      } catch {
        // User may already exist — continue
      }
      navigate("/dashboard", { replace: true });
    }

    if (!isLoading) {
      syncUser();
    }
  }, [isAuthenticated, isLoading, getToken, user, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface-app)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <Spinner size={40} />
        <p className="text-body-sm" style={{ marginTop: "var(--space-4)" }}>
          Preparando tu cuenta...
        </p>
      </div>
    </div>
  );
}
