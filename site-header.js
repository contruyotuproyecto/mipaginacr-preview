(() => {
  const header = document.querySelector('.mp-header');
  if (!header) return;
  const toggle = header.querySelector('.mp-header__toggle');
  const nav = header.querySelector('.mp-header__nav');
  const close = (restoreFocus = false) => {
    const wasOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    nav.classList.remove('is-open');
    if (wasOpen && restoreFocus && nav.contains(document.activeElement)) toggle.focus();
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.toggle('is-open', open);
    if (open) nav.querySelector('a')?.focus();
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(true); });
  document.addEventListener('click', event => { if (!header.contains(event.target)) close(); });
})();
