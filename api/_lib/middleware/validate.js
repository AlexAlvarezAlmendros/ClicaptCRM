// LeadFlow CRM — Middleware — Zod validation helper

import { sendError } from "../utils/response.js";

/**
 * Validates request body against a Zod schema.
 * Returns parsed data or sends a 400 error response.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {object} data - Data to validate (usually req.body)
 * @returns {object} Parsed and validated data
 * @throws {{ status: 400, code: 'VALIDATION_ERROR', message: string, details: array }}
 */
export function validate(schema, data) {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    throw {
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Error de validación en los datos enviados",
      details,
    };
  }

  return parsed.data;
}
