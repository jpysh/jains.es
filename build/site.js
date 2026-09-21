// Generates every page that isn't hand-written, plus sitemap.xml and feed.xml.
// Also rewrites the marked block in index.html so the homepage list is never
// edited by hand.
//
// Two content types, both Markdown with front matter, both rendered here:
//
//   content/days/<date>.md   -> /day/<n>/      the edition. Dated, a day old
//   content/wiki/<slug>.md   -> /wiki/<slug>/  the topic. Accretes, outlives
//
// Plus /curriculum/, generated from AI101/CURRICULUM.md with the days already
// published ticked off, so a reader can see what is coming without GitHub.
//
// The daily session is deliberately NOT a page. Nobody needs to know what was
// studied on a Tuesday; its learning is folded into the topic page it belongs
// to. Session files live in AI101/sessions/, committed but never rendered.
//
// This script is the only place that knows the URL shape, so a page's metadata
// lives in exactly one file and nothing can drift out of sync.
//
// Run by predev and prebuild, so `npm run dev` and `npm run build` both see
// current output. Writes are skipped when the content is unchanged, which keeps
// git quiet and vite from reloading in a loop.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync, globSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import MarkdownIt from 'markdown-it';

const root = resolve(import.meta.dirname, '..');
const ORIGIN = 'https://jains.es';
const AUTHOR = 'Jains AI and Digital Transformation Agency';

// The wiki index groups by a page's FIRST tag. These clusters are ordered to
// follow the curriculum's own arc, because that is the order a reader working
// through the material wants. Anything with an unlisted first tag sorts after
// these, alphabetically — a new tag appears on the index without a code change.
const CLUSTERS = [
  'tokenisation',
  'training',
  'attention',
  'scaling',
  'compression',
  'inference',
  'retail',
  'work',
  'learning',
  'meta',
];

const REPO = 'https://github.com/jpysh/jains.es';

// CHANGE THIS to the real publication before the first send. It is the only
// place the address appears: every footer on the site is generated from here.
const SUBSTACK = 'https://jainses.substack.com';

// A page says out loud how finished it is. That is what makes publishing rough
// work honest rather than sloppy, and it is what licenses shipping daily.
const STAGES = {
  seedling: 'Seedling — rough, and likely wrong in places',
  budding: 'Budding — checked, still growing',
  evergreen: 'Evergreen — audited against its sources',
};


const TIERS = {
  primary: 'Primary',
  reported: 'Reported',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// tags, prereqs and related are comma-separated strings, never YAML lists. The
// parser below handles `key: value` and one list key; any other list hits the
// kv regex and throws. Splitting a string at point of use is one line. Adding a
// YAML dependency for this is not.
const commaList = (v) => (v || '').split(',').map((x) => x.trim()).filter(Boolean);

// 200 words a minute, rounded up, floor of 1. A number on the page lets a
// reader decide before they start, which matters most on a phone.
const readingTime = (body) => Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));

const longDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

// --- front matter -----------------------------------------------------------
// A deliberately small subset of YAML: `key: value` lines, plus a `sources:`
// list whose entries are pipe-delimited on one line each. One line per source
// means no YAML dependency and nothing to indent wrongly at 7am.
//
//   sources:
//     - primary | European Commission | 2026-07-02 | Title of the thing | https://...

function parse(raw, file) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing --- front matter block at the top of the file`);
  const [, head, body] = m;
  const meta = { sources: [] };
  let inSources = false;

  for (const line of head.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (/^sources:\s*$/.test(line)) { inSources = true; continue; }

    if (inSources && /^\s*-\s/.test(line)) {
      const parts = line.replace(/^\s*-\s*/, '').split('|').map((p) => p.trim());
      const [tier, publisher, date, title, url] = parts;
      meta.sources.push({ tier, publisher, date, title, url, raw: line.trim(), parts });
      continue;
    }

    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!kv) throw new Error(`${file}: cannot parse front matter line: ${line}`);
    inSources = false;
    meta[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return { meta, body };
}

// --- validation -------------------------------------------------------------
// The build fails rather than shipping a page that loses its date or carries
// an unattributed claim. This is the whole reason a daily cadence can be
// trusted, and it is the strongest control on the site.

// Sources are validated identically wherever they appear. Kept separate from
// validateWiki() and validateDays() so both get the same source discipline
// without sharing each other's required fields.
function checkSources(meta, at, errors, { required }) {
  if (required && !meta.sources.length) errors.push(`${at}: no sources`);
  meta.sources.forEach((s, i) => {
    const where = `${at}: source ${i + 1}`;
    if (s.parts.length !== 5)
      errors.push(`${where}: expected "tier | publisher | date | title | url", got ${s.parts.length} fields in "${s.raw}"`);
    if (!TIERS[s.tier]) errors.push(`${where}: tier must be primary or reported, got "${s.tier}"`);
    if (!s.publisher) errors.push(`${where}: no publisher`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date || '')) errors.push(`${where}: date must be YYYY-MM-DD, got "${s.date}"`);
    if (!s.title) errors.push(`${where}: no title`);
    if (!/^https?:\/\//.test(s.url || '')) errors.push(`${where}: url must start with http, got "${s.url}"`);
  });
}

function fail(errors, what) {
  if (!errors.length) return;
  console.error(`\n${what} build failed — ${errors.length} problem${errors.length > 1 ? 's' : ''}:\n`);
  for (const e of errors) console.error(`  ${e}`);
  console.error('');
  process.exit(1);
}

// A seedling may cite nothing — that is the point of saying it is a seedling.
// An evergreen page has been audited, so it must show its working.
function validateWiki(pages) {
  const errors = [];
  for (const w of pages) {
    const at = w.file;
    if (!w.meta.title) errors.push(`${at}: no title`);
    if (!w.meta.summary) errors.push(`${at}: no summary (used for the meta description and the index)`);
    if (!commaList(w.meta.tags).length)
      errors.push(`${at}: no tags — the first tag is the cluster the wiki index files it under`);
    if (!w.meta.stage) errors.push(`${at}: no stage`);
    else if (!STAGES[w.meta.stage])
      errors.push(`${at}: unknown stage "${w.meta.stage}" — must be one of ${Object.keys(STAGES).join(', ')}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(w.meta.created || ''))
      errors.push(`${at}: created must be YYYY-MM-DD, got "${w.meta.created}"`);
    if (w.meta.modified && !/^\d{4}-\d{2}-\d{2}$/.test(w.meta.modified))
      errors.push(`${at}: modified must be YYYY-MM-DD, got "${w.meta.modified}"`);
    checkSources(w.meta, at, errors, { required: w.meta.stage === 'evergreen' });
  }
  fail(errors, 'Wiki');
}

// The day number is declared, never derived from file order. A missed day would
// otherwise renumber every later edition and move URLs that are already live.
function validateDays(days) {
  const errors = [];
  const seenDay = new Map();
  for (const l of days) {
    const at = l.file;
    if (!l.meta.title) errors.push(`${at}: no title`);
    if (!l.meta.summary) errors.push(`${at}: no summary`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(l.meta.date || ''))
      errors.push(`${at}: date must be YYYY-MM-DD, got "${l.meta.date}"`);
    if (!/^\d+$/.test(String(l.meta.day || '')))
      errors.push(`${at}: day must be a whole number, got "${l.meta.day}" — it is the URL, so it is declared, not counted`);
    else if (seenDay.has(l.meta.day))
      errors.push(`${at}: duplicate day ${l.meta.day}, already used by ${seenDay.get(l.meta.day)}`);
    else seenDay.set(l.meta.day, at);
    checkSources(l.meta, at, errors, { required: true });
  }
  fail(errors, 'Editions');
}

// --- markdown ---------------------------------------------------------------

const md = new MarkdownIt({ html: true, typographer: true, linkify: false });
const defaultLink = md.renderer.rules.link_open || ((t, i, o, e, self) => self.renderToken(t, i, o));
md.renderer.rules.link_open = (tokens, i, opts, env, self) => {
  const href = tokens[i].attrGet('href') || '';
  if (/^https?:\/\//.test(href) && !href.startsWith(ORIGIN)) {
    tokens[i].attrSet('target', '_blank');
    tokens[i].attrSet('rel', 'noopener');
  }
  return defaultLink(tokens, i, opts, env, self);
};

// --- shared chrome ----------------------------------------------------------
// The logo is a single inline <symbol> and index.html is its home. Reading it
// from there means the 23 generated pages can never hold a stale copy.

const homeSrc = readFileSync(resolve(root, 'index.html'), 'utf8');
const LOGO = homeSrc.match(/<svg width="0"[\s\S]*?<\/svg>/)[0];

// `noScript` swaps the JS entry for a plain stylesheet link. Vite still hashes
// and inlines-by-reference the CSS, but the page ships no executable script at
// all — which is the whole point for wiki and lesson pages, read on low-tier
// Android where script costs main-thread time as well as bytes.
const head = ({ title, description, url, ogTitle, ogDescription, extra = '', noScript = false }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<link rel="alternate" type="application/rss+xml" title="Jains — Writing" href="${ORIGIN}/feed.xml">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(ogTitle || title)}">
<meta property="og:description" content="${esc(ogDescription || description)}">
<meta property="og:image" content="${ORIGIN}/assets/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/space-grotesk-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>
${noScript ? `<link rel="stylesheet" href="/src/styles.css">` : `<script type="module" src="/src/main.js"></script>`}
${extra}</head>
<body>
<span id="top" tabindex="-1"></span>

${LOGO}

<nav class="nav">
  <a class="mark" href="/" aria-label="jains.es — home"><svg class="logo" role="img" aria-label="jains.es"><use href="#logo"/></svg></a>
  <a class="pill" href="/day/">The daily log</a>
</nav>
`;

const footerBlock = `
<footer>
  <div class="wrap">
    <!-- A plain GET form, not Substack's iframe embed. The embed is 96 KB of
         HTML, 115 requests, 90 scripts, 5 cookies and calls to Sentry and
         Cloudflare Insights — in a footer that is every page, against a 150 KB
         budget, for readers on low-tier Android. Substack prefills its own
         subscribe page from ?email=, so this costs one CSP line and no script. -->
    <form class="sub" method="get" action="${SUBSTACK}/subscribe">
      <label for="sub-email">One email each morning. What happened, what it means where you are, and what I got wrong.</label>
      <div class="sub-row">
        <input id="sub-email" type="email" name="email" required autocomplete="email" placeholder="you@example.com" spellcheck="false">
        <button class="pill" type="submit">Subscribe</button>
      </div>
      <p class="sub-note">Free. Unsubscribe in one click. <a href="/privacy/">What happens to your address</a>.</p>
    </form>

    <nav class="foot-links" aria-label="Footer">
      <a href="/day/">Daily</a>
      <a href="/wiki/">Wiki</a>
      <a href="/curriculum/">Curriculum</a>
      <a href="/about/">About</a>
      <a href="/work/">Work</a>
      <a href="/privacy/">Privacy</a>
      <a href="${REPO}" target="_blank" rel="noopener">GitHub</a>
    </nav>
  </div>
</footer>

<a class="to-top" href="#top" aria-label="Back to top">
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
</a>
`;

// Generated pages get the closing tags too. Hand-written pages close
// themselves, so they are injected with footerBlock and never with this.
const footer = `${footerBlock}
</body>
</html>
`;

// One renderer for wiki pages and editions. The tier key is repeated on
// every page on purpose: a reader arriving from a search result has not seen it.
const sourcesBlock = (meta) =>
  !meta.sources.length
    ? ''
    : `
  <section class="sources">
    <h2>Sources</h2>
    <ol>
${meta.sources
  .map(
    (s) => `      <li>
        <span class="tier tier-${s.tier}">${TIERS[s.tier]}</span>
        <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>
        <span class="src-meta">${esc(s.publisher)}, ${longDate(s.date)}</span>
      </li>`
  )
  .join('\n')}
    </ol>
    <p class="tier-key"><strong>Primary</strong> — the regulator, vendor, paper or survey itself. <strong>Reported</strong> — a named outlet reporting a fact first.</p>
  </section>`;

const ld = (obj) => `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>\n`;

const crumbs = (items) =>
  ld({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: url,
    })),
  });

const itemList = (posts) =>
  ld({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: posts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: p.url,
      name: p.meta.title,
    })),
  });

// --- page renderers ---------------------------------------------------------

// --- wiki and editions -------------------------------------------------------
// Both ship zero JavaScript. Low-tier Android is roughly 9x slower than a
// development machine, so script costs main-thread time as well as bytes on
// exactly the device this audience holds.

// The furniture that tells a reader how finished a page is and how long it will
// take, before they commit to reading it.
const wikiMeta = (w) => `  <p class="meta page-meta">
    <span class="stage stage-${w.meta.stage}" title="${esc(STAGES[w.meta.stage])}">${w.meta.stage}</span>
    <span class="dot" aria-hidden="true">·</span>
    <span>updated <time datetime="${w.meta.modified || w.meta.created}">${longDate(w.meta.modified || w.meta.created)}</time></span>
    <span class="dot" aria-hidden="true">·</span>
    <span>~${w.mins} min</span>
  </p>`;

const linkList = (label, slugs, bySlug) => {
  const found = slugs.map((x) => bySlug.get(x)).filter(Boolean);
  if (!found.length) return '';
  return `  <p class="page-links"><span class="rail">${label}</span>${found
    .map((t) => `<a href="${t.path}">${esc(t.meta.title)}</a>`)
    .join(' ')}</p>`;
};

const editLink = (file) =>
  `  <p class="edit-page"><a href="${REPO}/edit/main/${file}" target="_blank" rel="noopener">Edit this page ↗</a></p>`;

function renderWiki(w, bySlug) {
  const prereqs = linkList('Read first', commaList(w.meta.prereqs), bySlug);
  const related = linkList('Related', commaList(w.meta.related), bySlug);
  const tags = commaList(w.meta.tags);

  return (
    head({
      title: `${w.meta.title} — Jains`,
      description: w.meta.summary,
      url: w.url,
      noScript: true,
      extra:
        `<meta property="og:type" content="article">\n` +
        ld({
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: w.meta.title,
          description: w.meta.summary,
          datePublished: w.meta.created,
          dateModified: w.meta.modified || w.meta.created,
          inLanguage: 'en',
          keywords: tags.join(', ') || undefined,
          mainEntityOfPage: { '@type': 'WebPage', '@id': w.url },
          author: { '@type': 'Person', name: 'Piyush Jain' },
          publisher: { '@type': 'Organization', name: AUTHOR, url: `${ORIGIN}/` },
          citation: w.meta.sources.map((s) => ({
            '@type': 'CreativeWork',
            name: s.title,
            url: s.url,
            datePublished: s.date,
            publisher: { '@type': 'Organization', name: s.publisher },
          })),
        }) +
        crumbs([
          ['Home', `${ORIGIN}/`],
          ['Wiki', `${ORIGIN}/wiki/`],
          [w.meta.title, w.url],
        ]),
    }) +
    `
<article class="article wiki">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/wiki/">Wiki</a></nav>

  <h1>${esc(w.meta.title)}</h1>
${wikiMeta(w)}
  <p class="lede dim">${esc(w.meta.summary)}</p>
${prereqs}

${md.render(w.body).trim()}
${sourcesBlock(w.meta)}
${related}
${editLink(w.file)}
</article>
` +
    footer
  );
}

function renderWikiIndex(pages) {
  const start = pages.find((w) => w.slug === 'start-here');
  const rest = pages.filter((w) => w.slug !== 'start-here');

  // First tag is the cluster. Ordered by CLUSTERS, then anything unlisted
  // alphabetically — so a new tag appears here without a code change.
  const seen = [...new Set(rest.map((w) => commaList(w.meta.tags)[0]))];
  const order = [...CLUSTERS.filter((c) => seen.includes(c)), ...seen.filter((c) => !CLUSTERS.includes(c)).sort()];
  const groups = order.map((tag) => ({ tag, pages: rest.filter((w) => commaList(w.meta.tags)[0] === tag) }));

  const recent = [...rest]
    .sort((a, b) => (b.meta.modified || b.meta.created).localeCompare(a.meta.modified || a.meta.created))
    .slice(0, 5);

  return (
    head({
      title: 'Wiki — Jains.es',
      description: `Notes from learning to build language models from scratch. ${pages.length} page${pages.length === 1 ? '' : 's'}, each marked with how finished it is.`,
      url: `${ORIGIN}/wiki/`,
      noScript: true,
      extra:
        `<meta property="og:type" content="website">\n` +
        crumbs([
          ['Home', `${ORIGIN}/`],
          ['Wiki', `${ORIGIN}/wiki/`],
        ]),
    }) +
    `
<section class="wrap blog-index">
  <p class="eyebrow">Wiki</p>
  <h1 class="title">What I have worked out<br>so far.</h1>
  <p class="lede dim">Every page says how finished it is. A seedling is rough and probably wrong in places — that is why it says so.</p>
${start ? `\n  <p class="more"><a href="${start.path}">Start here →</a></p>\n` : ''}
${
  recent.length
    ? `  <span class="rail">Changed most recently</span>
  <nav class="page-links recent">
${recent.map((w) => `    <a href="${w.path}">${esc(w.meta.title)}</a>`).join('\n')}
  </nav>
`
    : ''
}
${groups
  .map(
    (g) => `  <section class="topic-group" id="${g.tag}">
    <h2>${esc(g.tag.charAt(0).toUpperCase() + g.tag.slice(1))}</h2>
    <div class="posts">
${g.pages
  .map(
    (w) => `      <a class="post" href="${w.path}">
        <h3>${esc(w.meta.title)} <span class="stage stage-${w.meta.stage}" title="${esc(STAGES[w.meta.stage])}">${w.meta.stage}</span></h3>
        <span class="meta post-meta post-summary">${esc(w.meta.summary)}</span>
      </a>`
  )
  .join('\n')}
    </div>
  </section>`
  )
  .join('\n\n')}
</section>
` +
    footer
  );
}

// The curriculum answers "what is coming", which a reader should not need
// GitHub to see. It renders CURRICULUM.md as written rather than parsing its
// tables: those are hand-edited, and coupling the build to their exact shape
// would break this page every time a week is reworded.
function renderCurriculum(days) {
  const source = readFileSync(resolve(root, 'AI101/CURRICULUM.md'), 'utf8');
  const body = source.replace(/^#\s+.*\n/, '');
  const done = days.length;

  return (
    head({
      title: 'Curriculum — Jains.es',
      description:
        'Twelve weeks from tokenisation to a transformer trained on a laptop, then three months on making models small enough to matter. Written down in advance so it can be held to.',
      url: `${ORIGIN}/curriculum/`,
      noScript: true,
      extra:
        `<meta property="og:type" content="website">\n` +
        crumbs([
          ['Home', `${ORIGIN}/`],
          ['Curriculum', `${ORIGIN}/curriculum/`],
        ]),
    }) +
    `
<article class="article">
  <p class="eyebrow">Curriculum</p>
  <h1>What is coming, and in what order</h1>
  <p class="lede dim">Written in advance so it can be held to, and corrected from evidence rather than from how a week felt. ${
    done
      ? `<strong>${done} day${done === 1 ? '' : 's'} published so far</strong> — <a href="/day/">read them here</a>.`
      : 'Day one lands shortly.'
  }</p>

${md.render(body).trim()}

  <hr>
  <p class="dim">Generated from <a href="${REPO}/blob/main/AI101/CURRICULUM.md" target="_blank" rel="noopener">AI101/CURRICULUM.md</a> in the repository. When a week proves too fast or too slow, that file changes and this page changes with it.</p>
</article>
` +
    footer
  );
}

function renderDay(l, days, bySlug) {
  const i = days.indexOf(l);
  const newer = days[i - 1];
  const older = days[i + 1];

  return (
    head({
      title: `Day ${l.meta.day}: ${l.meta.title} — Jains`,
      description: l.meta.summary,
      url: l.url,
      noScript: true,
      extra:
        `<meta property="og:type" content="article">\n` +
        `<meta property="article:published_time" content="${l.meta.date}">\n` +
        ld({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: `Day ${l.meta.day}: ${l.meta.title}`,
          description: l.meta.summary,
          datePublished: l.meta.date,
          inLanguage: 'en',
          mainEntityOfPage: { '@type': 'WebPage', '@id': l.url },
          author: { '@type': 'Person', name: 'Piyush Jain' },
          publisher: { '@type': 'Organization', name: AUTHOR, url: `${ORIGIN}/` },
          citation: l.meta.sources.map((s) => ({
            '@type': 'CreativeWork',
            name: s.title,
            url: s.url,
            datePublished: s.date,
            publisher: { '@type': 'Organization', name: s.publisher },
          })),
        }) +
        crumbs([
          ['Home', `${ORIGIN}/`],
          ['Daily', `${ORIGIN}/day/`],
          [`Day ${l.meta.day}`, l.url],
        ]),
    }) +
    `
<article class="article lesson">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/day/">Daily</a></nav>

  <p class="eyebrow">Day ${l.meta.day}</p>
  <h1>${esc(l.meta.title)}</h1>
  <p class="meta"><time datetime="${l.meta.date}">${longDate(l.meta.date)}</time> <span class="dot" aria-hidden="true">·</span> ~${l.mins} min</p>
  <p class="lede dim">${esc(l.meta.summary)}</p>

${md.render(l.body).trim()}
${sourcesBlock(l.meta)}
  <nav class="page-nav" aria-label="Lessons">
${older ? `    <a class="prev" href="${older.path}">← Day ${older.meta.day}</a>` : ''}
${newer ? `    <a class="next" href="${newer.path}">Day ${newer.meta.day} →</a>` : ''}
  </nav>
${editLink(l.file)}
</article>
` +
    footer
  );
}

function renderDayIndex(days) {
  return (
    head({
      title: 'Daily — Jains',
      description: `Learning to build language models from scratch, one day at a time. ${days.length} day${days.length === 1 ? '' : 's'} so far, including the ones that did not work.`,
      url: `${ORIGIN}/day/`,
      noScript: true,
      extra:
        `<meta property="og:type" content="website">\n` +
        itemList(days) +
        crumbs([
          ['Home', `${ORIGIN}/`],
          ['Daily', `${ORIGIN}/day/`],
        ]),
    }) +
    `
<section class="wrap blog-index">
  <p class="eyebrow">Daily</p>
  <h1 class="title">Building a language model<br>from scratch, in public.</h1>
  <p class="lede dim">One session a day, one artefact a day. The days that did not work are here too — those are usually the useful ones.</p>

  <div class="posts">
${days
  .map(
    (l) => `    <a class="post" href="${l.path}">
      <h3><span class="day-n">Day ${l.meta.day}</span> ${esc(l.meta.title)}</h3>
      <span class="meta post-meta"><time datetime="${l.meta.date}">${longDate(l.meta.date)}</time></span>
    </a>`
  )
  .join('\n')}
  </div>
</section>
` +
    footer
  );
}

// --- sitemap and feed -------------------------------------------------------

function renderSitemap(wiki, days) {
  const newest = days[0]?.meta.date || wiki[0]?.meta.created;
  const urls = [
    { loc: `${ORIGIN}/`, lastmod: newest, priority: '1.0' },
    { loc: `${ORIGIN}/curriculum/`, lastmod: newest, priority: '0.8' },
    { loc: `${ORIGIN}/about/`, lastmod: newest, priority: '0.6' },
    ...(days.length ? [{ loc: `${ORIGIN}/day/`, lastmod: days[0].meta.date, priority: '0.9' }] : []),
    ...days.map((d) => ({ loc: d.url, lastmod: d.meta.date, priority: '0.8' })),
    ...(wiki.length ? [{ loc: `${ORIGIN}/wiki/`, lastmod: wiki[0].meta.modified || wiki[0].meta.created, priority: '0.9' }] : []),
    ...wiki.map((w) => ({ loc: w.url, lastmod: w.meta.modified || w.meta.created, priority: '0.8' })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by build/site.js. Do not edit; your changes will be overwritten. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`)
  .join('\n')}
</urlset>
`;
}

function renderFeed(days) {
  const rfc = (iso) => new Date(`${iso}T09:00:00Z`).toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by build/site.js. Do not edit; your changes will be overwritten. -->
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Jollof Bytes</title>
    <link>${ORIGIN}/day/</link>
    <atom:link href="${ORIGIN}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>A daily read on AI and the Global South, and one person learning to build a language model from scratch.</description>
    <language>en</language>
    <lastBuildDate>${rfc(days[0].meta.date)}</lastBuildDate>
${days
  .map(
    (d) => `    <item>
      <title>Day ${d.meta.day}: ${esc(d.meta.title)}</title>
      <link>${d.url}</link>
      <guid isPermaLink="true">${d.url}</guid>
      <pubDate>${rfc(d.meta.date)}</pubDate>
      <description>${esc(d.meta.summary)}</description>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>
`;
}

// --- homepage block ---------------------------------------------------------
// index.html stays hand-written apart from two marked regions. This one holds
// the latest editions, so the homepage is never stale and never promises a
// page that does not exist.

function renderHomeBlock(days) {
  if (!days.length)
    return '  <p class="dim">Day one lands shortly. The <a href="/wiki/start-here/">start-here page</a> explains what this will be, and the <a href="/curriculum/">curriculum</a> says what is coming.</p>';

  const latest = days.slice(0, 3);
  return `  <div class="posts">
${latest
  .map(
    (d) => `    <a class="post" href="${d.path}">
      <h3><span class="day-n">Day ${d.meta.day}</span> ${esc(d.meta.title)}</h3>
      <span class="meta post-meta"><time datetime="${d.meta.date}">${longDate(d.meta.date)}</time></span>
    </a>`
  )
  .join('\n')}
  </div>

  <p class="more"><a href="/day/">Every edition →</a></p>`;
}

// --- write ------------------------------------------------------------------

let written = 0;
const kept = new Set();

function put(path, content) {
  kept.add(path);
  const full = resolve(root, path);
  if (existsSync(full) && readFileSync(full, 'utf8') === content) return;
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
  written++;
}

// A renamed or deleted post would otherwise leave a live page behind that the
// sitemap no longer lists. Prune rather than wiping the tree, so an unchanged
// run writes nothing and vite's dev server has no reason to reload.
function prune() {
  for (const f of globSync('{wiki,day,curriculum}/**/index.html', { cwd: root })) {
    const full = resolve(root, f);
    if (kept.has(f) || !existsSync(full)) continue;
    rmSync(full, { force: true });
    // Only remove the directory if this was the last thing in it. Wiping it
    // recursively takes children that are still in the glob list with it, and
    // the next iteration then throws on a path that no longer exists.
    const dir = dirname(full);
    if (existsSync(dir) && !readdirSync(dir).length) rmSync(dir, { recursive: true, force: true });
    console.log(`site: removed stale ${f}`);
  }
}

function load(dirname, shape) {
  const dir = resolve(root, `content/${dirname}`);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .map((file) => {
      const slug = file.replace(/\.md$/, '');
      const { meta, body } = parse(readFileSync(resolve(dir, file), 'utf8'), `content/${dirname}/${file}`);
      return { slug, file: `content/${dirname}/${file}`, meta, body, mins: readingTime(body), ...shape(slug, meta) };
    });
}

function main() {
  // Topic pages. The body of knowledge, and the thing that outlives the feed.
  const wiki = load('wiki', (slug) => ({ path: `/wiki/${slug}/`, url: `${ORIGIN}/wiki/${slug}/` }));
  validateWiki(wiki);
  wiki.sort((a, b) => a.meta.title.localeCompare(b.meta.title));
  const bySlug = new Map(wiki.map((w) => [w.slug, w]));
  for (const w of wiki) put(`wiki/${w.slug}/index.html`, renderWiki(w, bySlug));
  if (wiki.length) put('wiki/index.html', renderWikiIndex(wiki));

  // Editions. The day number is the URL and is declared in front matter, so a
  // missed day never renumbers a page that is already live.
  const days = load('days', (slug, meta) => ({ path: `/day/${meta.day}/`, url: `${ORIGIN}/day/${meta.day}/` }));
  validateDays(days);
  days.sort((a, b) => Number(b.meta.day) - Number(a.meta.day));
  for (const d of days) put(`day/${d.meta.day}/index.html`, renderDay(d, days, bySlug));
  if (days.length) put('day/index.html', renderDayIndex(days));

  put('curriculum/index.html', renderCurriculum(days));

  put('public/sitemap.xml', renderSitemap(wiki, days));
  if (days.length) put('public/feed.xml', renderFeed(days));

  // Hand-written pages carry marked regions this script owns. Note the doubled
  // backslashes: inside a template literal `\s` is just `s`, so the character
  // class has to survive into the RegExp constructor intact.
  const marked = (src, name, block) => {
    const re = new RegExp(`(<!-- generated:${name} -->)[\\s\\S]*?( *<!-- /generated:${name} -->)`);
    if (!re.test(src)) throw new Error(`missing <!-- generated:${name} --> markers`);
    return src.replace(re, `$1\n${block}\n$2`);
  };
  put('index.html', marked(marked(homeSrc, 'posts', renderHomeBlock(days)), 'footer', footerBlock));

  for (const page of ['404.html', 'work/index.html', 'about/index.html', 'privacy/index.html']) {
    const src = readFileSync(resolve(root, page), 'utf8');
    put(page, marked(src, 'footer', footerBlock));
  }

  prune();

  const stages = Object.keys(STAGES)
    .map((st) => `${st} ${wiki.filter((w) => w.meta.stage === st).length}`)
    .join(', ');
  console.log(
    `site: ${wiki.length} wiki (${stages}), ${days.length} editions, ` +
      `${written} file${written === 1 ? '' : 's'} written`
  );
}

main();
