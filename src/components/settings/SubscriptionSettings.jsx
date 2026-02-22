import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { useOrganization } from "../../hooks/useOrganization";
import { useStripeCheckout, useStripePortal } from "../../hooks/useStripe";
import { CreditCard, ExternalLink } from "lucide-react";
import { PLANS } from "../../lib/constants";

const STATUS_MAP = {
  trialing: { label: "Periodo de prueba", variant: "warning" },
  active: { label: "Activa", variant: "success" },
  past_due: { label: "Pago pendiente", variant: "danger" },
  cancelled: { label: "Cancelada", variant: "neutral" },
  expired: { label: "Expirada", variant: "danger" },
};

export function SubscriptionSettings() {
  const { data, isLoading } = useOrganization();
  const checkout = useStripeCheckout();
  const portal = useStripePortal();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-8)" }}>
        <Spinner size={24} />
      </div>
    );
  }

  const org = data?.data || {};
  const planInfo = PLANS.find((p) => p.value === org.plan) || { label: org.plan || "Desconocido" };
  const status = STATUS_MAP[org.subscription_status] || STATUS_MAP.expired;
  const trialEnd = org.trial_ends_at ? new Date(org.trial_ends_at) : null;
  const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd - new Date()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Current plan */}
      <Card>
        <Card.Header>
          <Card.Title>Plan actual</Card.Title>
        </Card.Header>
        <Card.Body>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
            <CreditCard size={24} style={{ color: "var(--color-primary-500)" }} />
            <div>
              <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-weight-semibold)" }}>{planInfo.label}</p>
              <div style={{ display: "flex", gap: "var(--space-2)", marginTop: 4 }}>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            </div>
          </div>

          {org.subscription_status === "trialing" && (
            <div
              style={{
                padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--radius-md)",
                background: daysLeft <= 7 ? "var(--color-warning-50)" : "var(--surface-secondary)",
                border: daysLeft <= 7 ? "1px solid var(--color-warning-200)" : "none",
              }}
            >
              <p style={{
                fontSize: "var(--text-sm)",
                color: daysLeft <= 7 ? "var(--color-warning-700)" : "var(--text-secondary)",
                fontWeight: "var(--font-weight-medium)",
              }}>
                {daysLeft > 0
                  ? `Tu periodo de prueba termina en ${daysLeft} día${daysLeft !== 1 ? "s" : ""}.`
                  : "Tu periodo de prueba ha expirado."}
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Plans comparison */}
      <Card>
        <Card.Header>
          <Card.Title>Planes disponibles</Card.Title>
        </Card.Header>
        <Card.Body>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-4)" }}>
            {/* Basic */}
            <div
              style={{
                padding: "var(--space-4)",
                borderRadius: "var(--radius-lg)",
                border: org.plan === "basic" ? "2px solid var(--color-primary-500)" : "1px solid var(--border-default)",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-weight-bold)", marginBottom: "var(--space-1)" }}>Básico</p>
              <p style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-primary-500)" }}>14,99 €<span style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>/mes</span></p>
              <ul style={{ listStyle: "none", padding: 0, margin: "var(--space-4) 0", fontSize: "var(--text-sm)", textAlign: "left" }}>
                <li style={{ padding: "var(--space-1) 0" }}>✓ 3 miembros</li>
                <li style={{ padding: "var(--space-1) 0" }}>✓ 1.000 contactos</li>
                <li style={{ padding: "var(--space-1) 0" }}>✓ Pipeline ilimitado</li>
                <li style={{ padding: "var(--space-1) 0" }}>✓ Soporte email</li>
              </ul>
              <Button
                variant={org.plan === "basic" ? "secondary" : "primary"}
                size="sm"
                disabled={org.plan === "basic" || checkout.isPending}
                style={{ width: "100%" }}
                onClick={() => checkout.mutate("basic")}
              >
                {org.plan === "basic" ? "Plan actual" : checkout.isPending ? "Redirigiendo…" : "Elegir Básico"}
              </Button>
            </div>

            {/* Pro */}
            <div
              style={{
                padding: "var(--space-4)",
                borderRadius: "var(--radius-lg)",
                border: org.plan === "pro" ? "2px solid var(--color-primary-500)" : "1px solid var(--border-default)",
                textAlign: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--color-primary-500)",
                  color: "white",
                  padding: "2px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-xs)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Recomendado
              </div>
              <p style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-weight-bold)", marginBottom: "var(--space-1)" }}>Pro</p>
              <p style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-primary-500)" }}>29,99 €<span style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)" }}>/mes</span></p>
              <ul style={{ listStyle: "none", padding: 0, margin: "var(--space-4) 0", fontSize: "var(--text-sm)", textAlign: "left" }}>
                <li style={{ padding: "var(--space-1) 0" }}>✓ 10 miembros</li>
                <li style={{ padding: "var(--space-1) 0" }}>✓ Contactos ilimitados</li>
                <li style={{ padding: "var(--space-1) 0" }}>✓ Automatizaciones</li>
                <li style={{ padding: "var(--space-1) 0" }}>✓ Soporte prioritario</li>
              </ul>
              <Button
                variant={org.plan === "pro" ? "secondary" : "primary"}
                size="sm"
                disabled={org.plan === "pro" || checkout.isPending}
                style={{ width: "100%" }}
                onClick={() => checkout.mutate("pro")}
              >
                {org.plan === "pro" ? "Plan actual" : checkout.isPending ? "Redirigiendo…" : "Elegir Pro"}
              </Button>
            </div>
          </div>

          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-4)", textAlign: "center" }}>
            Los pagos se procesarán de forma segura con Stripe. Podrás gestionar tu suscripción en cualquier momento.
          </p>

          {/* Manage subscription portal (for existing subscribers) */}
          {org.stripe_customer_id && org.subscription_status === "active" && (
            <div style={{ textAlign: "center", marginTop: "var(--space-4)" }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => portal.mutate()}
                disabled={portal.isPending}
              >
                <ExternalLink size={14} style={{ marginRight: 6 }} />
                {portal.isPending ? "Abriendo…" : "Gestionar suscripción"}
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
