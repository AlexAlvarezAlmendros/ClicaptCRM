import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "../ui/Button";
import { useSubscriptionGate } from "./SubscriptionGate";

/**
 * UpgradeWall — Inline message shown when a user tries a write action
 * while their subscription is expired. Can be used as:
 *
 *   {!canWrite && <UpgradeWall />}
 *
 * Or wrap content:
 *   <WriteGuard fallback={<UpgradeWall />}>
 *     <DealForm ... />
 *   </WriteGuard>
 */
export function UpgradeWall({ message }) {
  const navigate = useNavigate();
  const { gateReason } = useSubscriptionGate();

  return (
    <div className="upgrade-wall">
      <Lock size={20} className="upgrade-wall__icon" />
      <p className="upgrade-wall__text">{message || gateReason}</p>
      <Button
        variant="primary"
        size="sm"
        onClick={() => navigate("/configuracion?tab=subscription")}
      >
        Ver planes
      </Button>
    </div>
  );
}

/**
 * WriteGuard — Renders children only if canWrite is true,
 * otherwise shows fallback (defaults to UpgradeWall).
 */
export function WriteGuard({ children, fallback }) {
  const { canWrite, gateReason } = useSubscriptionGate();

  if (!canWrite) {
    return fallback || <UpgradeWall message={gateReason} />;
  }

  return children;
}
