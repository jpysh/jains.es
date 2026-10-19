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
// Low-end phones and data savers keep the static wash: the particle field
// costs seconds of main-thread time on a 4-core budget Android.
const lowEnd =
  navigator.connection?.saveData ||
  (navigator.deviceMemory && navigator.deviceMemory < 4) ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
if (canvas && !reduceMotion && !lowEnd && webglAvailable()) {
  const start = () =>
    import('./hero.js')
      .then(({ initHero }) => {
        const small = window.matchMedia('(max-width: 760px)').matches;
        initHero(canvas, { count: small ? 1100 : 4200 });
        canvas.classList.add('is-live');
      })
      .catch(() => {
        /* Static fallback is already painted; nothing to undo. */
      });

  // After load, then idle: the headline paints and settles before any GL work.
  const idle = () =>
    'requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 2500 }) : setTimeout(start, 200);
  if (document.readyState === 'complete') idle();
  else addEventListener('load', idle, { once: true });
}

/**
 * Homepage only: tint the flagship band with the card in view, and light the
 * nav link for the section in view. Without script the bands keep their base
 * colour and the nav is plain links, so nothing is lost.
 */
const band = document.querySelector('.band-work');
if (band && 'IntersectionObserver' in window) {
  const tintIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) if (e.isIntersecting) band.style.setProperty('--tint', e.target.dataset.tint);
    },
    { rootMargin: '-45% 0px -45% 0px' }
  );
  document.querySelectorAll('[data-tint]').forEach((el) => tintIO.observe(el));

  const links = [...document.querySelectorAll('.nav-links a')];
  const navIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const key = e.target.dataset.nav;
        for (const a of links) a.setAttribute('aria-current', String(a.getAttribute('href') === `#${key}`));
      }
    },
    { rootMargin: '-45% 0px -45% 0px' }
  );
  document.querySelectorAll('[data-nav]').forEach((el) => navIO.observe(el));
}
