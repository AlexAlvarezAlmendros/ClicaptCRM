import { useState, useEffect } from "react";
import { Drawer } from "../ui/Drawer";
import { Input, Textarea } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { useCreateTask, useUpdateTask } from "../../hooks/useTasks";
import { useContacts } from "../../hooks/useContacts";
import { TASK_PRIORITIES } from "../../lib/constants";

const empty = {
  title: "",
  description: "",
  due_date: "",
  priority: "medium",
  contact_id: "",
};

export function TaskForm({ isOpen, onClose, task = null }) {
  const isEdit = !!task;
  const { addToast } = useToast();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: contactsData } = useContacts({ limit: 200 });

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setForm({
          title: task.title || "",
          description: task.description || "",
          due_date: task.due_date ? task.due_date.split("T")[0] : "",
          priority: task.priority || "medium",
          contact_id: task.contact_id || "",
        });
      } else {
        setForm({ ...empty });
      }
      setErrors({});
    }
  }, [isOpen, task]);

  const contacts = [
    { value: "", label: "— Sin contacto —" },
    ...(contactsData?.data?.contacts || contactsData?.data || []).map((c) => ({
      value: c.id,
      label: `${c.name}${c.surname ? ` ${c.surname}` : ""}`,
    })),
  ];

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = "El título es obligatorio";
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
      description: form.description.trim() || undefined,
      due_date: form.due_date || undefined,
      priority: form.priority,
      contact_id: form.contact_id || undefined,
    };

    try {
      if (isEdit) {
        await updateTask.mutateAsync({ id: task.id, data: payload });
        addToast({ type: "success", message: "Tarea actualizada" });
      } else {
        await createTask.mutateAsync(payload);
        addToast({ type: "success", message: "Tarea creada" });
      }
      onClose();
    } catch (err) {
      addToast({ type: "error", message: err.message || "Error al guardar" });
    }
  }

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={isEdit ? "Editar tarea" : "Nueva tarea"}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", padding: "var(--space-4)" }}>
        <Input
          label="Título *"
          name="title"
          value={form.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="Ej: Llamar a cliente para seguimiento"
        />

        <Textarea
          label="Descripción"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Detalles adicionales..."
          rows={3}
        />

        <Select
          label="Prioridad"
          name="priority"
          value={form.priority}
          onChange={handleChange}
          options={TASK_PRIORITIES}
        />

        <Input
          label="Fecha límite"
          name="due_date"
          type="date"
          value={form.due_date}
          onChange={handleChange}
        />

        <Select
          label="Contacto asociado"
          name="contact_id"
          value={form.contact_id}
          onChange={handleChange}
          options={contacts}
        />

        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end", marginTop: "var(--space-2)" }}>
          <Button variant="secondary" type="button" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isPending}>
            {isEdit ? "Guardar cambios" : "Crear tarea"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
