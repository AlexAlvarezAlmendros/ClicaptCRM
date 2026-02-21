// LeadFlow CRM — Validators — Contact schemas (Zod)

import { z } from "zod";

export const contactCreateSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  surname: z.string().max(100).optional(),
  company: z.string().max(200).optional(),
  job_title: z.string().max(100).optional(),
  email: z.string().email("Email no válido").optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  postal_code: z.string().max(10).optional(),
  country: z.string().max(60).optional(),
  source: z.enum(["web", "referral", "cold_call", "event", "linkedin", "other"]).optional(),
  notes: z.string().max(5000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  assigned_to: z.string().optional(),
});

export const contactUpdateSchema = contactCreateSchema.partial();
