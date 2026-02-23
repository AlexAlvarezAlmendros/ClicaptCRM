import { useAuth } from "@alexalvarez.dev/react";
import { Navigate } from "react-router-dom";
import { Spinner } from "../ui/Spinner";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "var(--surface-app)",
        }}
      >
        <Spinner size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
