import { useState, useEffect } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Spinner } from "../ui/Spinner";
import { useToast } from "../ui/Toast";
import { useOrganization, useUpdateOrganization } from "../../hooks/useOrganization";

export function OrganizationSettings() {
  const { data, isLoading } = useOrganization();
  const updateOrg = useUpdateOrganization();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    fiscal_name: "",
    fiscal_id: "",
    address: "",
    city: "",
    postal_code: "",
    country: "",
  });

  useEffect(() => {
    if (data?.data) {
      const d = data.data;
      setForm({
        name: d.name || "",
        fiscal_name: d.fiscal_name || "",
        fiscal_id: d.fiscal_id || "",
        address: d.address || "",
        city: d.city || "",
        postal_code: d.postal_code || "",
        country: d.country || "España",
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
      await updateOrg.mutateAsync(form);
      addToast({ type: "success", message: "Organización actualizada" });
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

  return (
    <Card>
      <Card.Header>
        <Card.Title>Datos de la organización</Card.Title>
      </Card.Header>
      <Card.Body>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <Input label="Nombre de la empresa" name="name" value={form.name} onChange={handleChange} required />

          <div className="org-grid-2col">
            <Input label="Razón social" name="fiscal_name" value={form.fiscal_name} onChange={handleChange} />
            <Input label="CIF / NIF" name="fiscal_id" value={form.fiscal_id} onChange={handleChange} placeholder="B12345678" />
          </div>

          <Input label="Dirección" name="address" value={form.address} onChange={handleChange} />

          <div className="org-grid-3col">
            <Input label="Ciudad" name="city" value={form.city} onChange={handleChange} />
            <Input label="C.P." name="postal_code" value={form.postal_code} onChange={handleChange} />
            <Input label="País" name="country" value={form.country} onChange={handleChange} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" isLoading={updateOrg.isPending}>Guardar cambios</Button>
          </div>
        </form>
      </Card.Body>
    </Card>
  );
}
