import { useState, useRef, useEffect } from "react";
import { Input, Textarea } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { Drawer } from "../ui/Drawer";
import { TagBadge } from "./TagBadge";
import { CONTACT_SOURCES, CONTACT_STATUSES } from "../../lib/constants";
import { useCreateContact, useUpdateContact } from "../../hooks/useContacts";
import { useGroups } from "../../hooks/useGroups";
import { useToast } from "../ui/Toast";
import { Plus } from "lucide-react";

const EMPTY_FORM = {
  name: "",
  surname: "",
  company: "",
  job_title: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  postal_code: "",
  country: "España",
  source: "",
  notes: "",
  status: "new",
  group_id: "",
  tags: [],
};

export function ContactForm({ isOpen, onClose, contact = null }) {
  const isEdit = !!contact;
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");
  const nameRef = useRef(null);

  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const { data: groupsData } = useGroups();
  const groups = groupsData?.data || [];
  const groupOptions = groups.map((g) => ({ value: String(g.id), label: g.name }));
  const { addToast } = useToast();

  const isLoading = createContact.isPending || updateContact.isPending;

  useEffect(() => {
    if (isOpen) {
      if (contact) {
        setForm({
          name: contact.name || "",
          surname: contact.surname || "",
          company: contact.company || "",
          job_title: contact.job_title || "",
          email: contact.email || "",
          phone: contact.phone || "",
          address: contact.address || "",
          city: contact.city || "",
          postal_code: contact.postal_code || "",
          country: contact.country || "España",
          source: contact.source || "",
          notes: contact.notes || "",
          status: contact.status || "new",
          group_id: contact.group_id ? String(contact.group_id) : "",
          tags: contact.tags?.map((t) => (typeof t === "string" ? t : t.name)) || [],
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
      setTagInput("");
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [isOpen, contact]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput("");
    }
  }

  function removeTag(tagName) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tagName) }));
  }

  function handleTagKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = "El nombre es obligatorio";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Email no válido";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = { ...form };
    // Clean empty strings to undefined
    Object.keys(payload).forEach((k) => {
      if (payload[k] === "") payload[k] = undefined;
    });
    // Convert group_id to number or null
    payload.group_id = payload.group_id ? Number(payload.group_id) : null;

    try {
      if (isEdit) {
        await updateContact.mutateAsync({ id: contact.id, data: payload });
        addToast({ type: "success", message: "Contacto actualizado" });
      } else {
        await createContact.mutateAsync(payload);
        addToast({ type: "success", message: "Contacto creado" });
      }
      onClose();
    } catch (err) {
      if (err.details) {
        const fieldErrors = {};
        err.details.forEach((d) => {
          if (d.path) fieldErrors[d.path[0]] = d.message;
        });
        setErrors(fieldErrors);
      } else {
        addToast({ type: "error", message: err.message || "Error al guardar" });
      }
    }
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Editar contacto" : "Nuevo contacto"}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {/* Name row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
          <Input
            ref={nameRef}
            label="Nombre"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            required
          />
          <Input
            label="Apellidos"
            name="surname"
            value={form.surname}
            onChange={handleChange}
          />
        </div>

        {/* Company row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
          <Input
            label="Empresa"
            name="company"
            value={form.company}
            onChange={handleChange}
          />
          <Input
            label="Cargo"
            name="job_title"
            value={form.job_title}
            onChange={handleChange}
          />
        </div>

        {/* Contact info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />
          <Input
            label="Teléfono"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        {/* Address */}
        <Input
          label="Dirección"
          name="address"
          value={form.address}
          onChange={handleChange}
        />
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "var(--space-3)" }}>
          <Input
            label="Ciudad"
            name="city"
            value={form.city}
            onChange={handleChange}
          />
          <Input
            label="Código postal"
            name="postal_code"
            value={form.postal_code}
            onChange={handleChange}
          />
          <Input
            label="País"
            name="country"
            value={form.country}
            onChange={handleChange}
          />
        </div>

        {/* Source & Status */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
          <Select
            label="Origen"
            name="source"
            value={form.source}
            onChange={handleChange}
            options={CONTACT_SOURCES}
            placeholder="Seleccionar..."
          />
          {isEdit && (
            <Select
              label="Estado"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={CONTACT_STATUSES}
            />
          )}
        </div>

        {/* Group */}
        <div style={{ maxWidth: "50%" }}>
          <Select
            label="Grupo"
            name="group_id"
            value={form.group_id}
            onChange={handleChange}
            options={groupOptions}
            placeholder="Sin grupo"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="input-label">Etiquetas</label>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", marginBottom: "var(--space-2)" }}>
            <Input
              name="tagInput"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Añadir etiqueta..."
              style={{ flex: 1 }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              iconOnly
              onClick={addTag}
              disabled={!tagInput.trim()}
              aria-label="Añadir etiqueta"
            >
              <Plus size={16} />
            </Button>
          </div>
          {form.tags.length > 0 && (
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              {form.tags.map((tag) => (
                <TagBadge key={tag} name={tag} onRemove={() => removeTag(tag)} />
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <Textarea
          label="Notas"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Información adicional..."
        />

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            justifyContent: "flex-end",
            paddingTop: "var(--space-4)",
            borderTop: "1px solid var(--border-default)",
            marginTop: "var(--space-2)",
          }}
        >
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEdit ? "Guardar cambios" : "Crear contacto"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
