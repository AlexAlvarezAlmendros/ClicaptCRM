// LeadFlow CRM — Utils — HTTP response helpers

/**
 * Send a successful JSON response.
 * @param {object} res - Express/Vercel response object
 * @param {number} status - HTTP status code
 * @param {*} data - Response data (object or array)
 */
export function sendSuccess(res, status, data) {
  return res.status(status).json({ data });
}

/**
 * Send an error JSON response.
 * @param {object} res - Express/Vercel response object
 * @param {number} status - HTTP status code
 * @param {string} code - Error code (e.g., 'VALIDATION_ERROR')
 * @param {string} message - Human-readable error message
 * @param {Array|null} details - Optional array of detail objects
 */
export function sendError(res, status, code, message, details = null) {
  const error = { code, message };
  if (details) error.details = details;
  return res.status(status).json({ error });
}
