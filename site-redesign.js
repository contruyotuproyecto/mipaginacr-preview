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
  photos.forEach(photo => photo.addEventListener('click', event => {
    event.preventDefault();
    const img = photo.querySelector('img');
    viewer.src = photo.href;
    viewer.alt = img.alt;
    viewer.width = img.width;
    viewer.height = img.height;
    lightbox.showModal();
  }));
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
}
