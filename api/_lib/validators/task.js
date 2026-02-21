// LeadFlow CRM — Validators — Task schemas (Zod)

import { z } from "zod";

export const taskCreateSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(200),
  description: z.string().max(2000).optional(),
  due_date: z.string().optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  contact_id: z.string().optional(),
  deal_id: z.string().optional(),
  assigned_to: z.string().optional(),
});

export const taskUpdateSchema = taskCreateSchema.partial();
