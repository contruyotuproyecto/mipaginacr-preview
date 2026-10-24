function restoreRequestedPositionAfterReload() {
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation?.type !== 'reload') return;

  const canControlRestoration = 'scrollRestoration' in history;
  const previousRestoration = canControlRestoration ? history.scrollRestoration : null;
  if (canControlRestoration) history.scrollRestoration = 'manual';

  const restorePosition = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      let target = null;
      if (location.hash.length > 1) {
        try {
          target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        } catch {}
        if (target && (target.closest('[hidden], [inert]') || target.getClientRects().length === 0)) target = null;
      }

      const root = document.documentElement;
      const previousScrollBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      const scrollPadding = Number.parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
      const scrollMargin = target ? Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0 : 0;
      const top = target ? Math.max(0, window.scrollY + target.getBoundingClientRect().top - Math.max(scrollPadding, scrollMargin)) : 0;
      try {
        window.scrollTo({ top, left: 0, behavior: 'instant' });
      } catch {
        window.scrollTo(0, top);
      }

      requestAnimationFrame(() => {
        root.style.scrollBehavior = previousScrollBehavior;
        if (canControlRestoration) history.scrollRestoration = previousRestoration;
      });
    }));
  };

  if (document.readyState === 'complete') restorePosition();
  else window.addEventListener('load', restorePosition, { once: true });
}

restoreRequestedPositionAfterReload();

const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuButton && navLinks) {
  const closeMenu = () => {
    navLinks.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
  };

  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    navLinks.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-shell')) closeMenu();
  });
}

if (document.body.classList.contains('service-page')) {
  const syncAmbient = () => document.body.classList.toggle('ambient-paused', document.hidden);
  document.addEventListener('visibilitychange', syncAmbient);
  syncAmbient();

  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const groups = document.querySelectorAll('.service-steps, .service-process-content ol');
    const reveal = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    groups.forEach((group) => {
      group.classList.add('is-observed');
      [...group.children].forEach((item) => reveal.observe(item));
    });
  }
}
