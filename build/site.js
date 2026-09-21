// Generates every page that isn't hand-written: the blog index, the three topic
// pages, one page per post, sitemap.xml and feed.xml. Also rewrites the marked
// block in index.html so the homepage list is never edited by hand.
//
// Three content types, all Markdown with front matter, all rendered here:
//
//   content/posts/<slug>.md    -> /blog/<slug>/   the 23-post archive
//   content/wiki/<slug>.md     -> /wiki/<slug>/   the learning body
//   content/lessons/<date>.md  -> /day/<n>/       one per day
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

// Slugs are industry nouns because that is what readers search for; the display
// name is the fuller description. Both are permanent once a topic page is live.
export const CATEGORIES = {
  'retail-tech': {
    name: 'Retail and commerce tech',
    blurb: 'Commerce technology, storefronts, payments and the AI actually reaching retail operations.',
  },
  hrtech: {
    name: 'Work and talent tech',
    blurb: 'Hiring, HR systems, skills and the technology reshaping how organisations staff themselves.',
  },
  edtech: {
    name: 'Learning and training tech',
    blurb: 'Corporate training, edtech platforms and how teams actually build capability.',
  },
};

const REPO = 'https://github.com/jpysh/jains.es';

// A page says out loud how finished it is. That is what makes publishing rough
// work honest rather than sloppy, and it is what licenses shipping daily.
const STAGES = {
  seedling: 'Seedling — rough, and likely wrong in places',
  budding: 'Budding — checked, still growing',
  evergreen: 'Evergreen — audited against its sources',
};

const WIKI_TYPES = ['concept', 'lesson', 'person', 'synthesis'];

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
// The build fails rather than shipping a post that silently falls out of its
// topic page, loses its date, or carries an unattributed claim. This is the
// whole reason a daily cadence can be trusted.

function validate(posts) {
  const errors = [];
  const seen = new Map();

  for (const p of posts) {
    const at = p.file;
    if (!p.meta.title) errors.push(`${at}: no title`);
    if (!p.meta.description) errors.push(`${at}: no description (used for the meta description and the feed)`);
    if (!p.meta.date) errors.push(`${at}: no date`);
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(p.meta.date)) errors.push(`${at}: date must be YYYY-MM-DD, got "${p.meta.date}"`);

    if (!p.meta.category) errors.push(`${at}: no category`);
    else if (!CATEGORIES[p.meta.category])
      errors.push(`${at}: unknown category "${p.meta.category}" — must be one of ${Object.keys(CATEGORIES).join(', ')}`);

    if (seen.has(p.slug)) errors.push(`${at}: duplicate slug "${p.slug}", already used by ${seen.get(p.slug)}`);
    seen.set(p.slug, at);

    if (!p.meta.sources.length) errors.push(`${at}: no sources — every post cites at least one`);
    p.meta.sources.forEach((s, i) => {
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

  if (errors.length) {
    console.error(`\nBlog build failed — ${errors.length} problem${errors.length > 1 ? 's' : ''}:\n`);
    for (const e of errors) console.error(`  ${e}`);
    console.error('');
    process.exit(1);
  }
}

// Sources are validated identically wherever they appear. Kept separate from
// validate() so wiki pages and lessons get the same discipline as posts without
// inheriting a post's required fields.
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
    if (!w.meta.type) errors.push(`${at}: no type`);
    else if (!WIKI_TYPES.includes(w.meta.type))
      errors.push(`${at}: unknown type "${w.meta.type}" — must be one of ${WIKI_TYPES.join(', ')}`);
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
// otherwise renumber every later lesson and 404 URLs that are already indexed.
function validateLessons(lessons) {
  const errors = [];
  const seenDay = new Map();
  for (const l of lessons) {
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
  fail(errors, 'Lessons');
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
  <a class="pill" href="/#contact">Start a project</a>
</nav>
`;

const footer = `
<footer id="contact">
  <div class="wrap">
    <p class="foot-lead">A reply within <em class="s">24 hours</em>, and a call with the person who will do the work.</p>
    <div class="foot-cta">
      <a class="pill" href="https://wa.me/420777558262?text=Hi%20&mdash;%20I%20found%20jains.es%20and%20wanted%20to%20talk%20about%20a%20project." target="_blank" rel="noopener">WhatsApp us</a>
      <a class="pill ghost" href="mailto:helloayursen@gmail.com?subject=Project%20enquiry%20via%20jains.es">Email us</a>
    </div>
    <nav class="foot-links" aria-label="Footer">
      <a href="/#work">Work</a>
      <a href="/blog/">Writing</a>
      <a href="/">Home</a>
      <a href="https://github.com/jpysh" target="_blank" rel="noopener">GitHub</a>
    </nav>
  </div>
</footer>

<a class="to-top" href="#top" aria-label="Back to top">
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
</a>

</body>
</html>
`;

// One renderer for posts, wiki pages and lessons. The tier key is repeated on
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

const postRows = (posts, { showTopic = false } = {}) =>
  `<div class="posts">\n` +
  posts
    .map(
      (p) => `  <a class="post" href="${p.path}">
    <h3>${esc(p.meta.title)}</h3>
    <span class="meta post-meta"><time datetime="${p.meta.date}">${longDate(p.meta.date)}</time>${
      showTopic
        ? `<span class="dot" aria-hidden="true">·</span><span class="post-topic">${esc(CATEGORIES[p.meta.category].name)}</span>`
        : ''
    }</span>
  </a>`
    )
    .join('\n') +
  `\n</div>`;

function renderPost(p, posts) {
  const cat = CATEGORIES[p.meta.category];

  // Related posts, generated rather than hand-linked. Same category first,
  // newest first, topped up from the rest of the blog if the category is thin.
  // Every post therefore carries links to its topic page and to three others,
  // which is what stops a 23-post blog being 23 orphans.
  const sameCat = posts.filter((o) => o.slug !== p.slug && o.meta.category === p.meta.category);
  const others = posts.filter((o) => o.slug !== p.slug && o.meta.category !== p.meta.category);
  const related = [...sameCat, ...others].slice(0, 3);

  const sources = sourcesBlock(p.meta);

  const schema = ld({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.meta.title,
    description: p.meta.description,
    datePublished: p.meta.date,
    dateModified: p.meta.updated || p.meta.date,
    articleSection: cat.name,
    image: `${ORIGIN}/assets/og.jpg`,
    inLanguage: 'en',
    mainEntityOfPage: { '@type': 'WebPage', '@id': p.url },
    author: { '@type': 'Organization', name: AUTHOR, url: `${ORIGIN}/` },
    publisher: {
      '@type': 'Organization',
      name: AUTHOR,
      url: `${ORIGIN}/`,
      logo: { '@type': 'ImageObject', url: `${ORIGIN}/assets/logo.svg` },
    },
    citation: p.meta.sources.map((s) => ({
      '@type': 'CreativeWork',
      name: s.title,
      url: s.url,
      datePublished: s.date,
      publisher: { '@type': 'Organization', name: s.publisher },
    })),
  });

  return (
    head({
      title: `${p.meta.title} — Jains`,
      description: p.meta.description,
      url: p.url,
      ogTitle: p.meta.ogTitle || p.meta.title,
      ogDescription: p.meta.ogDescription || p.meta.description,
      extra:
        `<meta property="og:type" content="article">\n` +
        `<meta property="article:published_time" content="${p.meta.date}">\n` +
        `<meta property="article:section" content="${esc(cat.name)}">\n` +
        schema +
        crumbs([
          ['Home', `${ORIGIN}/`],
          ['Writing', `${ORIGIN}/blog/`],
          [cat.name, `${ORIGIN}/blog/topic/${p.meta.category}/`],
          [p.meta.title, p.url],
        ]),
    }) +
    `
<article class="article">
  <nav class="crumbs" aria-label="Breadcrumb">
    <a href="/blog/">Writing</a> <span aria-hidden="true">/</span> <a href="/blog/topic/${p.meta.category}/">${esc(cat.name)}</a>
  </nav>

  <h1>${esc(p.meta.title)}</h1>
  <p class="meta"><time datetime="${p.meta.date}">${longDate(p.meta.date)}</time> · <a href="/blog/topic/${p.meta.category}/">${esc(cat.name)}</a></p>

${md.render(p.body).trim()}
${sources}
  <hr>

  <p>We build AI products and digital transformation for SMBs and enterprise HR and tech teams — live in one to seven days, about two hours a week of your time, handed over in a repository you own. <a href="/#work">See the work</a> or <a href="/#contact">tell us what's stuck.</a></p>
</article>
${
  related.length
    ? `
<section class="wrap related">
  <p class="eyebrow">More in <a href="/blog/topic/${p.meta.category}/">${esc(cat.name)}</a></p>
${postRows(related)}
  <p class="more"><a href="/blog/">All writing →</a></p>
</section>
`
    : ''
}
` +
    footer
  );
}

function renderIndex(posts) {
  // A category with no posts gets no heading and no chip: a jump link to an
  // empty anchor is worse than an absent topic.
  const groups = Object.entries(CATEGORIES)
    .map(([slug, cat]) => ({ slug, cat, posts: posts.filter((p) => p.meta.category === slug) }))
    .filter((g) => g.posts.length);

  return (
    head({
      title: 'Writing — Jains',
      description: `Analysis for senior teams in retail, HR and learning technology. ${posts.length} articles on what is actually changing and what to do about it.`,
      url: `${ORIGIN}/blog/`,
      extra:
        `<meta property="og:type" content="website">\n` +
        ld({
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'Jains — Writing',
          url: `${ORIGIN}/blog/`,
          inLanguage: 'en',
          publisher: { '@type': 'Organization', name: AUTHOR, url: `${ORIGIN}/` },
        }) +
        itemList(posts) +
        crumbs([
          ['Home', `${ORIGIN}/`],
          ['Writing', `${ORIGIN}/blog/`],
        ]),
    }) +
    `
<section class="wrap blog-index">
  <p class="eyebrow">Writing</p>
  <h1 class="title">What's actually changing,<br>and what to do about it.</h1>
  <p class="lede dim">Analysis for people who run retail, talent and learning functions. Every claim carries its source.</p>

  <span class="rail">Browse by topic</span>
  <nav class="topic-nav" aria-label="Topics">
${groups.map((g) => `    <a href="#${g.slug}">${esc(g.cat.name)} <span>${g.posts.length}</span></a>`).join('\n')}
  </nav>

${groups
  .map(
    (g) => `  <section class="topic-group" id="${g.slug}">
    <h2><a href="/blog/topic/${g.slug}/">${esc(g.cat.name)}</a></h2>
    <p class="dim">${esc(g.cat.blurb)}</p>
${postRows(g.posts)
  .split('\n')
  .map((l) => `    ${l}`)
  .join('\n')}
  </section>`
  )
  .join('\n\n')}
</section>
` +
    footer
  );
}

function renderTopic(slug, cat, posts) {
  return (
    head({
      title: `${cat.name} — Jains`,
      description: cat.blurb,
      url: `${ORIGIN}/blog/topic/${slug}/`,
      extra:
        `<meta property="og:type" content="website">\n` +
        ld({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: cat.name,
          description: cat.blurb,
          url: `${ORIGIN}/blog/topic/${slug}/`,
          inLanguage: 'en',
          isPartOf: { '@type': 'Blog', name: 'Jains — Writing', url: `${ORIGIN}/blog/` },
        }) +
        itemList(posts) +
        crumbs([
          ['Home', `${ORIGIN}/`],
          ['Writing', `${ORIGIN}/blog/`],
          [cat.name, `${ORIGIN}/blog/topic/${slug}/`],
        ]),
    }) +
    `
<section class="wrap blog-index">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/blog/">Writing</a></nav>
  <p class="eyebrow">Topic</p>
  <h1 class="title">${esc(cat.name)}</h1>
  <p class="lede dim">${esc(cat.blurb)}</p>

${postRows(posts)}

  <p class="more"><a href="/blog/">All writing →</a></p>
</section>
` +
    footer
  );
}

// --- wiki and lessons -------------------------------------------------------
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
  const byStage = Object.keys(STAGES)
    .map((stage) => ({ stage, pages: rest.filter((w) => w.meta.stage === stage) }))
    .filter((g) => g.pages.length);

  return (
    head({
      title: 'Wiki — Jains',
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
  <p class="lede dim">Every page says how finished it is. A seedling is rough and probably wrong in places; that is why it says so.</p>
${start ? `\n  <p class="more"><a href="${start.path}">Start here →</a></p>\n` : ''}
${byStage
  .map(
    (g) => `  <section class="topic-group" id="${g.stage}">
    <h2>${g.stage.charAt(0).toUpperCase() + g.stage.slice(1)}</h2>
    <p class="dim">${esc(STAGES[g.stage])}</p>
    <div class="posts">
${g.pages
  .map(
    (w) => `      <a class="post" href="${w.path}">
        <h3>${esc(w.meta.title)}</h3>
        <span class="meta post-meta">${esc(w.meta.summary)}</span>
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

function renderLesson(l, lessons) {
  const i = lessons.indexOf(l);
  const newer = lessons[i - 1];
  const older = lessons[i + 1];

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

function renderDayIndex(lessons) {
  return (
    head({
      title: 'Daily — Jains',
      description: `Learning to build language models from scratch, one day at a time. ${lessons.length} day${lessons.length === 1 ? '' : 's'} so far, including the ones that did not work.`,
      url: `${ORIGIN}/day/`,
      noScript: true,
      extra:
        `<meta property="og:type" content="website">\n` +
        itemList(lessons) +
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
${lessons
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

function renderSitemap(posts, wiki = [], lessons = []) {
  const newest = posts[0]?.meta.date;
  const urls = [
    { loc: `${ORIGIN}/`, lastmod: newest, priority: '1.0' },
    { loc: `${ORIGIN}/blog/`, lastmod: newest, priority: '0.9' },
    ...Object.entries(CATEGORIES)
      .filter(([slug]) => posts.some((p) => p.meta.category === slug))
      .map(([slug]) => ({
        loc: `${ORIGIN}/blog/topic/${slug}/`,
        lastmod: posts.find((p) => p.meta.category === slug).meta.date,
        priority: '0.7',
      })),
    ...posts.map((p) => ({ loc: p.url, lastmod: p.meta.updated || p.meta.date, priority: '0.8' })),
    ...(wiki.length ? [{ loc: `${ORIGIN}/wiki/`, lastmod: wiki[0].meta.modified || wiki[0].meta.created, priority: '0.9' }] : []),
    ...wiki.map((w) => ({ loc: w.url, lastmod: w.meta.modified || w.meta.created, priority: '0.7' })),
    ...(lessons.length ? [{ loc: `${ORIGIN}/day/`, lastmod: lessons[0].meta.date, priority: '0.9' }] : []),
    ...lessons.map((l) => ({ loc: l.url, lastmod: l.meta.date, priority: '0.8' })),
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

function renderFeed(posts) {
  const rfc = (iso) => new Date(`${iso}T09:00:00Z`).toUTCString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by build/site.js. Do not edit; your changes will be overwritten. -->
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Jains — Writing</title>
    <link>${ORIGIN}/blog/</link>
    <atom:link href="${ORIGIN}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Analysis for senior teams in retail, HR and learning technology.</description>
    <language>en</language>
    <lastBuildDate>${rfc(posts[0].meta.date)}</lastBuildDate>
${posts
  .map(
    (p) => `    <item>
      <title>${esc(p.meta.title)}</title>
      <link>${p.url}</link>
      <guid isPermaLink="true">${p.url}</guid>
      <pubDate>${rfc(p.meta.date)}</pubDate>
      <category>${esc(CATEGORIES[p.meta.category].name)}</category>
      <description>${esc(p.meta.description)}</description>
    </item>`
  )
  .join('\n')}
  </channel>
</rss>
`;
}

// --- homepage block ---------------------------------------------------------
// index.html stays hand-written apart from this one region, so the three newest
// posts are never stale and the topic links never point at an empty category.

function renderHomeBlock(posts) {
  const latest = posts.slice(0, 3);
  const topics = Object.entries(CATEGORIES).filter(([slug]) => posts.some((p) => p.meta.category === slug));

  return `  <span class="rail">Browse by topic</span>
  <nav class="topic-links" aria-label="Topics">
${topics.map(([slug, cat]) => `    <a href="/blog/topic/${slug}/">${esc(cat.name)}</a>`).join('\n')}
  </nav>

  <span class="rail">Latest articles</span>
${postRows(latest, { showTopic: true })
  .split('\n')
  .map((l) => `  ${l}`)
  .join('\n')}

  <p class="more"><a href="/blog/">All ${posts.length} article${posts.length === 1 ? '' : 's'} →</a></p>`;
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
  for (const f of globSync('{blog,wiki,day}/**/index.html', { cwd: root })) {
    if (kept.has(f)) continue;
    rmSync(resolve(root, f));
    rmSync(dirname(resolve(root, f)), { recursive: true, force: true });
    console.log(`blog: removed stale ${f}`);
  }
}

function load(dirname, shape) {
  const dir = resolve(root, `content/${dirname}`);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const slug = file.replace(/\.md$/, '');
      const { meta, body } = parse(readFileSync(resolve(dir, file), 'utf8'), `content/${dirname}/${file}`);
      return { slug, file: `content/${dirname}/${file}`, meta, body, mins: readingTime(body), ...shape(slug, meta) };
    });
}

function main() {
  const dir = resolve(root, 'content/posts');
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  if (!files.length) throw new Error('content/posts/ has no .md files');

  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const { meta, body } = parse(readFileSync(resolve(dir, file), 'utf8'), `content/posts/${file}`);
    return { slug, file: `content/posts/${file}`, meta, body, path: `/blog/${slug}/`, url: `${ORIGIN}/blog/${slug}/` };
  });

  validate(posts);
  posts.sort((a, b) => (a.meta.date < b.meta.date ? 1 : a.meta.date > b.meta.date ? -1 : a.slug.localeCompare(b.slug)));

  for (const p of posts) put(`blog/${p.slug}/index.html`, renderPost(p, posts));
  put('blog/index.html', renderIndex(posts));
  for (const [slug, cat] of Object.entries(CATEGORIES)) {
    const inCat = posts.filter((p) => p.meta.category === slug);
    if (inCat.length) put(`blog/topic/${slug}/index.html`, renderTopic(slug, cat, inCat));
  }

  // Wiki pages. Absent directory is fine — it appears with the first page.
  const wiki = load('wiki', (slug) => ({ path: `/wiki/${slug}/`, url: `${ORIGIN}/wiki/${slug}/` }));
  validateWiki(wiki);
  wiki.sort((a, b) => a.meta.title.localeCompare(b.meta.title));
  const bySlug = new Map(wiki.map((w) => [w.slug, w]));
  for (const w of wiki) put(`wiki/${w.slug}/index.html`, renderWiki(w, bySlug));
  if (wiki.length) put('wiki/index.html', renderWikiIndex(wiki));

  // Lessons. The day number is the URL and comes from the front matter, so a
  // missed day never renumbers a page that is already indexed.
  const lessons = load('lessons', (slug, meta) => ({ path: `/day/${meta.day}/`, url: `${ORIGIN}/day/${meta.day}/` }));
  validateLessons(lessons);
  lessons.sort((a, b) => Number(b.meta.day) - Number(a.meta.day));
  for (const l of lessons) put(`day/${l.meta.day}/index.html`, renderLesson(l, lessons));
  if (lessons.length) put('day/index.html', renderDayIndex(lessons));

  put('public/sitemap.xml', renderSitemap(posts, wiki, lessons));
  put('public/feed.xml', renderFeed(posts));

  const block = renderHomeBlock(posts);
  const re = /(<!-- generated:posts -->)[\s\S]*?( *<!-- \/generated:posts -->)/;
  if (!re.test(homeSrc)) throw new Error('index.html is missing the <!-- generated:posts --> markers');
  put('index.html', homeSrc.replace(re, `$1\n${block}\n$2`));

  prune();

  const counts = Object.entries(CATEGORIES)
    .map(([slug]) => `${slug} ${posts.filter((p) => p.meta.category === slug).length}`)
    .join(', ');
  console.log(
    `site: ${posts.length} posts (${counts}), ${wiki.length} wiki, ${lessons.length} lessons, ` +
      `${written} file${written === 1 ? '' : 's'} written`
  );
}

main();
