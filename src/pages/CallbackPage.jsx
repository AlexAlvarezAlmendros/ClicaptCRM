import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../components/ui/Spinner";
import { apiClient } from "../lib/api";

export default function CallbackPage() {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    async function syncUser() {
      if (!isAuthenticated) return;
      try {
        const token = await getAccessTokenSilently();
        // Send user email from Auth0 profile as fallback (access tokens may not include it)
        await apiClient.post("/api/auth/callback", { email: user?.email, name: user?.name }, token);
      } catch {
        // User may already exist — continue
      }
      navigate("/dashboard", { replace: true });
    }

    if (!isLoading) {
      syncUser();
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently, user, navigate]);

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
