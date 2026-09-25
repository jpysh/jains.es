# Simulation report — unattended run, days 1 and 2

Branch `sim/day1-2`, run 2026-09-21, 21:55 to 22:20 CEST. Nothing sent,
published, deployed or merged. Day 2 carries 2026-09-22 in its front matter
only.

---

## 1. VERDICT

**No.** Day 2's edition tells a Liberian arrest story that "is the first real
test of what the new Act covers", and the source it cites says nothing of the
kind — one invented certainty in a five-item news section is enough to lose
the readers who check, and those are the only readers worth having.

Two things nonetheless worked well enough to say in three words each. The
accretion test: **passed**. The fresh-context auditor: **indispensable**.

---

## 2. MEASUREMENTS

| Measure | Target | Day 1 | Day 2 | |
|---|---|---|---|---|
| Edition word count | 900–1,100 | **884** | **929** | fixed by change 4 |
| Subject line | ≤ 43 chars | **27** | **25** | both fine |
| Claims in §2, §3, §6, §7 with no dated link | 0 | **4** | **0** | fixed by change 1 |
| Claims in §2, §3, §6, §7 their source does not support | 0 | **0** | **3** | **new failure mode** |
| Items from the SWEEP clearing the bar | — | **8** of 60 | **3** of 60 | day 2's store did not advance |
| Items from DISCOVERY | ≤ 10 | **6** | **2** | |
| Distinct countries across discovery items | ≥ 3 | **4** | **3** | counting multi-country items |
| Any country appearing more than twice | 0 | **0** | **0** | cap holds |
| Sentences over 25 words | 0 | **4** | **7** | **got worse** |
| Emoji | 0 | **0** | **0** | |
| Wiki pages created / updated | ≥ 1 updated | **1 / 1** | **1 / 1** | |
| Wiki page reading as a dated log entry | 0 | **0** | **0** | |
| `npm run check` | exit 0 | **0** | **0** | |
| `npm run build` | exit 0 | **0** | **0** | |

Day 1's four unsourced claims were all in §3 The intersection, which carried
zero links against a prompt requiring "full tiers". The worst was
`content/days/2026-09-21.md:86` — "a corpus decision somebody else made in
2022" — a year that appears in no source read that day.

**Read the top two rows together.** Change 1 closed the hole it aimed at, and
day 2 promptly opened a different one: instead of inventing facts, day 2
over-claims from real ones. "Up to 89%" became "89%". "TechCrunch names no
date" became "no launch date has been announced". Requiring a link next to a
figure does not require the sentence to stop where the source stops.

---

## 3. THE FIVE WORST THINGS

1. **`content/days/2026-09-22.md:43` — "This is the first real test of what
   the new Act covers."** The AllAfrica piece says the arrest came less than a
   month after the Act was signed. It rules out no earlier case. *Prompt
   problem, and one my own change did not catch: change 1 governs §3, this is
   in §2.*

2. **`content/days/2026-09-21.md:86` — "a corpus decision somebody else made
   in 2022."** Invented to sound concrete. Found independently by the run's own
   measurement and by the day 1 auditor. *Prompt problem. Fixed at source.*

3. **`content/wiki/tokenisation-and-the-cost-of-your-language.md:13` —
   `primary | OpenAI | 2022-12-01 | tiktoken | github.com/openai/tiktoken`.**
   The repo carries no date. Flagged by the day 1 auditor, fixed in
   `newsletter.md` by change 3, and **still present on day 2**, because the
   wiki step reads `.claude/commands/wiki.md`, which change 3 never touched.
   The day 2 auditor: "The two files disagree about the same source."
   *Mechanism problem. Not fixed. See section 5.*

4. **`content/days/2026-09-22.md:141` — "89%. The reduction ... that a modified
   byte-pair encoding achieves."** The abstract says "by up to 89%", and names
   the metric as the Gini coefficient of per-language token costs. The wiki
   page got this right on the same source; the edition did not. *Prompt
   problem, unfixed — see section 5.*

5. **Seven sentences over 25 words on day 2, against four on day 1.** The
   style lock is explicit and nothing enforces it. Worse, change 4 pushed
   against it: a word-count floor with no sentence-length check rewards
   longer sentences. *Mechanism problem. Should be a `lint.js` rule, not a
   line in a prompt that has said it twice already.*


---

## 4. WHAT CHANGED, AND THE EVIDENCE

Five changes, the cap. Every finding was sorted first.

### Change 1 — prompt. Section 3 now carries its own sourcing requirement

**Evidence.** `content/days/2026-09-21.md`, the whole of §3 The intersection,
contains zero links. The worst line in it:

> It is paying a premium for a corpus decision somebody else made in 2022.

The auditor, with no knowledge of what was intended:

> No source anywhere in the edition dates `cl100k_base` to 2022. The paper
> does not date it. This is the WRITING.md case of a number with no
> traceable source.

**Why this is a prompt problem, not a writing lapse.** The rule existed. It
was in `AI101/prompts/newsletter.md` under "Sourcing bar by section: 3 full
tiers" — fifty lines below §3's own description, in a table read once at the
top and not again while §3 was being written. A rule that lives away from the
work it governs is a rule that gets read past.

**The change.** `AI101/prompts/newsletter.md`, inside §3's own description:

> EVERY FIGURE IN THIS SECTION CARRIES ITS OWN DATED LINK, even one already
> linked in section 2. This section restates figures in a reader's own terms,
> and a restatement is where an unsourced number gets invented. If a detail
> makes the paragraph concrete and no source read today carries it, cut the
> detail. Do not supply a plausible year, version or name to fill the gap.

Nothing added to `LEARNED.md`, per the rule: a prompt problem is fixed at
source.

### Change 2 — mechanism. `build/check.sh` now refuses a dead internal wiki link

**Evidence.** Auditor finding 6:

> `content/wiki/tokenisation-and-the-cost-of-your-language.md:65` — "See
> [what a merge is](/wiki/what-a-merge-is/)". No `content/wiki/what-a-merge-is.md`
> exists. This is a body link, so unlike `prereqs`/`related` the build will
> not drop it; it ships as a 404.

**Why mechanism and not prompt.** No amount of instruction reliably stops an
agent writing a forward link to tomorrow's page. It is exactly the class the
workflow reserves for a script: "Something a script could check → a `lint.js`
rule".

**The change.** A rule in `build/check.sh` that scans every `.md` under
`content/` for `(/wiki/<slug>/)` and fails if no `content/wiki/<slug>.md`
exists. It fired immediately on the real defect:

```
FAIL: body links to wiki pages that do not exist:
  /wiki/what-a-merge-is/
1 failing
```

The content was fixed, never the check: the premature link was replaced with
a plain sentence. `npm run check` now prints `ok: every /wiki/<slug>/ body
link resolves to a page` and exits 0.

This is the only change in the run that cannot be forgotten.

### Change 3 — prompt. Front matter lists only sources the edition cites, and nothing undatable

**Evidence.** Two auditor findings, same root:

> **4.** `content/days/2026-09-21.md:12` lists the Philippines masterplan as
> a source. The Philippines appears nowhere in the edition body.

> **1.** `primary | OpenAI | 2022-12-01 | tiktoken | https://github.com/openai/tiktoken`
> I opened the repo. It shows no release date [...] The `2022-12-01` is
> asserted, not readable from the URL.

**The change.** `AI101/prompts/newsletter.md`, a new block directly above the
sourcing table:

> Front matter: `sources:` lists only what this edition actually cites. An
> item researched in the session but dropped from the edition has its source
> line dropped too. [...] A source that cannot be dated from its own URL does
> not go in front matter at all. Cite it inline in the prose, where no date
> is claimed. Never substitute the date you accessed it, and never infer one.

The second half restates a rule already in `WRITING.md`. It was restated
because the prompt is what gets read at the moment of writing, and `WRITING.md`
is not in the prompt's read list.

### Change 4 — prompt. The word count is a floor as well as a ceiling

**Evidence.** Day 1's edition is **884 words**. The lock says 900–1,100. The
prompt's own framing gave permission to miss it:

> Eight sections, in this order. Word counts are ceilings, not targets.

Read against a lock phrased as "900–1,100 words. Hard ceiling", the prompt
and the lock contradict each other about whether 900 is a floor.

**The change.** `AI101/prompts/newsletter.md`:

> The per-section word counts are ceilings, not targets. The EDITION total is
> a band with two sides: 900 to 1,100 words. Under 900 is a miss, not a
> virtue — it means a section was thin, and the fix is a better section,
> never padding an existing one. Report the count against both bounds and say
> which section is short.

### Change 5 — prompt. The discovery window splits in two

**Evidence.** From the day 1 session file, written before the audit:

> **Window breach, recorded rather than hidden.** The brief says "last 24
> hours". Four of these six are older: a preprint from July, a foundation
> release from 14 September, a masterplan from 11 September, a regulator's
> notice from 9 September. None was in the sweep, and none was reachable by
> a feed.

Those four include the best item either pass produced all day. A rule that
would have excluded the lead story is a broken rule.

**The change.** `AI101/prompts/daily-research.md` §8b now reads:

> WINDOW — 24 hours for anything a feed could plausibly carry. FOURTEEN DAYS
> for a primary a feed structurally cannot reach: a preprint, a regulator's
> consultation notice, a central bank release, a company filing. [...] Print
> the item's REAL publication date in the table, never the date you found it,
> and never imply freshness the date does not support. A consultation window
> that is still open is today's news on the day a reader can still act on it.

### Sorted as human problems, changed nothing

- **The register compression at `content/days/2026-09-21.md:31`** — "A newer
  tokeniser cuts that cost by 73%", where the paper says multilingual
  tokenisers as a class. The auditor called it "a headline compression", not a
  citation failure. Whether a headline may compress is an editorial judgement
  with no mechanical test. Human problem. Nothing changed.
- **The 4x figure laundered on the wiki** (auditor finding 3) — the edition
  attributes it to the curriculum; the wiki says "commonly repeated guidance".
  The fix is to cite the curriculum or cut it, and which of the two is a
  judgement about how much a seedling page may assert. Human problem.
  Nothing changed.

### Did the changes change day 2? Side by side.

**Change 1 — §3 sourcing. Worked.**

| | |
|---|---|
| Day 1 `content/days/2026-09-21.md`, §3 | zero links; "It is paying a premium for a corpus decision somebody else made in 2022." |
| Day 2 `content/days/2026-09-22.md:76` | "Indian languages cost an average of 8.0 times what English costs under `cl100k_base`, measured across fourteen languages ([arXiv 2607.24276, 27 July 2026](https://arxiv.org/abs/2607.24276))" |

Two dated links in a section that had none, and no invented detail. But see
the next line.

**Change 1, the part that did not work.** The rule was written into §3's
description only. Day 2's invented certainty moved to §2:
`content/days/2026-09-22.md:43`, "This is the first real test of what the new
Act covers." The fix was section-shaped and the failure is not.

**Change 3 — front matter. Worked in the edition, did not reach the wiki.**

| | |
|---|---|
| Day 1 wiki `:12` | `primary \| OpenAI \| 2022-12-01 \| tiktoken \| https://github.com/openai/tiktoken` |
| Day 2 edition `:135` | `([tiktoken, on GitHub](https://github.com/openai/tiktoken))` — inline, no date, absent from front matter |
| Day 2 wiki `:13` | unchanged. Still `2022-12-01`. |

The edition obeys the rule; the wiki page carries the defect into its second
day. **The loop worked exactly as far as the file I edited and not one line
further.** That is the single most useful sentence in this report.

**Change 4 — word count. Worked, with a cost.** 884 → 929, inside the band.
The cost is row "sentences over 25 words": 4 → 7. Nothing measured sentence
length, so the cheapest way to add forty words was longer ones.

**Change 5 — discovery window. Worked, and visibly.** Day 2's session file
`AI101/sessions/2026-09-22.md` names three items dropped *by the new rule*
with reasons, including arXiv 2508.04796, which was routed to the wiki rather
than to the news section — the exact distinction the rule exists to draw.

**Change 2 — dead links. Worked, immediately, and is the only change that
cannot be forgotten.** It failed the build on the real day 1 defect within
seconds of being written, and passed on day 2 once `what-a-merge-is` existed.

### The accretion test (phase 5b)

**Passed.** `/wiki` on day 2 updated
`content/wiki/tokenisation-and-the-cost-of-your-language.md` **in place**:
`modified: 2026-09-22` added, the mechanism section rewritten from an
assertion into the algorithm plus the "unmerged, not absent" framing, one open
question marked settled with a note on why it got through, and the auditor's
"commonly repeated guidance" laundering replaced with a plain statement that
only one of the two figures has a source. It also created one new page,
`what-a-merge-is`, which day 1's page now links to.

One page deepened, one added, nothing dated in a title. The design holds.

---

## 5. NEEDS A HUMAN

1. **The wiki step has no prompt file, so prompt fixes cannot reach it.**
   `AI101/prompts/` holds `daily-research.md` and `newsletter.md`, and the
   wiki step's instructions live in `.claude/commands/wiki.md`, which is
   outside what this run was allowed to edit. This is exactly why finding 3
   above survived into day 2. **Decision needed:** create
   `AI101/prompts/wiki.md` and have `/wiki` follow it the way `/day` follows
   `daily-research.md`, or accept that wiki writing is governed only by the
   command file.

2. **Sentence length should be a `lint.js` rule, not a prompt line.** It is
   already stated in `CLAUDE.md`, `WRITING.md`, `PLAN.md` §6, both prompts and
   the five locks. It was broken seven times on day 2. A rule stated six times
   and enforced zero times is not a rule. **Decision needed:** what the rule
   does with a quotation, a table row and a code comment, each of which can
   legitimately exceed 25 words.

3. **`LEARNED.md` is 31 lines long with zero entries in it.** `/day` refuses
   to run "if it is over 20 lines"; the file's own explanatory header is 31
   lines before a single correction is added. Read literally, `/day` can never
   run. **Decision needed:** count entries below the
   `<!-- entries below, newest last -->` marker, not lines in the file, and
   say so in `.claude/commands/day.md`. This run did not touch it because the
   20-line threshold is a designed control.

4. **Whether an edition headline may compress a paper's qualifier.** The
   "up to 89%" case, and the "73%" attributed to corpus width where the paper
   says tokeniser design. Both are editorial judgements with no mechanical
   test, which is why they were sorted as human problems and left alone.

5. **The *Made / making* section has been skipped two days running**, for the
   reason `SOURCES.md` already gives: no feed covers it. **Decision needed:**
   pick the feeds or cut the section. Taste is not the agent's to pick, and a
   slot skipped daily is how a template rots.

6. **The sweep's `brandpress` problem.** Two of day 1's eight qualifying sweep
   items were Techpoint Africa `brandpress` — paid placement carried in the
   same feed as reporting. Nothing in the pipeline distinguishes them.
   **Decision needed:** a tier for vendor-supplied copy, or a rule that
   `/brandpress/` in a URL disqualifies the item outright.

---

## 6. THE TWO NEWS PASSES, SCORED SEPARATELY

| | Day 1 | Day 2 |
|---|---|---|
| Sweep items returned | 60 | 60 (same store) |
| Sweep items clearing the bar | 8 | 3 |
| Discovery items clearing the bar | 6 | 2 |
| Discovery items no feed could reach | 5 | 2 |

**The lead item came from discovery on both days.** Day 1's was arXiv
2607.24276, the paper measuring the 8.0x tokeniser tax, which anchored the
edition, the wiki page and the video script. It is the strongest thing either
pass produced in two days, and no feed in the 25-feed list could have
surfaced it. Day 2's lead was the NCC deadline moving from 7 September to
6 October — a Nigerian reader has eleven days left to act on it, and the
sweep had nothing comparable.

**Discovery found what the sweep could not, on both days.** Day 1: a preprint,
two regulator notices, a national masterplan and a primary press release. Day
2: a regulator's deadline change and a securities-board consultation paper.
Zero of those twelve came through a feed. **The pass earns its cost and should
not be cut to three items.**

Two qualifications, because the numbers flatter it:

- **Day 2's yield was two, against day 1's six.** A second consecutive day
  searching the same regulators returns the same notices. The decline is not
  the tightened window — all three items dropped on day 2 would have failed
  day 1's stricter 24-hour rule as well.
- **The 24-hour brief was unsatisfiable and had to be changed.** Four of day
  1's six discovery items were older than 24 hours, including the lead. A rule
  that would have excluded the best item of the run is a broken rule, which is
  what change 5 addressed.

**Recommendation:** keep discovery at ten, and rotate the target list rather
than the item count. The failure mode observed is repetition of sources, not
oversupply of items.

---

## 7. COST

Wall clock, measured from commit timestamps. Not estimated.

| Phase | Ended | Elapsed |
|---|---|---|
| Setup — reading, branch, sweep | 21:58 | ~3 min |
| 1. Day 1 session, edition, wiki | 22:01:12 | ~3 min |
| 2. Day 1 measurements | 22:01:43 | 31 s |
| 3. Day 1 audit, fresh context | 22:03:51 | 2 min 08 s |
| 4. Adapt, five changes | 22:05:21 | 1 min 30 s |
| 5. Day 2 session, edition, wiki | 22:10:19 | 4 min 58 s |
| 6. Day 2 audit, fresh context | 22:13 | ~2 min 20 s |
| 7. Report | 22:20 | ~7 min |
| **Total** | | **~25 minutes** |

Tokens, measured where a tool reports them:

| | Tokens |
|---|---|
| Day 1 auditor subagent | 83,782 |
| Day 2 auditor subagent | 85,755 |
| Main session context at end of phase 6 | 207,706 of 1,000,000 |
| Claude Pro 5-hour window consumed | 44% |
| Claude Pro weekly window, all models | 83% |

**Per-phase token spend cannot be measured and is therefore not reported.** No
tool in this session exposes tokens consumed per phase, only cumulative
context and plan-window percentages. Reporting a split would be an estimate,
which the brief forbids.

The one hard number against the plan's budget: **two audit passes cost
169,537 tokens**, and the audits were the highest-value step in the run. The
budget conversation should start there, not with the news passes.

The run took 25 minutes of the five hours allowed. The remaining time was not
filled, per rail 6.

---

## 8. THE GAP

**Nothing in the pipeline ever observes a reader.**

`PLAN.md` §0 ends: "Goal | Readers read, share, engage". Three of the six
control-surface inputs in `WORKFLOW.md` are the human's own judgement, two are
the agent's own output, and one is a feed list. `SOURCES.md` defines a
`signal` role — "Watch for what the audience is confused about. Feeds topic
choice" — and no command reads it. It goes further: "Zero-result searches on
our own site also land here once search is live. Those outrank everything else
in this section — they are our readers' actual questions, in their own words."
No step ingests them.

Every edition ends "What did I lose you on? Reply to this email." Nothing
reads the replies. There is no step between a reply arriving and a topic being
chosen.

So all three learning loops learn from the system's own output. `/day` reads
`LEARNED.md`, which the pipeline wrote. `/sunday` reads the outcomes, which
the human wrote. `/altitude` reads the prompts against a month of output the
pipeline produced. The loops are closed, and they are closed around the
author. A pipeline that grades only its own work drifts toward what it finds
easy to produce, which over twelve weeks is a tokenisation wiki nobody asked
for.

`WORKFLOW.md` is right that there must be no fourth loop reviewing the review
loop. But this is not that. This is the first loop that would carry
information from outside the system, and it is the one that is missing.

**The smallest version that would work:** a `signal` block in the day 1
session file, five lines, read from newsletter replies and, once search ships,
zero-result queries. It would cost nothing per day and it would be the only
input in the whole design that the author did not write.

*Second, concretely missing and much smaller:* `PLAN.md` §0 promises a chain
of four outputs — "a wiki page, becomes a video, becomes a newsletter, becomes
a LinkedIn post". `/day` writes the video script, `/wiki` the page,
`/newsletter` the edition. **No command produces the LinkedIn post**, and the
newsletter prompt's eight sections do not include it.

---

## APPENDIX A — AUDIT OF DAY 1, FRESH CONTEXT

A subagent was given the three file paths and the audit instruction, and
nothing about what the run intended. Its findings, verbatim:

> ## Citations verified — all clean
>
> | Source line | Exists | Dated | Supports claim |
> |---|---|---|---|
> | arXiv 2607.24276 (27 Jul 2026) | yes | yes | yes — 8.0x, 13.0x Malayalam, 12% context, 73%, r=0.89, 14 languages, 6 tokenisers, "used by GPT-3.5 and GPT-4" all verbatim in the abstract |
> | Gates Foundation (14 Sep 2026) | yes | yes | yes — "at least US$1 billion over the next two years", 40/40/10/10 split, "More than 90% of the data used to train early large language models came from English-language sources" |
> | Semafor (21 Sep 2026) | yes | yes | yes — 900m / ~60% / 170m, and both GSMA and the Partnership for Digital Access in Africa named |
> | TechCrunch (21 Sep 2026) | yes | yes | yes — Muse named; notice text quoted exactly |
> | Broadcast Media Africa (9 Sep 2026) | yes | yes | yes — NFP-T2, standalone Data Centre licence, 30 days |
> | Techpoint Africa (9 Sep 2026) | yes | yes | yes — service-based allocation, direct CA application, existing codes keep old terms |
> | Southeast Asia Infrastructure (11 Sep 2026) | yes | yes | yes — 34.4bn, 13.5/21 split, 50MW→400MW by 2030→1.5GW by 2033, 40% renewable, Clark-Bataan |
>
> No claim is contradicted by its source. Nothing predates a source it cites.
>
> ## Findings
>
> **1. `tiktoken` front-matter source carries a date the page does not.**
> `content/wiki/tokenisation-and-the-cost-of-your-language.md:12` —
> `primary | OpenAI | 2022-12-01 | tiktoken | https://github.com/openai/tiktoken`
> I opened the repo. It shows no release date, no initial-commit date, no date of any kind. WRITING.md is explicit: "If a source cannot be dated, cite it as an inline link in the prose, where no date is claimed, and leave it out of the front matter." The `2022-12-01` is asserted, not readable from the URL. This is the one hard front-matter defect.
>
> **2. A date-shaped claim with no source at all.**
> `content/days/2026-09-21.md:86` — "It is paying a premium for a corpus decision somebody else made in 2022."
> No source anywhere in the edition dates `cl100k_base` to 2022. The paper does not date it. This is the WRITING.md case of a number with no traceable source. It is also the same unverified 2022 as finding 1, so the two stand or fall together.
>
> **3. A "commonly repeated" figure with no source.**
> `content/wiki/tokenisation-and-the-cost-of-your-language.md:112-113` — "Commonly repeated guidance puts the Indic penalty near 4x."
> Nothing is cited. The edition's version (`:105`, "my curriculum told me to expect a roughly 4x difference") is fine — it names its provenance. The wiki version launders the same number into an unattributed consensus claim.
>
> **4. Front-matter source supporting no claim on the page.**
> `content/days/2026-09-21.md:12` lists the Philippines masterplan as a source. The Philippines appears nowhere in the edition body. The source was carried over from the session's discovery table (`AI101/sessions/2026-09-21.md:262`) and the grouping line at `:280` promised it; the edition dropped the item but kept the citation.
>
> **5. Date attached to an event rather than to the report of it.**
> `content/days/2026-09-21.md:61-62` — "Customers using Meta's Muse agent on Amazon.com saw a notice on 21 September".
> TechCrunch is dated 21 September and attributes the discovery of the message to GeekWire. It does not date the notice itself. The article supports "reported on 21 September", not "saw a notice on 21 September".
>
> **6. Dead internal link.**
> `content/wiki/tokenisation-and-the-cost-of-your-language.md:65` — "See [what a merge is](/wiki/what-a-merge-is/)". No `content/wiki/what-a-merge-is.md` exists. This is a body link, so unlike `prereqs`/`related` the build will not drop it; it ships as a 404.
>
> ## Tier check — correct throughout
>
> Every tier describes the URL, not the organisation behind the data. The one that could easily have gone wrong did not: the GSMA/PDAA report is `reported | Semafor`, publisher the outlet, because the URL is the news article. Gates Foundation is `primary` on the foundation's own release. arXiv is `primary` on the paper itself. No inversions.
>
> ## Two URLs I could not open
>
> Both returned HTTP 403 (bot-blocked; absence not established):
> - `https://techobserver.in/news/egov/indiaai-mission-sovereign-ai-models-indian-languages-321425/` — session `:266`. The session already flags it as undated and excludes it from the edition, so nothing published depends on it.
> - `https://www.ohchr.org/en/human-rights/universal-declaration/translations` — a comment in the session's code block at `:50`. Not a front-matter source.
>
> ## Minor, not defects
>
> - Session `:264` dates the Kenya short-code item `2026-09-08` (effective date) while the edition front matter uses `2026-09-09` (publication date). The front matter is the correct one under the rule; the session is working material.
> - The edition's "A newer tokeniser cuts that cost by 73%" (`:31`) compresses a result the paper states for multilingual tokenisers as a class, of which XLM-R is one and is not "newer". The wiki's phrasing at `:72-74` is the accurate one. Not a citation failure, a headline compression.
>
> Nothing fixed, as instructed.

The auditor independently found the invented 2022, which the run's own
measurement had also caught, and five defects the run had missed. The
auditor is the most valuable step in the pipeline by a wide margin.

---

## APPENDIX B — AUDIT OF DAY 2, FRESH CONTEXT

A second subagent, no shared context with the first, given four file paths and
the same instruction. Findings verbatim:

> Every URL in all four files was opened. **All nine distinct URLs exist, are dated, and load.** Front-matter dates match the dates on the pages in every case but one. Nothing cites a source published after it. Every headline statistic (8.0x, 13.0x, 12%, r = 0.89, 73%, 89%, "more than 90%", $899, 7 Sept → 6 Oct, 10 posts) is present verbatim or near-verbatim at the cited URL.
>
> Six findings, strongest first.
>
> ### 1. Unsupported claim — "first real test" (edition)
>
> Claim, `content/days/2026-09-22.md:43-44`:
> > "This is the first real test of what the new Act covers."
>
> The article does not say this. It says only that the arrest came "less than a month after President Joseph Nyuma Boakai signed the Cybercrime Act into law" [...] "First" is the author's addition. No other case is ruled out by the source.
>
> ### 2. Dated front-matter entry for an undated source (wiki)
>
> `content/wiki/tokenisation-and-the-cost-of-your-language.md:13`:
> > `- primary | OpenAI | 2022-12-01 | tiktoken | https://github.com/openai/tiktoken`
>
> The GitHub repo page carries no visible publication or creation date. WRITING.md is explicit [...] The edition handles the same source correctly — `content/days/2026-09-22.md:135` links tiktoken inline in prose with no date and keeps it out of the front matter. **The two files disagree about the same source.**
>
> ### 3. A ceiling reported as an achievement (edition)
>
> > "**89%.** The reduction in tokenisation inequality that a modified byte-pair encoding achieves against classical BPE"
>
> Source (arXiv 2508.04796 abstract, verbatim): "reduces tokenization inequality -- operationalized by the Gini coefficient of per-language token costs -- **by up to 89%** relative to Classical BPE"
>
> "up to" is dropped, turning a best case into a reported result. [...] `content/wiki/what-a-merge-is.md:95-97` gets this right [...] So the edition is the weaker of the two on the same source.
>
> ### 4. Absence of mention treated as absence of announcement (edition)
>
> > "No launch date has been announced for India or any African market."
>
> The TechCrunch piece [...] does not mention India or Africa at all. Silence in one article does not establish that no date has been announced anywhere. What the source supports is "TechCrunch names no date for India or any African market."
>
> ### 5. A definition attributed to a page that does not contain it (edition and wiki)
>
> > "The paper defines fertility, so the comparison has a convention and I was not free to pick."
>
> The cited URL is the arXiv abstract page. Its abstract uses the term [...] but does not define it. The definition is in the full text, which is not the cited URL. [...] Note the tension this creates [...] One open question is declared settled by reading the paper; the other is declared open because the paper has not been read. Both rest on the same PDF.
>
> ### 6. Originating outlet not named in the publisher field (edition)
>
> AllAfrica is a syndicator. The piece is bylined **The Liberian Investigator (Monrovia)**. The tier `reported` correctly describes the URL, so this is not a tier inversion — but WRITING.md asks for "a named outlet reporting a fact first," and AllAfrica did not report it first.
>
> ### Tier check — all correct
>
> No inversion of the kind WRITING.md warns about. The Gates Foundation 90% figure is the trap case — the data is the foundation's, the URL is the foundation's, so `primary` is right [...] Correct.
>
> ### Chronology — clean
>
> [All four files clean.]
>
> ### Not a finding, but worth the reader's notice
>
> > "Swap in a tokeniser built on a wider corpus and the average Indic penalty falls by 73%"
>
> The paper attributes the 73% to multilingual tokenisers (XLM-R, o200k_base) and to "tokenizer design," not specifically to corpus width. Corpus width is the edition's supplied mechanism. The number is right; the causal gloss is one step beyond the abstract.
>
> **Summary:** two claims stated as fact that their source does not support (#1, #4), one statistic that loses its "up to" qualifier (#3), one definition attributed to a page that does not contain it (#5), one front-matter date asserted for an undated source against an explicit WRITING.md rule (#2), one syndicator credited over the originating outlet (#6). No tier errors, no chronology errors, no dead links, no fabricated numbers.
