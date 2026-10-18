document.documentElement.classList.add('js');

const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

function closeMenu() {
  navLinks.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
}

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  navLinks.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});
navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.nav-shell')) closeMenu();
});

const ideas = {
  law: { url: 'estudiolegal.cr', brand: 'ESTUDIO / LEGAL', kicker: 'ASESORÍA CON CONFIANZA', title: 'Claridad para<br>cada decisión.', copy: 'Un espacio serio y cercano para presentar servicios legales.', button: 'Conversemos →', className: 'idea-law' },
  shop: { url: 'tutienda.cr', brand: 'OBJETO / STUDIO', kicker: 'OBJETOS PARA TODOS LOS DÍAS', title: 'Descubre lo que<br>te inspira.', copy: 'Un catálogo que deja que cada producto tenga su momento.', button: 'Ver colección →', className: 'idea-shop' },
  food: { url: 'sabores.cr', brand: 'FUEGO / COCINA', kicker: 'HECHO CON CALMA', title: 'El sabor empieza<br>aquí.', copy: 'Una experiencia que abre el apetito antes de llegar a la mesa.', button: 'Ver el menú →', className: 'idea-food' },
  pro: { url: 'tuprofesion.cr', brand: 'NOMBRE / APELLIDO', kicker: 'UNA PRESENCIA QUE INSPIRA', title: 'Tu experiencia,<br>en primer plano.', copy: 'Una presentación personal clara, cálida y fácil de explorar.', button: 'Conóceme →', className: 'idea-pro' }
};

const tabs = [...document.querySelectorAll('.idea-tab')];
const preview = document.querySelector('#idea-preview');
const canvas = document.querySelector('#idea-canvas');

function selectIdea(tab) {
  const idea = ideas[tab.dataset.idea];
  tabs.forEach(item => {
    const active = item === tab;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  preview.setAttribute('aria-labelledby', tab.id);
  canvas.className = `idea-canvas ${idea.className}`;
  document.querySelector('#preview-url').textContent = idea.url;
  document.querySelector('#preview-brand').textContent = idea.brand;
  document.querySelector('#preview-kicker').textContent = idea.kicker;
  document.querySelector('#preview-title').innerHTML = idea.title;
  document.querySelector('#preview-copy').textContent = idea.copy;
  document.querySelector('#preview-button').textContent = idea.button;
}

tabs.forEach((tab, index) => {
  tab.tabIndex = index === 0 ? 0 : -1;
  tab.addEventListener('click', () => selectIdea(tab));
  tab.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1) + tabs.length) % tabs.length;
    selectIdea(tabs[next]);
    tabs[next].focus();
  });
});

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.09 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
} else {
  document.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
}

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const motionToggle = document.querySelector('#motion-toggle');
const depthSections = [...document.querySelectorAll('.depth-section')];
const hero = document.querySelector('.hero');
let depthFrame = 0;
let motionPaused = false;

const depthProperties = [
  '--depth-x', '--depth-y', '--depth-x-small', '--depth-y-small',
  '--pointer-x', '--pointer-y', '--pointer-x-small', '--pointer-y-small'
];

function clearDepthMotion() {
  depthSections.forEach(section => depthProperties.forEach(property => section.style.removeProperty(property)));
}

function setMotionPaused(paused) {
  motionPaused = paused;
  document.documentElement.classList.toggle('motion-paused', paused);
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.querySelector('.motion-toggle-label').textContent = paused ? 'Reanudar movimiento' : 'Pausar movimiento';

  if (paused) clearDepthMotion();
  else scheduleDepth();
}

motionToggle.hidden = reducedMotion.matches;
motionToggle.addEventListener('click', () => setMotionPaused(!motionPaused));

function updateDepth() {
  depthFrame = 0;
  if (reducedMotion.matches || motionPaused) return;

  const viewportHeight = window.innerHeight;
  depthSections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    if (rect.bottom < -40 || rect.top > viewportHeight + 40) return;

    const progress = Math.max(-1, Math.min(1,
      (viewportHeight / 2 - (rect.top + rect.height / 2)) /
      (viewportHeight / 2 + rect.height / 2)
    ));
    const x = progress * (index % 2 ? -6 : 6);
    const y = progress * 12;
    section.style.setProperty('--depth-x', `${x.toFixed(1)}px`);
    section.style.setProperty('--depth-y', `${y.toFixed(1)}px`);
    if (section === hero) {
      section.style.setProperty('--depth-x-small', `${(-x * .45).toFixed(1)}px`);
      section.style.setProperty('--depth-y-small', `${(-y * .45).toFixed(1)}px`);
    }
  });
}

function scheduleDepth() {
  if (!depthFrame) depthFrame = requestAnimationFrame(updateDepth);
}

window.addEventListener('scroll', scheduleDepth, { passive: true });
window.addEventListener('resize', scheduleDepth, { passive: true });
scheduleDepth();

if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;

  hero.addEventListener('pointermove', event => {
    if (reducedMotion.matches || motionPaused) return;
    const rect = hero.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - .5) * 12;
    pointerY = ((event.clientY - rect.top) / rect.height - .5) * 10;
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      hero.style.setProperty('--pointer-x', `${pointerX.toFixed(1)}px`);
      hero.style.setProperty('--pointer-y', `${pointerY.toFixed(1)}px`);
      hero.style.setProperty('--pointer-x-small', `${(-pointerX * .45).toFixed(1)}px`);
      hero.style.setProperty('--pointer-y-small', `${(-pointerY * .45).toFixed(1)}px`);
    });
  });

  hero.addEventListener('pointerleave', () => {
    ['--pointer-x', '--pointer-y', '--pointer-x-small', '--pointer-y-small']
      .forEach(property => hero.style.removeProperty(property));
  });
}

reducedMotion.addEventListener('change', () => {
  motionToggle.hidden = reducedMotion.matches;
  clearDepthMotion();
  scheduleDepth();
});
