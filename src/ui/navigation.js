/**
 * Navigation Manager
 * Handles sticky topbar, reading progress, active link, and mobile navigation drawer.
 */
export function initNavigation() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const progressBar = document.getElementById('reading-progress');
  const desktopLinks = Array.from(document.querySelectorAll('.desktop-nav a'));
  const mobileLinks = Array.from(document.querySelectorAll('#mobile-nav a'));

  mobileToggle?.addEventListener('click', () => {
    const isOpen = mobileNav?.classList.toggle('is-open');
    mobileToggle.setAttribute('aria-expanded', String(isOpen));
    mobileToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });

  mobileLinks.forEach(a => {
    a.addEventListener('click', () => {
      mobileNav?.classList.remove('is-open');
      mobileToggle?.setAttribute('aria-expanded', 'false');
      mobileToggle?.setAttribute('aria-label', 'Open navigation');
    });
  });

  let scrollTick = false;
  function updateScroll() {
    const dh = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) {
      progressBar.style.width = (dh ? (window.scrollY / dh) * 100 : 0) + '%';
    }

    let active = 'home';
    for (const id of ['home', 'readings', 'project', 'archive']) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < 190) {
        active = id;
      }
    }

    desktopLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + active);
    });

    scrollTick = false;
  }

  window.addEventListener('scroll', () => {
    if (!scrollTick) {
      scrollTick = true;
      requestAnimationFrame(updateScroll);
    }
  }, { passive: true });

  updateScroll();
}
