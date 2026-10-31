(() => {
  const page = document.querySelector('.brix-projects main');
  const first = document.querySelector('#destacados');
  if (!page || !first || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const top = first.getBoundingClientRect().top + scrollY;
    const start = top + first.offsetHeight * .1;
    const end = top + first.offsetHeight * .8;
    const progress = Math.max(0, Math.min(1, (scrollY - start) / Math.max(1, end - start)));
    const mix = (a, b) => Math.round(a + (b - a) * progress);
    page.style.setProperty('--projects-bg', `rgb(${mix(248,24)} ${mix(250,24)} ${mix(252,27)})`);
    // Switch near the luminance crossover so captions remain legible throughout the scrub.
    page.style.setProperty('--projects-ink', progress < .58 ? '#1c1918' : '#f8fafc');
    page.style.setProperty('--projects-muted', progress < .58 ? '#4f5052' : '#c5cbce');
  };
  addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }, { passive: true });
  addEventListener('resize', update);
  update();
})();
