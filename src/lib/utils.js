// LeadFlow CRM — Frontend Utilities

/**
 * Merge class names (simple cn utility)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Build query string from params object
 */
export function buildQueryString(params) {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (filtered.length === 0) return "";
  return "?" + new URLSearchParams(filtered).toString();
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
