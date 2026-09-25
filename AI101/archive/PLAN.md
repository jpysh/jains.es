# AI101 — build plan (draft 2)

One person, six months, learning to build LLMs from scratch in public.
Written for agents to execute and for one human to steer.

**Changed since draft 1:** the dormant-email campaign is deleted (it was
unlawful); the video format is vertical-only by decision; the compute
curriculum is corrected downward by roughly 10×; the daily runbook, curriculum
and prompts have moved into their own files; four automation bugs are fixed.

**Companion files:** [`CURRICULUM.md`](CURRICULUM.md) ·
[`RUNBOOK.md`](RUNBOOK.md) · [`prompts/`](prompts/) · [`sources/`](sources/)

---

## 0. The shape of it

Every day produces **one artefact chain**: a study session becomes a wiki page,
becomes a video, becomes a newsletter, becomes a LinkedIn post. One act of
learning, four outputs. Nothing is researched twice.

The system drafts. The human decides and edits. Three things never happen
without the human: **publishing, sending, and approving the day's angle.**

| Decision | Settled as |
|---|---|
| Months 1–3 | Tokenisation → bigram → backprop → attention → a ~30–50M GPT trained to a real loss |
| Months 4–6 | Making models small enough to matter: quantization, QLoRA, distillation, pruning, inference optimisation |
| Compute ceiling | ~50M params. GPT-2-124M and nanochat become *explained*, not *trained* — see §4 |
| Audience | India-primary, Global South broadly, diaspora. Ages ~17–68. Many ESL. |
| Register | Plain British English, short sentences, ESL-first. Dry wit only when it is *about* the concept |
| Video | **Vertical only**, including long-form. Readers are on phones. |
| Publishing | Daily, from day one: YouTube + newsletter + LinkedIn |
| Repo | One public monorepo (`jains.es`), `AI101` folded in |
| Agents | Two: scout and auditor. Everything else is a skill or a hook |
| Autonomy | Agents open pull requests; the human merges |
| Monetization | Out of scope entirely |
| Review | No kill criteria. Full audit at **day 90**, heads down until then |
| Goal | Readers read, share, engage |

---

## 1. Repo consolidation

`jains.es` already is the machine: Vite, Cloudflare Workers static assets,
Markdown with validated front matter, a generator producing pages, indexes,
sitemap and feed, and a build that refuses to ship an unsourced claim. We
extend it. We do not add a second static site generator.

### 1.1 Layout

```
jains.es/
  content/
    posts/<slug>.md              existing 23 posts — LEFT ALONE
    wiki/<slug>.md               the learning body
    lessons/<YYYY-MM-DD>.md      one per day: angle, beats, script, news
    predictions.json             later
  AI101/
    CURRICULUM.md  RUNBOOK.md  PLAN.md
    prompts/       daily-research.md, newsletter.md
    sources/       SOURCES.md          ← the only place sources are configured
    runs/<date>-<name>/README.md       lab notebook: config, curve, what broke
  build/  site.js  new-post.js  lint.js
  .claude/  skills/  agents/  hooks/
  .github/workflows/nightly.yml
  TASKS.md  DECISIONS.md  STYLE.md  CLAUDE.md  BLOGGING.md
```

Subscriber data never enters this tree. It lives in
`/Users/webserver/code/private/`, outside every repo.

### 1.2 The 23 existing posts — leave them where they are

Draft 1 proposed moving them to `/writing/` and retiring the topic pages. That
was four hours of work for zero reader benefit, and it would have spent the
credibility of the "never rename a live post" rule on nothing. They are
competent, sourced, dated work by a named person in adjacent territory, which
is trust-positive.

Instead: one sentence on `/about` — *"Before this I wrote about retail, HR and
education technology; that archive is here."* Five minutes.

### 1.3 CLAUDE.md changes

One prohibition reverses, with the reason recorded so no future agent
reinstates it: **"never add a form, an input, a textarea or a newsletter
signup."** Email capture is now the primary conversion. The original reason —
a contact form was noise on an agency one-pager — does not apply to a
publication.

The "never rename a live post" rule and the frozen categories both **stay**,
because §1.2 means we are no longer fighting them.

CLAUDE.md stays under 200 lines. It loads on every request and is copied into
every subagent's context, so length there is a cost multiplier. Procedural
material goes to skills; path-specific rules go to `.claude/rules/`.

### 1.4 Site positioning

Currently: *"We ship AI products and Digital Transformation in days, not
quarters."* Corporate "we", no named person, `/about` returns 404.

New homepage: what this is, who is doing it, what day it is on, one email
field. The agency becomes `/work/`. **`/about` must be built** — it does not
exist, and every trust framework puts author identity at or near the top.

**Also needed and missing from draft 1: a privacy notice.** An EU-resident
controller collecting email addresses needs a lawful basis, a retention
statement, and the notice presented *at the point of collection*. One page,
twenty minutes.

---

## 2. The system

### 2.1 Two agents

Multi-agent setups use 3–10× the tokens of a single agent, and splitting by
*role* rather than by *context requirement* is the documented anti-pattern.
Anthropic's own content pipeline runs on two subagents.

**scout** — `haiku`, `omitClaudeMd: true`, `maxTurns: 15`, web tools + Write.
Qualifies because it generates high-volume output nobody re-reads.

**auditor** — `sonnet`, `omitClaudeMd: true`, read-only. Qualifies because a
context that did not write the draft cannot rationalise it.

Wiki page, newsletter, script and LinkedIn post are written **in one context,
one pass**. They need identical inputs; splitting them produces four drafts
that disagree about what the story is.

### 2.2 Hooks

An instruction in CLAUDE.md is a request. A hook is enforcement.

| Hook | Does |
|---|---|
| `Stop` | Runs `build/lint.js`. Exit 2 blocks. **Retry counter: after 3 attempts, fail open with a `LINT-FAILED` marker in the PR body** — otherwise the loop burns turns until `--max-turns` trips and exits in error, leaving a half-written branch |
| `PostToolUse` on `Write\|Edit` | Front-matter validator on the changed file |
| `PreToolUse` on `Bash` | Filters verbose output before it enters context. Highest-leverage token saving available |
| `SessionEnd` | Appends run log and token cost to `~/.claude/logs/pipeline.jsonl` |

**`lint.js` starts with four rules, not twenty-eight.** We have written zero
lessons and do not yet know which rules matter. Write twenty lessons, notice
what keeps going wrong, then encode that. The four to start: every claim has a
resolvable source link; no vague attribution (`experts say`, `studies show`);
no model artefacts; sentences under 25 words.

### 2.3 Scheduling and the four bugs draft 1 shipped

`launchd` **LaunchAgent** on the Intel mini — not a LaunchDaemon, which cannot
reach the keychain for `git push`. Absolute paths; `~` is not expanded; logs to
`~/.claude/logs/`, never `~/Documents` (TCC blocks it). Pin Claude Code to
≥2.1.259 in the plist or `--permission-prompts none` silently changes behaviour
on update.

```
claude -p --permission-mode dontAsk --permission-prompts none \
       --max-turns 40 --max-budget-usd 2 --output-format json \
       --allowedTools "Read,Write,Edit,WebSearch,WebFetch,Bash(git *),Bash(gh pr create *)"
```

Three fixes visible there: **`gh pr create` is not `git`** — without it in the
allowlist the call is denied, the run continues, and you get a pushed branch,
no PR, and a success report. `--max-budget-usd` is the enforcement the hooks
philosophy demands. And **post-production moves to the M2 Air**, because
`mlx-whisper` is Apple-Silicon-only and cannot execute on the Intel mini; the
mini keeps scouting, drafting, git and CI.

Backup path: the Claude Code GitHub Action with `CLAUDE_CODE_OAUTH_TOKEN` from
`claude setup-token`, which bills the Pro subscription. Actions minutes are
free on public repos.

### 2.4 Token budget

The nightly pipeline is roughly 3–4M cumulative input tokens before caching,
most of it Sonnet — against a Pro plan that also funds your daytime work. Two
controls: `--max-budget-usd 2` as a hard stop, and **`/usage` read weekly for
the first month**, watching the auditor in particular, since opening every
citation is the most expensive line.

If it proves too expensive, the first lever is batching the scout weekly
(seven topics in one context) rather than nightly — roughly a 7× saving on the
hungriest agent.

### 2.5 Topic selection

The scout proposes a ranked shortlist with sources. You pick one, swap in a
paper you brought, or reject the lot. The picked line goes into
`content/lessons/<date>.md` and instructs the next run.

This keeps the one judgement with no verifiable success criterion — *is this
worth a reader's attention* — with the person whose name is on it.

---

## 3. Daily rhythm

Full detail in [`RUNBOOK.md`](RUNBOOK.md). Summary: overnight run at 05:00, you
decide at 06:00, **120 minutes of study**, record vertical, agent does
post-production, hand-upload to YouTube, edit and queue the newsletter for
15:30 Madrid (19:00 IST), post to LinkedIn, done by 10:15. Roughly 4h20.

Two things draft 1 got wrong and the runbook now fixes: **a failed session is a
format, not a missed day** — *"here is what I tried, here is where it broke"* —
and **the buffer banks finished days, not footage**, because banked footage
still needs post-production, a thumbnail, a wiki page and a newsletter.

### 3.1 Offline tasks

`TASKS.md` at the repo root: one line each, appended by the nightly run,
surfaced in the 10:05 block. Readable in the GitHub mobile app. Deleted when
done, not ticked.

---

## 4. Curriculum

Full twelve weeks in [`CURRICULUM.md`](CURRICULUM.md). The shape:
**tokenisation → bigram → backprop → attention → a real transformer → scale to
the ceiling → explain the ceiling**, then three months on compression.

Day one is tokenisation: count the tokens in the same sentence in Hindi and in
English. Hindi runs ~1.4× to ~4.35× English depending on tokeniser; Tamil
≥4.54×; Odia fertility reaches 16.78 tokens per word on Llama-3.1-8B against
1.24 for English. *An Indian user pays several times more to say the same
sentence to the same model.* Twenty lines of code, no GPU, no maths, and a
result this audience has never been shown.

### 4.1 The compute correction

Draft 1 claimed GPT-2-124M for "~$3 of rented H100" and nanochat for "$15
spot". Both were wrong: those are **8×H100 node** prices, so a single GPU needs
roughly 8× the hours. And the only public report of nanoGPT GPT-2-124M on a T4
is **7 days 23 hours** — for a run cut to a third length. On Kaggle's 30h/week
that is 3+ weeks of quota, on Turing hardware with no bf16, forced onto fp16
where nanoGPT has an open NaN-loss issue, with the dataset and checkpoints
competing for the same 20 GB.

So: **train ~30–50M properly, publish the loss curve, then publish the
arithmetic of what the real one would have cost.** That essay is better content
for a budget-constrained audience than the trophy, and no funded channel will
write it.

| Need | Tool | Cost |
|---|---|---|
| Training runs | Kaggle, ~30 GPU-h/week, 12h sessions | £0 |
| bf16 when needed | Modal Starter, $30/month free credits | £0 |
| Local inference, QLoRA 1–4B | M2 Air + MLX | £0 |
| Orchestration, scraping, CI | Intel mini (cannot train) | £0 |

Google Cloud gives **zero free GPUs** — excluded from the free tier, and they
cannot be attached during the $300 trial at all.

---

## 5. Wiki

Four page types: `concept`, `lesson`, `person`, `synthesis`. Front matter:
`title, type, created, modified, tags, summary, stage`.

**`tags`, `prereqs` and `related` are comma-separated strings, not YAML
lists.** The existing parser in `build/site.js` handles `key: value` and one
special list key; any other list hits the `kv` regex and throws. Splitting a
string at point of use is a line of code; adding a YAML dependency for this is
not.

Every page carries `stage: seedling | budding | evergreen`. This is what makes
publishing rough work safe, and it licenses shipping daily.

**Entry point: one structure, not three doors.** Draft 1 proposed three paths
of 8–12 pages each — a 24–36 page promise against a corpus of nothing, and an
empty path is visible failure on the page meant to build trust. Ship a
reverse-chronological "Day N" list plus a hand-written "start here" of the five
best pages. Add doors at 30+ pages, when traffic shows which one people walk
through. MDN's own lesson, correctly cited, is that two competing structures
confuse readers — the safe version is *one*.

Page furniture: `[seedling] · updated <date> · ~7 min`, prereq links, `Day N`,
`Next`, `Edit this page ↗` deep-linked to GitHub. First use of jargon becomes
`<dfn>` linked to the glossary.

---

## 6. Voice

Full rules in `STYLE.md`. The core:

- **Concrete before abstract.** Never open with a definition. This is the most
  triangulated finding in the research — the worked-example effect, Mayer's
  pre-training principle and 3Blue1Brown's stated method all converge.
- **Every analogy states where it breaks**, and never replaces the mechanism.
- One idea per sentence; under 25 words; reading grade 7–9 as a ceiling check,
  never a pass mark.
- **No idiom, no pop-culture reference, no pun, no sarcasm.** Wit at the
  absurdity of the concept, never beside it — interesting-but-irrelevant
  additions measurably reduce learning.
- **Every citation is opened and verified.** Readers trust cited text more even
  when citations are random, and trust collapses when they click through and
  check. The readers who check are the only ones worth having.
- **Corrections carry an explanation** — what was wrong, how it got through,
  how it was caught. A bare correction reduces trust in the author.
- **AI disclosure is a method note, not a badge.**

### 6.1 The anti-slop rule that matters most

Detectors flag non-native English at a ~61% false-positive rate, and formal
register is a marker of competence in Indian professional English, not of
machine generation. An ESL-first style guide necessarily produces
low-perplexity prose that pattern-matches to LLM output.

**The defence is provenance, not stylistic contortion.** Where a sentence reads
generically, replace the generic claim with a number, a date, a filename, a
real error. Never flag formal register, semicolons or em-dashes in isolation.

---

## 7. Site

Article pages ship **zero JavaScript**. Low-tier Android is ~9× slower than a
development machine, so JS costs bytes *and* main-thread time on exactly the
device this audience holds.

```
Article page   ≤ 150 KB, 0 KB blocking JS      Fonts   system stack
HTML + CSS     ≤  30 KB, one stylesheet        Images  AVIF ≤ 60 KB
LCP            ≤ 2.5s on 6× CPU throttle + 3G
```

Checked by hand, not by CI — the site ships one stylesheet and you will notice.

18px base (`rem`, never px-locked), line-height 1.55, never justified, 4.5:1
contrast, three heading levels, 2–4 sentences per paragraph. **Light and dark,
defaulting to the system preference, with a toggle.** In dark mode `#e6e6e6` on
`#16181c` — never white on black, which maximises halation for readers with
astigmatism.

Accessibility, ordered by what matters here: `<html lang="en">` (without it
browser auto-translate misdetects, and for an ESL audience auto-translate is a
distribution feature); 44–48px tap targets; text survives 200% zoom; semantic
HTML; alt text that carries the point.

**Search:** Pagefind, **on `/search` only** so article pages keep their zero-JS
promise. Zero-result query logging is deferred — you will have a dozen searches
in month one, and newsletter replies give the same signal for free.

---

## 8. Sequence

### Week 1 — make it exist
1. Fold `AI101` into the `jains.es` repo. *(agent)*
2. `CLAUDE.md`: the one reversal, with its reason. *(agent)*
3. Homepage, `/about`, **privacy notice**, email capture. *(agent)*
4. Light/dark, reading typography. *(agent)*
5. Kit free tier; `news.jains.es` with SPF, DKIM, DMARC `p=none`. *(agent + you for DNS)*
6. Reclaim `@doctorjapa`: unlist all 7 videos, rewrite the description, reset the topic signal. *(you — `TASKS.md`)*
7. **Day 1 lesson ships.** Publishing starts immediately, not after infrastructure.

### Week 2 — make it run
8. `.claude/` skills, two agents, `hooks.json`, `lint.js` with four rules. *(agent)*
9. LaunchAgent plist; nightly run writing to a branch. *(agent)*
10. Video pipeline on the **M2 Air**: ffmpeg chain, `mlx-whisper`, caption burn-in, clip extraction. Upload stays manual. *(agent)*
11. Wiki page type, "start here", first ten concept pages. *(agent)*

### Weeks 3–4 — steady state
12. Twenty lessons published. Automate only what has annoyed you ten times.
13. Join and contribute to existing Indian and Global South developer
    communities. *(you — highest expected value per hour of anything here)*
14. YouTube API audit application at day 30, with real upload history behind it.

### Deleted from draft 1
The dormant-list campaign (items 17–20) is **removed entirely**. Emailing
30,000 people to ask permission to email them is itself marketing email and
needs the consent it is requesting. The ICO fined Flybe £70,000 for exactly
this, and Honda £13,000 for emailing people who *had* given some form of
consent but whose preferences were not recorded — which is your case. A burner
domain protects deliverability, not liability. The CSV stays in
`/Users/webserver/code/private/` and is not mailed. **Saves $124 and six hours.**

---

## 9. Backlog — each has a trigger

| # | Feature | Build when |
|---|---|---|
| B1 | **WhatsApp Channel** — free, uncapped, pull-based, no consent burden. The Channel is the pump; email is the asset | Reviewed month 2 |
| B2 | Corrections log, explained not bare | Month 2 |
| B3 | Share buttons on every page | Week 4 |
| B4 | Glossary, written by hand | Month 2 |
| B5 | Predictions ledger | Month 4, if there is anything worth predicting |
| B6 | Referral programme | ~1,000 subscribers, and only if the ESP has it built in |
| B7 | Zero-result search logging | Month 3 |
| B8 | Cohort with fixed dates and a certificate | Month 4+ |

**Deliberately not building:** public leaderboards, comment-to-DM automation,
a build-in-public stats dashboard, web push, a comment system, a service
worker, `localStorage` progress tracking, or a glossary compiler. Each was in
draft 1 or considered; each solves a problem that does not exist yet.

**Not betting on SEO for six months.** Search referral to explainer content is
in structural decline across several independent datasets. Keep the wiki
crawlable because it is free; forecast near-zero search traffic until month 12.

---

## 10. Costs

| Item | One-off | Monthly |
|---|---|---|
| Kaggle, Modal, Cloudflare, Kit, GitHub Actions, Pagefind, MLX | — | $0 |
| Claude Pro (already held) | — | $20 |
| Apple wired mic (already owned) | $0 | — |
| **Total** | **$0** | **$20** |

Draft 1's $229 is gone: $124 with the email campaign, $65 on a microphone you
already have, $30 on GPU time the corrected curriculum does not need. If a
rented run becomes worth it in month 3, budget $25–40 for a single H100 day —
not $3.

---

## 11. Risks

1. **The study budget is also the production budget.** Mitigation: 120 minutes
   of study, the failed-session format, and banking finished days.
2. **A hallucinated fact in a teaching newsletter.** The one error the premise
   cannot survive. Mitigation: the `Stop` hook, the auditor's fresh context,
   every citation opened, and beat 4 — *"the part I am least sure about"* — as
   a permanent slot, which converts the beginner-teaching liability into the
   differentiator.
3. **Pro plan exhaustion.** Mitigation: two agents, Haiku scout,
   `omitClaudeMd`, `--max-budget-usd`, `/usage` weekly. Escalation: batch the
   scout weekly.
4. **Publishing into silence.** Mitigation: LinkedIn from day one — 5,000
   followers is the only real distribution asset that exists today — and
   existing communities in week four.
5. **Single point of failure.** One person, one Mac mini, one of every account.
   Mitigation: the repo is public and on GitHub, which covers the text.
   Nothing covers the YouTube channel. Accepted.

**No kill criteria by decision. Full audit at day 90.**

---

## 12. Open for draft 3

- `prompts/newsletter.md` and the `news` block of `sources/SOURCES.md` are
  waiting on your existing prompt and source list.
- Whether the daily newsletter survives contact with a list of zero. It is the
  most expensive line in the runbook at 30 min/day, and the one I would revisit
  first at day 30.
- Whether 120 minutes of study actually yields a publishable artefact every
  day, or whether weeks 5–6 (backprop) need two days per session.
