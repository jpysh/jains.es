// Entry point. Vite bundles the stylesheet from here and emits it as a
// hashed <link> in every built page, so there is no unversioned /styles.css
// to cache-bust by hand.
import './styles.css';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * The hero canvas loads in a separate chunk, after first paint, and only when
 * it can actually be used. The headline is plain text and is the LCP element
 * either way — the canvas is never allowed to block it.
 */
const canvas = document.querySelector('.hero-canvas');
if (canvas && !reduceMotion && webglAvailable()) {
  const start = () =>
    import('./hero.js')
      .then(({ initHero }) => {
        const small = window.matchMedia('(max-width: 760px)').matches;
        initHero(canvas, { count: small ? 1800 : 4200 });
        canvas.classList.add('is-live');
      })
      .catch(() => {
        /* Static fallback is already painted; nothing to undo. */
      });

  if ('requestIdleCallback' in window) {
    requestIdleCallback(start, { timeout: 1200 });
  } else {
    addEventListener('load', () => setTimeout(start, 80), { once: true });
  }
}
