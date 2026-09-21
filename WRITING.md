# Writing

How a page gets from an idea to a live URL. `CLAUDE.md` holds the
prohibitions; this file holds the process. `AI101/WORKFLOW.md` holds the daily
pipeline — what runs when, which prompt, which skill.

Replaces `BLOGGING.md`. The blog is gone: the 23 posts it described are now
wiki pages, and nothing new is published to `/blog/`.

## Two surfaces

```
content/days/<date>.md   ->  /day/<n>/      the edition, written by /newsletter
content/wiki/<slug>.md   ->  /wiki/<slug>/  the topic, written by /wiki
```

`AI101/sessions/<date>.md` is the third file of a day and is **not a page**.
It holds the plan, the beats, the script and the two sections only the human
fills. It is committed because the method is part of what is published.

## The edition

```
---
title: Sentence-case, no trailing full stop
day: 12
date: YYYY-MM-DD
summary: One sentence. Meta description and the line on the index.
sources:
  - primary | Publisher | YYYY-MM-DD | Exact title | https://...
---
```

**`day` is the URL, and it is declared rather than counted.** Deriving it from
file order would mean one missed day renumbers every later edition and moves
pages that are already live. Duplicate day numbers fail the build.

Eight sections, 900–1,100 words, five minutes on a phone. The structure and
the five locks are in `AI101/prompts/newsletter.md`. A failed session still
publishes an edition — that is the format, not a gap.

Every concept with a wiki page is **linked on first mention**. A concept named
across three editions with still no page is a page waiting to be written.

## The wiki page

```
---
title: Byte-pair encoding
summary: One sentence. Meta description and the line under the title.
stage: seedling | budding | evergreen
created: YYYY-MM-DD
modified: YYYY-MM-DD          optional; falls back to created
tags: tokenisation, bpe       comma-separated string, never a list
prereqs: what-a-token-is      comma-separated slugs, optional
related: vocabulary-size      comma-separated slugs, optional
sources:
  - primary | Publisher | YYYY-MM-DD | Exact title | https://...
---
```

**The first tag is the cluster** the index files the page under. `CLUSTERS` in
`build/site.js` orders the known ones; anything else appears automatically,
sorted after them.

`prereqs` and `related` are slugs. One that does not resolve is dropped rather
than rendering a dead link, so a page can name a prerequisite before it is
written and the link appears the day it is.

### Stage

- **seedling** — rough, written the day it was learnt, likely wrong in places.
  **Sources not required.** That is what the label buys, and it is what makes
  publishing daily honest rather than sloppy.
- **budding** — checked and revised, still growing.
- **evergreen** — audited by `/audit`, every citation opened. **The build
  refuses an evergreen page with no sources.**

Moving a page to `evergreen` by hand, without `/audit` passing clean, defeats
the only signal a reader has. Do not.

## Pages accrete; they are not appended

A session does not become a new page. It is folded into the topic it belongs
to. A reader wants one page on tokenisation that got better today, not thirty
dated fragments. When today contradicts what is on a page, say what changed and
why **in the page** — a silent correction is worse than none, because it tells
a reader the page moved without telling them why the new version deserves more
trust.

## Source tiers

- **primary** — the regulator, vendor, paper, survey or filing *itself*
- **reported** — a named outlet reporting a fact first, ideally with the
  reporter named in the publisher field

The tier describes **the URL**, not the organisation that produced the data. A
survey reached through a news article is `reported`, publisher the outlet.
Getting this backwards makes the tiers worse than useless, and it has already
happened once.

**Nothing may predate a source it cites.** If a source cannot be dated, cite it
as an inline link in the prose, where no date is claimed, and leave it out of
the front matter. Never substitute the date you accessed it.

## Writing standard

Plain British English. One idea per sentence, under 25 words. ESL-first,
because much of the audience reads English as a second or third language.

- **Concrete before abstract.** Never open with a definition.
- **Every analogy states where it breaks**, in the same paragraph, and never
  replaces the mechanism.
- **Every statistic carries a named source inline.** A number with no
  traceable source gets cut, not softened to "studies suggest".
- No emoji, no idiom, no pop-culture reference, no pun, no sarcasm. Dry wit
  only where it is about the concept.
- **Legal care.** A proposed rule is not a rule. A denied motion to dismiss is
  not a finding of liability. Say what has and has not been decided.
- Never write a sentence implying research standing nobody here has.

`no-ai-slop` runs inside the newsletter prompt, **detect-only for register**.
It applies provenance fixes and never edits formal register, em-dashes or
semicolons. Detectors flag non-native English at roughly a 61% false-positive
rate, and formal register is a competence marker in Indian professional
English. The defence against slop is provenance, not stylistic contortion.

## Before publishing

```bash
npm run check    # proves the build still refuses bad input
npm run build    # must exit 0
npm run dev      # look at an edition and a wiki page
```

Pushing to `main` deploys via Cloudflare Workers Builds, usually within a
minute. A failing build leaves the previous version live.
