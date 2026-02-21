import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-h1" style={{ marginBottom: "var(--space-6)" }}>
        Configuración
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        {[
          { title: "Perfil", description: "Tu información personal y preferencias." },
          { title: "Organización", description: "Datos de tu empresa y equipo." },
          { title: "Pipeline", description: "Configura las etapas del pipeline." },
          { title: "Equipo", description: "Gestiona los miembros de tu equipo." },
          { title: "Suscripción", description: "Tu plan actual y facturación." },
        ].map((item) => (
          <div key={item.title} className="card card--hoverable card--clickable">
            <div className="card__body">
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
                <Settings size={20} style={{ color: "var(--text-tertiary)" }} />
                <h3 className="text-h3">{item.title}</h3>
              </div>
              <p className="text-body-sm">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
