const MOTION_STORAGE_KEY = 'deepak-dh-2633115-v1-motion';

/**
 * Motion Preferences Manager
 * Respects OS prefers-reduced-motion and provides manual user toggle stored in localStorage.
 */
export function initMotion() {
  const toggleBtn = document.getElementById('motion-toggle');
  const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');

  let motion = !motionMedia.matches;
  try {
    const s = localStorage.getItem(MOTION_STORAGE_KEY);
    if (s !== null) motion = s === 'true' && !motionMedia.matches;
  } catch {}

  function applyMotion() {
    document.documentElement.classList.toggle('motion-paused', !motion);
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-pressed', String(motion));
      toggleBtn.innerHTML = `<span class="switch" aria-hidden="true"></span> Animation ${motion ? 'on' : 'off'}`;
    }
  }

  toggleBtn?.addEventListener('click', () => {
    motion = !motion;
    applyMotion();
    try {
      localStorage.setItem(MOTION_STORAGE_KEY, String(motion));
    } catch {}
  });

  motionMedia.addEventListener?.('change', (e) => {
    motion = !e.matches;
    applyMotion();
  });

  applyMotion();
}
