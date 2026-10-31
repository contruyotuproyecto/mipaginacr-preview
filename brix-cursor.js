(() => {
  const glow = document.querySelector('.brix-cursor-glow');
  const allowed = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  if (!glow || !allowed.matches) return;
  let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0, tracking = false;
  const animate = () => {
    frame = 0;
    if (!tracking) return;
    const dx = targetX - x;
    const dy = targetY - y;
    x += dx * .07;
    y += dy * .07;
    glow.style.translate = `${x}px ${y}px`;
    if (Math.abs(dx) + Math.abs(dy) > .2) frame = requestAnimationFrame(animate);
  };
  addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !allowed.matches) return;
    targetX = event.clientX;
    targetY = event.clientY;
    if (tracking) {
      if (!frame) frame = requestAnimationFrame(animate);
      return;
    }
    x = targetX; y = targetY;
    glow.style.translate = `${x}px ${y}px`;
    tracking = true;
    glow.classList.add('is-active');
    frame = requestAnimationFrame(animate);
  }, { passive: true });
  const stop = () => {
    tracking = false;
    glow.classList.remove('is-active');
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  addEventListener('pointerleave', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  allowed.addEventListener('change', event => { if (!event.matches) stop(); });
})();
