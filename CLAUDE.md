# jains.es
Daily learning publication: LLMs from scratch, India and Global South, ESL readers. Daily job: `/daily`.
Rationale for every rule below: `DECISIONS.md`. Layout and deploys: `README.md`.

- Edit Markdown in `content/` only. `wiki/`, `day/`, `curriculum/`, `public/sitemap.xml`, `public/feed.xml`, `dist/` and the `generated:posts` block in `index.html` are build output.
- Never change a wiki slug or an edition's `day:` number once live. Both are URLs.
- Front matter is not YAML: `key: value` lines plus one `sources:` list. `tags`, `prereqs`, `related` are comma-separated strings.
- Source line: `tier | publisher | YYYY-MM-DD | title | url`, tier `primary` or `reported`. Evergreen pages and editions must cite.
- `npm run build` and `npm run check` must exit 0. Fix the page, never the check.
- Session files (`AI101/sessions/`) and Shorts (`content/shorts/`) are never published as pages.
- Writing: plain British English, sentences under 25 words, concrete before abstract, every analogy says where it breaks, every number names its source inline. No idiom, pun, emoji or sarcasm.
- `no-ai-slop`: apply provenance fixes only. Never strip formal register, em-dashes or semicolons.
- Article pages ship zero JavaScript. Dark mode is `#e6e6e6` on `#16181c`. CSS is mobile first.
- Subscribe form stays a plain GET form to Substack; never the iframe embed. No contact form; no custom cursor.
- Never touch DNS, add `main` to `wrangler.jsonc`, set `workers_dev: true`, or add pages to `vite.config.js`.
