/**
 * Icon helper to render inline SVGs referencing the symbol defs
 * @param {string} name
 * @param {string} [cls]
 * @returns {string} SVG HTML string
 */
export function icon(name, cls = '') {
  return `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
}
