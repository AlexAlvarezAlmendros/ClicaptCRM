import { createContext, useContext } from "react";
import { useOrganization } from "../../hooks/useOrganization";
import { useProfile } from "../../hooks/useProfile";

/**
 * SubscriptionGate context.
 * Provides `canWrite` (boolean) and `gateReason` (string|null) to the entire app.
 *
 * When the tenant is expired (trial ended + no paid plan), canWrite = false
 * and all create/edit/delete actions should be disabled.
 */
const SubscriptionGateContext = createContext({
  canWrite: true,
  gateReason: null,
  plan: "trial",
  subscriptionStatus: "trialing",
  trialDaysLeft: null,
  isLoading: true,
});

export function SubscriptionGateProvider({ children }) {
  const { data: org, isLoading: orgLoading } = useOrganization();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const isLoading = orgLoading || profileLoading;

  const isAdmin = profile?.role === "admin";

  let canWrite = true;
  let gateReason = null;
  let plan = "trial";
  let subscriptionStatus = "trialing";
  let trialDaysLeft = null;

  if (org) {
    plan = org.plan || "trial";
    subscriptionStatus = org.subscription_status || "trialing";

    const trialEndsAt = org.trial_ends_at ? new Date(org.trial_ends_at) : null;
    if (trialEndsAt) {
      trialDaysLeft = Math.max(0, Math.ceil((trialEndsAt - new Date()) / (1000 * 60 * 60 * 24)));
    }

    if (!isAdmin) {
      const isExpired =
        import.meta.env.VITE_BYPASS_SUBSCRIPTION !== "true" &&
        (subscriptionStatus === "expired" ||
        (subscriptionStatus === "trialing" && trialDaysLeft !== null && trialDaysLeft <= 0));

      if (isExpired) {
        canWrite = false;
        gateReason = "Tu periodo de prueba ha expirado. Elige un plan para continuar.";
      }

      if (subscriptionStatus === "cancelled") {
        canWrite = false;
        gateReason = "Tu suscripción está cancelada. Reactívala para continuar.";
      }
    }
  }

  return (
    <SubscriptionGateContext.Provider
      value={{ canWrite, gateReason, plan, subscriptionStatus, trialDaysLeft, isLoading }}
    >
      {children}
    </SubscriptionGateContext.Provider>
  );
}

/**
 * Hook to read subscription gate status.
 * Use `canWrite` to conditionally disable buttons, forms, DnD, etc.
 */
export function useSubscriptionGate() {
  return useContext(SubscriptionGateContext);
}
