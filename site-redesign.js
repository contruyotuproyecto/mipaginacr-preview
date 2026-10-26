const filters = document.querySelectorAll('[data-filter]');
const photos = document.querySelectorAll('[data-gallery-item]');
const more = document.querySelector('.gallery-more');
let category = 'Todas';
let visibleCount = 12;
const renderGallery = () => {
  const matching = [...photos].filter(photo => category === 'Todas' || photo.dataset.category === category);
  photos.forEach(photo => { photo.hidden = !matching.includes(photo) || matching.indexOf(photo) >= visibleCount; });
  if (more) more.hidden = matching.length <= visibleCount;
};
filters.forEach(button => button.addEventListener('click', () => {
  category = button.dataset.filter;
  visibleCount = 12;
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  renderGallery();
}));
if (more) more.addEventListener('click', () => { visibleCount += 12; renderGallery(); });
renderGallery();
const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const viewer = lightbox.querySelector('img');
  const caption = lightbox.querySelector('.lightbox-caption');
  const count = lightbox.querySelector('.lightbox-count');
  const previous = lightbox.querySelector('.lightbox-prev');
  const next = lightbox.querySelector('.lightbox-next');
  const stage = lightbox.querySelector('.lightbox-stage');
  let matchingPhotos = [];
  let currentIndex = 0;
  let touchStart = null;

  const showPhoto = index => {
    if (index < 0 || index >= matchingPhotos.length) return;
    currentIndex = index;
    const photo = matchingPhotos[index];
    const img = photo.querySelector('img');
    const sourceWidth = Number(img.getAttribute('width')) || img.naturalWidth;
    const sourceHeight = Number(img.getAttribute('height')) || img.naturalHeight;
    viewer.src = photo.href;
    viewer.alt = img.alt;
    viewer.width = sourceWidth;
    viewer.height = sourceHeight;
    lightbox.dataset.orientation = sourceWidth > sourceHeight ? 'landscape' : 'portrait';
    caption.textContent = img.alt;
    count.textContent = `${index + 1} / ${matchingPhotos.length}`;
    previous.disabled = index === 0;
    next.disabled = index === matchingPhotos.length - 1;
  };

  photos.forEach(photo => photo.addEventListener('click', event => {
    event.preventDefault();
    matchingPhotos = [...photos].filter(item => category === 'Todas' || item.dataset.category === category);
    showPhoto(matchingPhotos.indexOf(photo));
    lightbox.showModal();
  }));
  previous.addEventListener('click', () => showPhoto(currentIndex - 1));
  next.addEventListener('click', () => showPhoto(currentIndex + 1));
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(currentIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(currentIndex + 1); }
  });
  stage.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  stage.addEventListener('touchmove', event => {
    if (event.touches.length > 1) touchStart = null;
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (!touchStart || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) showPhoto(currentIndex + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
  stage.addEventListener('touchcancel', () => { touchStart = null; });
}
