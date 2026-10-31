(() => {
  const hero = document.querySelector('.hero--brix');
  const toggle = hero?.querySelector('.hero-motion-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const paused = hero.classList.toggle('is-paused');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Reanudar animación del titular' : 'Pausar animación del titular');
  });
})();
