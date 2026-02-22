import { useOrganization } from "../../hooks/useOrganization";
import { useNavigate } from "react-router-dom";
import { Clock, AlertTriangle, X } from "lucide-react";
import { useState } from "react";

/**
 * TrialBanner — Persistent banner showing trial days remaining.
 * Displayed inside AppLayout above the content area.
 * - Green/info style when > 7 days remain
 * - Warning (amber) when <= 7 days
 * - Danger (red) when <= 2 days or expired
 * - Hidden once the user has an active paid plan
 */
export function TrialBanner() {
  const { data: org, isLoading } = useOrganization();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (isLoading || !org || dismissed) return null;

  // Only show for trialing or expired orgs
  const status = org.subscription_status;
  const plan = org.plan;

  if (status === "active" && plan !== "trial") return null;
  if (status === "cancelled" && plan === "cancelled") return null;

  const trialEndsAt = org.trial_ends_at ? new Date(org.trial_ends_at) : null;
  const now = new Date();
  const daysRemaining = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24)))
    : 0;

  const isExpired = status === "expired" || (status === "trialing" && daysRemaining <= 0);
  const isUrgent = daysRemaining <= 2;
  const isWarning = daysRemaining <= 7;

  // Determine banner style
  let bannerClass = "trial-banner";
  let Icon = Clock;
  let message = "";
  let ctaText = "Ver planes";

  if (isExpired) {
    bannerClass += " trial-banner--danger";
    Icon = AlertTriangle;
    message = "Tu periodo de prueba ha expirado. Elige un plan para seguir usando LeadFlow.";
    ctaText = "Elegir plan";
  } else if (isUrgent) {
    bannerClass += " trial-banner--danger";
    Icon = AlertTriangle;
    message = `¡Solo ${daysRemaining === 1 ? "queda 1 día" : `quedan ${daysRemaining} días`} de prueba gratuita!`;
  } else if (isWarning) {
    bannerClass += " trial-banner--warning";
    message = `Te quedan ${daysRemaining} días de prueba gratuita.`;
  } else {
    bannerClass += " trial-banner--info";
    message = `Estás en periodo de prueba — ${daysRemaining} días restantes.`;
  }

  return (
    <div className={bannerClass} role="alert">
      <div className="trial-banner__content">
        <Icon size={16} className="trial-banner__icon" />
        <span className="trial-banner__message">{message}</span>
        <button
          className="trial-banner__cta"
          onClick={() => navigate("/configuracion?tab=subscription")}
        >
          {ctaText}
        </button>
      </div>
      {!isExpired && (
        <button
          className="trial-banner__close"
          onClick={() => setDismissed(true)}
          aria-label="Cerrar banner"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
