import { useState, useEffect } from "react";
import { Drawer } from "../ui/Drawer";
import { Input, Textarea } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { useCreateDeal, useUpdateDeal } from "../../hooks/useDeals";
import { useContacts } from "../../hooks/useContacts";
import { usePipelineStages } from "../../hooks/usePipelineStages";

const empty = {
  title: "",
  contact_id: "",
  stage_id: "",
  value: "",
  expected_close: "",
  notes: "",
};

export function DealForm({ isOpen, onClose, deal = null, defaultStageId = "" }) {
  const isEdit = !!deal;
  const { addToast } = useToast();
  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const { data: contactsData } = useContacts({ limit: 200 });
  const { data: stagesData } = usePipelineStages();

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (deal) {
        setForm({
          title: deal.title || "",
          contact_id: deal.contact_id || "",
          stage_id: deal.stage_id || "",
          value: deal.value != null ? String(deal.value) : "",
          expected_close: deal.expected_close ? deal.expected_close.split("T")[0] : "",
          notes: deal.notes || "",
        });
      } else {
        setForm({ ...empty, stage_id: defaultStageId });
      }
      setErrors({});
    }
  }, [isOpen, deal, defaultStageId]);

  const contacts = (contactsData?.data?.contacts || contactsData?.data || []).map((c) => ({
    value: c.id,
    label: `${c.name}${c.surname ? ` ${c.surname}` : ""}${c.company ? ` — ${c.company}` : ""}`,
  }));

  const stages = (stagesData?.data || []).map((s) => ({
    value: s.id,
    label: s.name,
  }));

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = "El título es obligatorio";
    if (!form.contact_id) errs.contact_id = "Selecciona un contacto";
    if (!form.stage_id) errs.stage_id = "Selecciona una etapa";
    if (form.value && isNaN(Number(form.value))) errs.value = "Debe ser un número";
    if (form.value && Number(form.value) < 0) errs.value = "No puede ser negativo";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      title: form.title.trim(),
      contact_id: form.contact_id,
      stage_id: form.stage_id,
      value: form.value ? Number(form.value) : 0,
      expected_close: form.expected_close || undefined,
      notes: form.notes.trim() || undefined,
    };

    try {
      if (isEdit) {
        await updateDeal.mutateAsync({ id: deal.id, data: payload });
        addToast({ type: "success", message: "Oportunidad actualizada" });
      } else {
        await createDeal.mutateAsync(payload);
        addToast({ type: "success", message: "Oportunidad creada" });
      }
      onClose();
    } catch (err) {
      addToast({ type: "error", message: err.message || "Error al guardar" });
    }
  }

  const isPending = createDeal.isPending || updateDeal.isPending;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={isEdit ? "Editar oportunidad" : "Nueva oportunidad"}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", padding: "var(--space-4)" }}>
        <Input
          label="Título *"
          name="title"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Ej: Proyecto web corporativa"
        />

        <Select
          label="Contacto *"
          name="contact_id"
          value={form.contact_id}
          onChange={handleChange}
          error={errors.contact_id}
          placeholder="Seleccionar contacto"
          options={contacts}
        />

        <Select
          label="Etapa *"
          name="stage_id"
          value={form.stage_id}
          onChange={handleChange}
          error={errors.stage_id}
          placeholder="Seleccionar etapa"
          options={stages}
        />

        <Input
          label="Valor (€)"
          name="value"
          type="number"
          min="0"
          step="0.01"
          value={form.value}
          onChange={handleChange}
          error={errors.value}
          placeholder="0.00"
        />

        <Input
          label="Cierre esperado"
          name="expected_close"
          type="date"
          value={form.expected_close}
          onChange={handleChange}
        />

        <Textarea
          label="Notas"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Notas internas..."
          rows={3}
        />

        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
          <Button variant="secondary" type="button" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isPending}>
            {isEdit ? "Guardar cambios" : "Crear oportunidad"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
