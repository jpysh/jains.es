import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Multi-page static site. Every HTML file is an entry point; Vite rewrites the
// asset URLs inside them and emits hashed, minified CSS/JS into dist/.
// Files under public/ are copied verbatim, so /assets/... URLs keep working.
export default defineConfig({
  appType: 'mpa',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        notfound: resolve(import.meta.dirname, '404.html'),
        pilotCosts: resolve(import.meta.dirname, 'blog/what-an-ai-pilot-costs/index.html'),
        shipInADay: resolve(import.meta.dirname, 'blog/ship-in-a-day/index.html'),
        nineProducts: resolve(import.meta.dirname, 'blog/nine-products-one-year/index.html'),
      },
    },
  },
});
