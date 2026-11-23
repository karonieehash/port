import { icon } from './icons.js';

const THEME_STORAGE_KEY = 'deepak-dh-2633115-v1-theme';

/**
 * Theme Manager (Dark / Light)
 * Preserves user preference in localStorage.
 */
export function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  let theme = document.documentElement.dataset.theme || 'dark';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) theme = stored;
  } catch {}

  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    if (toggleBtn) {
      toggleBtn.innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
      toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    }
    if (metaTheme) {
      metaTheme.content = theme === 'dark' ? '#10151b' : '#f4f3ed';
    }
  }

  toggleBtn?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme();
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  });

  applyTheme();
}
