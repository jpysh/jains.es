# Simulation report — unattended run, days 1 and 2

Run on 2026-09-21 on branch `sim/day1-2`. Nothing was sent, published or
merged. Day 2 carries tomorrow's date in its front matter only.

*Sections 1 and 3 to 8 are written at the end of the run. Section 2 fills in
as each day is measured.*

---

## 2. MEASUREMENTS

### Day 1 — 2026-09-21

| Measure | Target | Day 1 | |
|---|---|---|---|
| Edition word count | 900–1,100 | **884** | 16 under the floor |
| Subject line | ≤ 43 chars | **27** | `Your language costs 8x more` |
| Claims in §2, §3, §6, §7 with no dated link | 0 | **4** | listed below |
| Items from the SWEEP clearing the bar | — | **8** of 60 returned | 2 of the 8 are `brandpress`, i.e. paid placement |
| Items from DISCOVERY | ≤ 10 | **6** | 5 unreachable by any feed |
| Distinct countries across discovery items | ≥ 3 | **4** | India, Philippines, Kenya, plus one multi-country item |
| Any country appearing more than twice | 0 | **0** | India 2, Kenya 2 |
| Sentences over 25 words | 0 | **4** | one further hit is the masthead, a measurement artefact |
| Emoji | 0 | **0** | pass |
| Wiki pages created / updated | — | **1 created, 1 updated** | created `tokenisation-and-the-cost-of-your-language`, updated `start-here` |
| Wiki page reading as a dated log entry | 0 | **0** | the new page opens on a sentence and a bill, not on a date |
| `npm run check` | exit 0 | **exit 0** | |
| `npm run build` | exit 0 | **exit 0** | |

**The four unsourced claims, all in §3 The intersection, which carries zero
links:**

1. "Send the English to a model's API and you are billed for a certain number
   of tokens. Send the official Hindi and you are billed for several times
   that." — restates the 8.0x with no link.
2. "The tokeniser cut the Hindi into more, smaller pieces, because it had seen
   less Hindi when it was built." — the mechanism claim, no link.
3. "This is why the 90% figure and the 8.0x figure belong in the same
   paragraph." — both figures are sourced in §2 and neither is re-linked here.
4. **"It is paying a premium for a corpus decision somebody else made in
   2022."** — the worst line in the edition. The year 2022 appears in no
   source read today. It was invented to sound concrete.

The prompt is explicit that §3 carries "full tiers. Dated, resolvable,
opened." The section carries none.

---

## 2a. AUDIT OF DAY 1, FRESH CONTEXT

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
