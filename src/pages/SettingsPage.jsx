import { useState } from "react";
import { User, Building2, Kanban, Users, CreditCard } from "lucide-react";
import { ProfileSettings } from "../components/settings/ProfileSettings";
import { OrganizationSettings } from "../components/settings/OrganizationSettings";
import { TeamSettings } from "../components/settings/TeamSettings";
import { PipelineSettings } from "../components/settings/PipelineSettings";
import { SubscriptionSettings } from "../components/settings/SubscriptionSettings";

const TABS = [
  { key: "profile", label: "Perfil", icon: User },
  { key: "organization", label: "Organización", icon: Building2 },
  { key: "pipeline", label: "Pipeline", icon: Kanban },
  { key: "team", label: "Equipo", icon: Users },
  { key: "subscription", label: "Suscripción", icon: CreditCard },
];

const PANELS = {
  profile: ProfileSettings,
  organization: OrganizationSettings,
  pipeline: PipelineSettings,
  team: TeamSettings,
  subscription: SubscriptionSettings,
};

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const Panel = PANELS[tab];

  return (
    <div>
      <h1 className="text-h1" style={{ marginBottom: "var(--space-6)" }}>
        Configuración
      </h1>

      <div className="settings-layout">
        {/* Sidebar nav */}
        <nav className="settings-sidebar" aria-label="Configuración">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  all: "unset",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  padding: "var(--space-2) var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-sm)",
                  fontWeight: active ? "var(--font-weight-semibold)" : "var(--font-weight-medium)",
                  color: active ? "var(--color-primary-600)" : "var(--text-secondary)",
                  background: active ? "var(--color-primary-50)" : "transparent",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="settings-content">
          <Panel />
        </div>
      </div>
    </div>
  );
}
