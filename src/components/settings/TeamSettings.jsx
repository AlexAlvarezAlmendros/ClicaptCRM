import { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";
import { Spinner } from "../ui/Spinner";
import { useToast } from "../ui/Toast";
import { useOrganizationMembers, useInviteMember } from "../../hooks/useOrganization";
import { UserPlus, Shield, User } from "lucide-react";

export function TeamSettings() {
  const { data, isLoading } = useOrganizationMembers();
  const inviteMember = useInviteMember();
  const { addToast } = useToast();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", name: "", role: "user" });

  const members = data?.data || [];

  function handleChange(e) {
    const { name, value } = e.target;
    setInviteForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleInvite(e) {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.name) return;

    try {
      await inviteMember.mutateAsync(inviteForm);
      addToast({ type: "success", message: `${inviteForm.name} añadido al equipo` });
      setInviteForm({ email: "", name: "", role: "user" });
      setShowInvite(false);
    } catch (err) {
      addToast({ type: "error", message: err.message || "Error al invitar" });
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-8)" }}>
        <Spinner size={24} />
      </div>
    );
  }

  return (
    <Card>
      <Card.Header>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <Card.Title>Equipo ({members.length})</Card.Title>
          <Button size="sm" leftIcon={UserPlus} onClick={() => setShowInvite(!showInvite)}>
            Añadir miembro
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {/* Invite form */}
        {showInvite && (
          <form
            onSubmit={handleInvite}
            style={{
              display: "flex",
              gap: "var(--space-3)",
              alignItems: "flex-end",
              marginBottom: "var(--space-4)",
              padding: "var(--space-4)",
              background: "var(--surface-secondary)",
              borderRadius: "var(--radius-lg)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 180px" }}>
              <Input label="Nombre" name="name" value={inviteForm.name} onChange={handleChange} required placeholder="Nombre completo" />
            </div>
            <div style={{ flex: "1 1 200px" }}>
              <Input label="Email" name="email" type="email" value={inviteForm.email} onChange={handleChange} required placeholder="email@empresa.com" />
            </div>
            <div style={{ flex: "0 0 140px" }}>
              <Select
                label="Rol"
                name="role"
                value={inviteForm.role}
                onChange={handleChange}
                options={[
                  { value: "user", label: "Usuario" },
                  { value: "admin", label: "Admin" },
                ]}
              />
            </div>
            <Button type="submit" size="sm" isLoading={inviteMember.isPending}>Invitar</Button>
          </form>
        )}

        {/* Members list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {members.map((member) => (
            <div
              key={member.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-3)",
                borderRadius: "var(--radius-md)",
                background: "var(--surface-secondary)",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-full)",
                  background: "var(--surface-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <User size={16} style={{ color: "var(--text-tertiary)" }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)" }}>
                  {member.name} {member.surname || ""}
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{member.email}</p>
              </div>
              <Badge variant={member.role === "admin" ? "primary" : "neutral"}>
                {member.role === "admin" ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Shield size={12} /> Admin
                  </span>
                ) : (
                  "Usuario"
                )}
              </Badge>
              <Badge variant={member.is_active ? "success" : "neutral"}>
                {member.is_active ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
