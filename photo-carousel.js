(() => {
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const photoCarousels = [...document.querySelectorAll('[data-carousel]')].map(media => {
  const image = media.querySelector('[data-carousel-image]');
  const template = media.parentElement.querySelector('template[data-carousel-slides]');
  if (!image || !template) return null;

  const slides = [
    { src: image.getAttribute('src'), alt: image.alt },
    ...[...template.content.querySelectorAll('img')].map(slide => ({
      src: slide.getAttribute('src'),
      alt: slide.alt
    }))
  ].filter(slide => slide.src);

  if (slides.length < 2) return null;

  let index = 0;
  let timer = 0;
  let transitionTimer = 0;
  let isTransitioning = false;
  let isFocused = false;
  let isHovered = false;
  let inView = !('IntersectionObserver' in window);
  const loadedSlides = new Map();
  const transitionImage = document.createElement('img');
  transitionImage.className = 'photo-transition-layer';
  transitionImage.alt = '';
  transitionImage.setAttribute('aria-hidden', 'true');
  transitionImage.width = image.width;
  transitionImage.height = image.height;
  transitionImage.decoding = 'async';
  media.append(transitionImage);

  function shouldRun() {
    return inView && !document.hidden && !isFocused && !isHovered && !reducedMotion.matches;
  }

  function preload(slideIndex) {
    if (loadedSlides.has(slideIndex)) return loadedSlides.get(slideIndex);
    const request = new Image();
    request.decoding = 'async';
    request.src = slides[slideIndex].src;
    loadedSlides.set(slideIndex, request);
    return request;
  }

  async function showSlide(nextIndex) {
    if (isTransitioning) return;
    isTransitioning = true;

    const nextSlideIndex = (nextIndex + slides.length) % slides.length;
    const slide = slides[nextSlideIndex];
    const request = preload(nextSlideIndex);

    if (!request.complete) {
      await new Promise(resolve => {
        request.addEventListener('load', resolve, { once: true });
        request.addEventListener('error', resolve, { once: true });
      });
    }

    if (!request.naturalWidth || !shouldRun()) {
      isTransitioning = false;
      return;
    }

    transitionImage.src = slide.src;
    if (typeof transitionImage.decode === 'function') {
      try {
        await transitionImage.decode();
      } catch {
        isTransitioning = false;
        return;
      }
    }

    if (!shouldRun()) {
      isTransitioning = false;
      return;
    }

    requestAnimationFrame(() => {
      transitionImage.classList.add('is-visible');
      image.classList.add('is-fading-out');
    });

    window.clearTimeout(transitionTimer);
    transitionTimer = window.setTimeout(() => {
      index = nextSlideIndex;
      image.src = slide.src;
      image.alt = slide.alt;
      transitionImage.classList.remove('is-visible');
      image.classList.remove('is-fading-out');
      isTransitioning = false;
      preload((index + 1) % slides.length);
    }, 1150);
  }

  function stopTimer() {
    if (!timer) return;
    window.clearInterval(timer);
    timer = 0;
  }

  function syncTimer() {
    const running = shouldRun();
    if (running && !timer) timer = window.setInterval(() => showSlide(index + 1), 3000);
    else if (!running) stopTimer();
  }

  if (inView) preload((index + 1) % slides.length);
  media.addEventListener('focusin', () => {
    isFocused = true;
    syncTimer();
  });
  media.addEventListener('focusout', event => {
    if (!media.contains(event.relatedTarget)) {
      isFocused = false;
      syncTimer();
    }
  });
  media.addEventListener('pointerenter', () => {
    isHovered = true;
    syncTimer();
  });
  media.addEventListener('pointerleave', () => {
    isHovered = false;
    syncTimer();
  });

  syncTimer();

  return {
    media,
    setInView(value) {
      inView = value;
      if (value) preload((index + 1) % slides.length);
      syncTimer();
    },
    syncTimer
  };
}).filter(Boolean);

if ('IntersectionObserver' in window && photoCarousels.length) {
  const carouselByElement = new Map(photoCarousels.map(carousel => [carousel.media, carousel]));
  const carouselObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => carouselByElement.get(entry.target)?.setInView(entry.isIntersecting));
  }, { threshold: 0.15 });
  photoCarousels.forEach(carousel => carouselObserver.observe(carousel.media));
}

document.addEventListener('visibilitychange', () => photoCarousels.forEach(carousel => carousel.syncTimer()));
reducedMotion.addEventListener('change', () => photoCarousels.forEach(carousel => carousel.syncTimer()));
})();
