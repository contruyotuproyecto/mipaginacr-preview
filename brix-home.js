(() => {
  const deferredBlogCss = document.querySelector('link[data-deferred-blog-css]');
  if (deferredBlogCss) {
    const enableBlogCss = () => { deferredBlogCss.media = 'all'; };
    if (deferredBlogCss.sheet) enableBlogCss();
    else deferredBlogCss.addEventListener('load', enableBlogCss, { once: true });
  }
  const images = document.querySelectorAll('.work-grid a');
  if (!images.length || matchMedia('(prefers-reduced-motion: reduce)').matches || CSS.supports('animation-timeline: view()')) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    }
  }, { threshold: .2 });
  images.forEach(link => observer.observe(link));
})();
