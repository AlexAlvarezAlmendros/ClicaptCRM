// LeadFlow CRM — Utils — Global constants

export const CONTACT_SOURCES = ["web", "referral", "cold_call", "event", "linkedin", "other"];
export const CONTACT_STATUSES = ["new", "contacted", "qualified", "customer", "lost"];
export const TASK_PRIORITIES = ["high", "medium", "low"];
export const USER_ROLES = ["admin", "user"];
export const PLAN_TYPES = ["trial", "basic", "pro", "cancelled"];
export const SUBSCRIPTION_STATUSES = ["trialing", "active", "past_due", "cancelled", "expired"];

export const ACTIVITY_TYPES = [
  "call",
  "email",
  "meeting",
  "note",
  "task_completed",
  "stage_change",
  "deal_created",
  "deal_won",
  "deal_lost",
];

export const DEFAULT_PIPELINE_STAGES = [
  { name: "Nuevo Lead",        color: "#3B82F6", probability: 10,  position: 1, is_won: false, is_lost: false },
  { name: "Contactado",        color: "#8B5CF6", probability: 25,  position: 2, is_won: false, is_lost: false },
  { name: "Propuesta Enviada", color: "#F59E0B", probability: 50,  position: 3, is_won: false, is_lost: false },
  { name: "Negociación",       color: "#F97316", probability: 75,  position: 4, is_won: false, is_lost: false },
  { name: "Ganado",            color: "#10B981", probability: 100, position: 5, is_won: true,  is_lost: false },
  { name: "Perdido",           color: "#EF4444", probability: 0,   position: 6, is_won: false, is_lost: true  },
];
