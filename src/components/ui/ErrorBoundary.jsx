import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

/**
 * Generic Error Boundary for React.
 * Catches JS errors in child components and shows a friendly fallback.
 *
 * Usage:
 *   <ErrorBoundary module="Contactos">
 *     <ContactsPage />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[ErrorBoundary${this.props.module ? ` — ${this.props.module}` : ""}]`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-12) var(--space-6)",
            textAlign: "center",
            minHeight: 300,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "var(--radius-2xl)",
              background: "var(--color-danger-50, #fef2f2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-danger-500, #ef4444)",
              marginBottom: "var(--space-4)",
            }}
          >
            <AlertTriangle size={28} />
          </div>
          <h3
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--text-primary)",
              marginBottom: "var(--space-2)",
            }}
          >
            Algo ha ido mal{this.props.module ? ` en ${this.props.module}` : ""}
          </h3>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
              maxWidth: 400,
              marginBottom: "var(--space-6)",
              lineHeight: 1.5,
            }}
          >
            Se ha producido un error inesperado. Puedes intentar recargar esta sección.
          </p>
          <Button variant="outline" leftIcon={RefreshCw} onClick={this.handleRetry}>
            Reintentar
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
