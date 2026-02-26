// LeadFlow CRM — Frontend Constants

export const CONTACT_SOURCES = [
  { value: "web", label: "Web" },
  { value: "referral", label: "Referido" },
  { value: "cold_call", label: "Llamada fría" },
  { value: "event", label: "Evento" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "import", label: "Importado" },
  { value: "other", label: "Otro" },
];

export const CONTACT_STATUSES = [
  { value: "new", label: "Nuevo" },
  { value: "contacted", label: "Contactado" },
  { value: "qualified", label: "Cualificado" },
  { value: "customer", label: "Cliente" },
  { value: "lost", label: "Perdido" },
];

export const TASK_PRIORITIES = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Media" },
  { value: "low", label: "Baja" },
];

export const ACTIVITY_TYPES = [
  { value: "call", label: "Llamada" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Reunión" },
  { value: "note", label: "Nota" },
];

export const PLANS = [
  { value: "trial", label: "Prueba gratuita" },
  { value: "basic", label: "Básico — 14,99 €/mes" },
  { value: "pro", label: "Pro — 29,99 €/mes" },
];
