/**
 * Community Edition — local Coffee title (no COFFEE_HUB / registry).
 * @param {HTMLElement | null} el
 */
export function initCommunityCoffeeTitle(el) {
  if (!el) return;
  el.textContent = 'Coffee.';
  el.classList.add('ce-hub-coffee-title');
}
