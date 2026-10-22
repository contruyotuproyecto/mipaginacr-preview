(() => {
  const hero = document.querySelector('[data-hero-carousel]');
  const image = hero?.querySelector('[data-hero-image]');
  const template = hero?.querySelector('template[data-hero-slides]');
  if (!hero || !image || !template) return;

  const slides = [
    { src: image.getAttribute('src'), alt: image.alt },
    ...[...template.content.querySelectorAll('img')].map((slide) => ({ src: slide.getAttribute('src'), alt: slide.alt })),
  ].filter((slide) => slide.src);
  if (slides.length < 2) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const overlay = document.createElement('img');
  overlay.className = 'hero-transition-layer';
  overlay.alt = '';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.decoding = 'async';
  hero.append(overlay);

  let index = 0;
  let timer = 0;
  let inView = !('IntersectionObserver' in window);
  let changing = false;
  const loaded = new Map();

  const preload = (slideIndex) => {
    if (loaded.has(slideIndex)) return loaded.get(slideIndex);
    const request = new Image();
    request.src = slides[slideIndex].src;
    loaded.set(slideIndex, request);
    return request;
  };

  const shouldRun = () => inView && !document.hidden && !reduceMotion.matches;

  async function next() {
    if (changing || !shouldRun()) return;
    changing = true;
    const nextIndex = (index + 1) % slides.length;
    const slide = slides[nextIndex];
    const request = preload(nextIndex);
    if (!request.complete) await new Promise((resolve) => {
      request.addEventListener('load', resolve, { once: true });
      request.addEventListener('error', resolve, { once: true });
    });
    if (!request.naturalWidth || !shouldRun()) { changing = false; return; }

    overlay.src = slide.src;
    overlay.classList.add('is-visible');
    window.setTimeout(() => {
      image.src = slide.src;
      image.alt = slide.alt;
      overlay.classList.remove('is-visible');
      index = nextIndex;
      changing = false;
      preload((index + 1) % slides.length);
    }, 800);
  }

  function sync() {
    if (shouldRun() && !timer) timer = window.setInterval(next, 2500);
    if (!shouldRun() && timer) { window.clearInterval(timer); timer = 0; }
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) preload((index + 1) % slides.length);
      sync();
    }, { threshold: 0.15 }).observe(hero);
  } else preload(1);
  document.addEventListener('visibilitychange', sync);
  reduceMotion.addEventListener('change', sync);
  sync();
})();
