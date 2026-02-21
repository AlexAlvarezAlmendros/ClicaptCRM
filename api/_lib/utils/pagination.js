// LeadFlow CRM — Utils — Pagination helpers

/**
 * Default pagination values.
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 25;
export const MAX_LIMIT = 100;

/**
 * Parse and sanitize pagination parameters from query string.
 * @param {object} query - Query parameters object
 * @returns {{ page: number, limit: number, offset: number }}
 */
export function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Build a pagination response object.
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {{ page: number, limit: number, total: number, totalPages: number }}
 */
export function buildPagination(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
