# jains.es

A daily learning publication. One person building language models from
scratch and publishing every session — written for India, the Global South,
and anyone reading English as a second or third language.

Hand-written HTML and CSS, built with Vite, deployed to Cloudflare Workers
Static Assets. No framework, no database, no server.

- **[CLAUDE.md](CLAUDE.md)** — the things that are expensive to get wrong
- **[WRITING.md](WRITING.md)** — front matter, source tiers, how pages accrete
- **[AI101/WORKFLOW.md](AI101/WORKFLOW.md)** — the daily pipeline, with diagrams
- **[DECISIONS.md](DECISIONS.md)** — why the rules are shaped as they are; long design history in `AI101/archive/`

## Two surfaces

```
content/days/<date>.md   ->  /day/<n>/       the edition. Dated, a day old
content/wiki/<slug>.md   ->  /wiki/<slug>/   the topic. Accretes, outlives
```

`/curriculum/` is generated from `AI101/CURRICULUM.md`. `/`, `/about/`,
`/privacy/` and `/work/` are hand-written.

`AI101/sessions/<date>.md` is the third file of a day and is **not a page**:
the plan, the beats, the script, and the two sections only the human fills.
Committed because the method is part of what is published.

## Layout

```
content/
  days/<date>.md           one edition per day
  wiki/<slug>.md           one page per topic
AI101/                     the operating system — see AI101/README.md
  CURRICULUM.md  WORKFLOW.md  archive/
  prompts/                 daily-research, newsletter, LEARNED
  sources/                 SOURCES.md, subscriptions.opml
  sessions/<date>.md       the daily working file
  tools/news-sweep.sh      reads NetNewsWire's local store
build/
  site.js                  generates every page, validates, refuses bad input
  check.sh                 proves the validation still fires
  make-logo.py             regenerates the wordmark and favicon, by hand
src/
  main.js                  entry for the pages that carry script
  styles.css               all styling
  hero.js                  the homepage particle field, after first paint
public/                    copied verbatim; _headers holds the CSP
.claude/commands/          /daily /audit
```

`wiki/`, `day/`, `curriculum/`, `sitemap.xml` and `feed.xml` are **generated
and gitignored**. Edit the Markdown in `content/`.

## Daily

```bash
/daily          # session, edition, wiki, Short, audit, one PR
/audit          # fresh context, opens every citation (also run inside /daily)
```

## Build and deploy

```bash
npm install
npm run dev       # local preview
npm run check     # proves the build refuses bad input
npm run build     # validates, generates, builds to dist/
```

The build **fails** on an unknown stage, a malformed date, a duplicate day
number, an evergreen page with no sources, a page with no tags, or a source
missing its tier. That is the point: it blocks an unsourced claim from
reaching a page.

Pushing to `main` deploys via Cloudflare Workers Builds, usually within a
minute. A failing build leaves the previous version live, so a broken commit
takes the deploy down and not the site.

```bash
curl -o /dev/null -w '%{http_code}\n' https://jains.es/README.md   # 404 is correct
```

Only `dist/` is uploaded, and `dist/` is build output, so nothing in this
repository is served.

## Licence, and translating

Code is **MIT**. Writing is **[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)**.
See [LICENSE](LICENSE).

**Translation is explicitly welcome.** Much of the intended audience reads
English as a second or third language, and a good Hindi, Tamil, Bengali,
Swahili or Yoruba version of a page is worth more to that reader than the
original. Credit and a link back is the whole requirement. If a page is marked
`stage: seedling`, carry that marker across — it says the page is rough and
probably wrong in places, and a translation should say so too.

## Questions, corrections, arguments

[Discussions](https://github.com/jpysh/jains.es/discussions) is open. Every
page on the site also has an **Edit this page** link that opens its source file
here. Corrections are the most useful thing anyone can send, and they get an
explanation rather than a silent edit — what was wrong, how it got through,
how it was caught.

## Zero JavaScript where it counts

Wiki pages, editions, `/about/` and `/privacy/` ship no executable script —
only `ld+json`, which is data. Low-tier Android is roughly 9× slower than a
development machine, so script costs main-thread time as well as bytes on
exactly the device most of this audience holds.
