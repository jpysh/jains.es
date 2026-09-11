/**
 * The cursor: an exact dot plus a ring that eases behind it.
 *
 * Replacing the native pointer is a real accessibility cost, so it is only
 * ever attached on a fine pointer with motion allowed, and it hands the native
 * cursor straight back the moment anyone reaches for the keyboard.
 */

const LABELS = {
  card: 'visit',
  play: 'play',
  post: 'read',
  send: 'send',
};

export function initCursor() {
  const dot = document.createElement('div');
  dot.className = 'cur cur-dot';
  const ring = document.createElement('div');
  ring.className = 'cur cur-ring';
  const label = document.createElement('span');
  ring.append(label);
  document.body.append(dot, ring);
  document.documentElement.classList.add('has-cursor');

  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let rx = x;
  let ry = y;
  let raf = 0;
  let moved = false;

  function frame() {
    raf = requestAnimationFrame(frame);
    // The dot is exact; the ring lags. The lag is the whole effect — a ring
    // that tracks perfectly reads as a cursor with a circle drawn round it.
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
  }

  function onMove(e) {
    x = e.clientX;
    y = e.clientY;
    if (!moved) {
      moved = true;
      dot.style.opacity = ring.style.opacity = '1';
    }

    const hit = e.target.closest?.('[data-cursor], a, button');
    if (!hit) {
      ring.className = 'cur cur-ring';
      return;
    }
    const kind = hit.dataset?.cursor;
    if (kind && LABELS[kind]) {
      label.textContent = LABELS[kind];
      ring.className = 'cur cur-ring is-label';
    } else {
      ring.className = 'cur cur-ring is-link';
    }
  }

  function detach() {
    cancelAnimationFrame(raf);
    dot.remove();
    ring.remove();
    document.documentElement.classList.remove('has-cursor');
    removeEventListener('pointermove', onMove);
  }

  dot.style.opacity = ring.style.opacity = '0';
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerdown', () => ring.classList.add('is-link'), { passive: true });

  // Anyone who tabs is navigating by keyboard and needs the real pointer and
  // the focus ring back. One keypress is enough to know.
  addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Tab') detach();
    },
    { once: false }
  );

  // A touch means this was never the right device.
  addEventListener('touchstart', detach, { once: true, passive: true });

  raf = requestAnimationFrame(frame);
  return { detach };
}
