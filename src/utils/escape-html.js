/**
 * Escapes HTML characters to prevent XSS.
 * @param {*} value - Raw input string or value
 * @returns {string} Escaped string safe for HTML interpolation
 */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

export const esc = escapeHtml;
