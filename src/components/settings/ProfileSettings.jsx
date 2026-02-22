import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Spinner } from "../ui/Spinner";
import { useToast } from "../ui/Toast";
import { useProfile, useUpdateProfile } from "../../hooks/useProfile";
import { User } from "lucide-react";

export function ProfileSettings() {
  const { data, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { addToast } = useToast();

  const [form, setForm] = useState({ name: "", surname: "", avatar_url: "" });

  useEffect(() => {
    if (data?.data) {
      setForm({
        name: data.data.name || "",
        surname: data.data.surname || "",
        avatar_url: data.data.avatar_url || "",
      });
    }
  }, [data]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(form);
      addToast({ type: "success", message: "Perfil actualizado" });
    } catch (err) {
      addToast({ type: "error", message: err.message || "Error al actualizar" });
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-8)" }}>
        <Spinner size={24} />
      </div>
    );
  }

  const profile = data?.data;

  return (
    <Card>
      <Card.Header>
        <Card.Title>Perfil personal</Card.Title>
      </Card.Header>
      <Card.Body>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "var(--radius-full)",
              background: "var(--surface-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <User size={28} style={{ color: "var(--text-tertiary)" }} />
            )}
          </div>
          <div>
            <p style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)" }}>
              {profile?.name} {profile?.surname || ""}
            </p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{profile?.email}</p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Rol: {profile?.role === "admin" ? "Administrador" : "Usuario"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Input label="Nombre" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Apellidos" name="surname" value={form.surname} onChange={handleChange} />
          <Input label="URL de avatar" name="avatar_url" value={form.avatar_url} onChange={handleChange} placeholder="https://..." />

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" isLoading={updateProfile.isPending}>Guardar cambios</Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
}
