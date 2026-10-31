(() => {
  document.querySelectorAll('.inner-hero-motion-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const hero = button.closest('.page-lead, .blog-index-intro');
      if (!hero) return;
      const paused = hero.classList.toggle('is-paused');
      button.setAttribute('aria-pressed', String(paused));
      button.setAttribute('aria-label', paused ? 'Reanudar animación del titular' : 'Pausar animación del titular');
      hero.querySelectorAll('.rotator-word').forEach(word => { word.style.animationPlayState = paused ? 'paused' : 'running'; });
    });
  });
})();
