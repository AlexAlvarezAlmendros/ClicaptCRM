// LeadFlow CRM — Middleware — Centralized error handler

import { sendError } from "../utils/response.js";

/**
 * Wraps an API handler with centralized error handling.
 * Catches thrown errors and sends a standardized error response.
 *
 * @param {Function} handler - The API route handler function
 * @returns {Function} Wrapped handler with error catching
 */
export function withErrorHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error(`[error] ${req.method} ${req.url}:`, err);

      const status = err.status || 500;
      const code = err.code || "INTERNAL_ERROR";
      const message = err.message || "Error interno del servidor";
      const details = err.details || null;

      return sendError(res, status, code, message, details);
    }
  };
}
