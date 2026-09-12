// Generates every page that isn't hand-written: the blog index, the three topic
// pages, one page per post, sitemap.xml and feed.xml. Also rewrites the marked
// block in index.html so the homepage list is never edited by hand.
//
// Posts are Markdown with front matter in content/posts/. This script is the
// only place that knows the URL shape, so a post's metadata lives in exactly
// one file and nothing can drift out of sync.
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

const TIERS = {
  primary: 'Primary',
  reported: 'Reported',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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

const head = ({ title, description, url, ogTitle, ogDescription, extra = '' }) => `<!DOCTYPE html>
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
<script type="module" src="/src/main.js"></script>
${extra}</head>
<body>

${LOGO}

<nav class="nav">
  <a class="mark" href="/" aria-label="jains.es — home"><svg class="logo" role="img" aria-label="jains.es"><use href="#logo"/></svg></a>
  <a class="pill" href="/#contact">Start a project</a>
</nav>
`;

const footer = `
<footer>
  <div class="wrap">
    <div class="foot-top">
      <div><a href="/#work">Work</a> &nbsp;·&nbsp; <a href="/blog/">Writing</a> &nbsp;·&nbsp; <a href="/">Home</a> &nbsp;·&nbsp; <a href="https://github.com/jpysh" target="_blank" rel="noopener">GitHub</a></div>
      <div><a href="https://wa.me/420777558262" target="_blank" rel="noopener">+420 777 558 262</a> &nbsp;·&nbsp; <a href="mailto:helloayursen@gmail.com">helloayursen@gmail.com</a></div>
    </div>
    <div class="wordmark"><svg class="logo" role="img" aria-label="jains.es"><use href="#logo"/></svg></div>
    <p class="legal">Jains AI and Digital Transformation Agency. Built and hosted on Cloudflare.</p>
  </div>
</footer>

</body>
</html>
`;

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

const postRows = (posts) =>
  `<div class="posts">\n` +
  posts
    .map(
      (p) => `  <a data-cursor="post" class="post" href="${p.path}">
    <h3>${esc(p.meta.title)}</h3>
    <span class="meta"><time datetime="${p.meta.date}">${longDate(p.meta.date)}</time></span>
  </a>`
    )
    .join('\n') +
  `\n</div>`;

function renderPost(p, posts) {
  const cat = CATEGORIES[p.meta.category];
  const next = posts.find((o) => o.slug !== p.slug && o.meta.category === p.meta.category) || posts.find((o) => o.slug !== p.slug);

  const sources = `
  <section class="sources">
    <h2>Sources</h2>
    <ol>
${p.meta.sources
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

  <p>We build AI products and digital transformation for SMBs and enterprise HR and tech teams — live in one to seven days, about two hours a week of your time, handed over in a repository you own. <a href="/#contact">Tell us what's stuck.</a></p>
${next ? `\n  <p><a class="back" href="${next.path}">Next: ${esc(next.meta.title)} →</a></p>\n` : ''}
</article>
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

// --- sitemap and feed -------------------------------------------------------

function renderSitemap(posts) {
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

  return `  <nav class="topic-links" aria-label="Topics">
${topics.map(([slug, cat]) => `    <a href="/blog/topic/${slug}/">${esc(cat.name)}</a>`).join('\n')}
  </nav>

${postRows(latest)
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
  for (const f of globSync('blog/**/index.html', { cwd: root })) {
    if (kept.has(f)) continue;
    rmSync(resolve(root, f));
    rmSync(dirname(resolve(root, f)), { recursive: true, force: true });
    console.log(`blog: removed stale ${f}`);
  }
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

  put('public/sitemap.xml', renderSitemap(posts));
  put('public/feed.xml', renderFeed(posts));

  const block = renderHomeBlock(posts);
  const re = /(<!-- generated:posts -->)[\s\S]*?( *<!-- \/generated:posts -->)/;
  if (!re.test(homeSrc)) throw new Error('index.html is missing the <!-- generated:posts --> markers');
  put('index.html', homeSrc.replace(re, `$1\n${block}\n$2`));

  prune();

  const counts = Object.entries(CATEGORIES)
    .map(([slug]) => `${slug} ${posts.filter((p) => p.meta.category === slug).length}`)
    .join(', ');
  console.log(`blog: ${posts.length} posts (${counts}), ${written} file${written === 1 ? '' : 's'} written`);
}

main();
