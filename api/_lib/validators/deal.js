// LeadFlow CRM — Validators — Deal schemas (Zod)

import { z } from "zod";

export const dealCreateSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(200),
  contact_id: z.string().min(1, "El contacto es obligatorio"),
  stage_id: z.string().min(1, "La etapa es obligatoria"),
  value: z.number().min(0, "El valor no puede ser negativo").optional(),
  expected_close: z.string().optional(),
  notes: z.string().max(5000).optional(),
  assigned_to: z.string().optional(),
});

export const dealUpdateSchema = dealCreateSchema.partial();

export const dealStageUpdateSchema = z.object({
  stage_id: z.string().min(1, "La etapa es obligatoria"),
  position: z.number().int().min(0).optional(),
});

export const dealReorderSchema = z.object({
  position: z.number().int().min(0),
});
