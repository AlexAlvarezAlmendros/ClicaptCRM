import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@alexalvarez.dev/react";
import { Spinner } from "../components/ui/Spinner";

// Module-level: survives React StrictMode remounts (new component instance),
// but resets on every full-page reload — which is exactly what Google's OAuth
// redirect triggers. This is the only reliable guard against double-execution.
let activeCode = null;

export default function GoogleCallbackPage() {
  const { handleCallback } = useGoogleLogin();
  const navigate = useNavigate();
  const [callbackError, setCallbackError] = useState(null);

  const handleCallbackRef = useRef(handleCallback);
  handleCallbackRef.current = handleCallback;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleError = params.get("error");
    const code = params.get("code");

    if (googleError || !code) {
      navigate("/login", { replace: true });
      return;
    }

    // StrictMode mounts → unmounts → remounts with a fresh component instance
    // (new useRef, new state). Module-level activeCode persists through that,
    // so the second invocation with the same code is safely skipped.
    if (activeCode === code) return;
    activeCode = code;

    handleCallbackRef.current(code)
      .then(() => {
        navigate("/callback", { replace: true });
      })
      .catch((err) => {
        activeCode = null; // allow retry if user goes back and tries again
        const msg = err?.message || "Error desconocido al procesar el login con Google";
        console.error("[GoogleCallback]", msg);
        setCallbackError(msg);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (callbackError) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--surface-app)",
      }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: "var(--space-8)" }}>
          <p style={{ color: "var(--color-danger-500)", fontSize: "var(--text-sm)", marginBottom: "var(--space-4)" }}>
            Error al iniciar sesión con Google: <strong>{callbackError}</strong>
          </p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            style={{
              color: "var(--color-primary-500)", background: "none", border: "none",
              cursor: "pointer", fontSize: "var(--text-sm)", textDecoration: "underline",
            }}
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--surface-app)",
    }}>
      <div style={{ textAlign: "center" }}>
        <Spinner size={40} />
        <p className="text-body-sm" style={{ marginTop: "var(--space-4)" }}>
          Procesando login con Google…
        </p>
      </div>
    </div>
  );
}
