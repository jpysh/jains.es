---
description: The weekly block. Sweep the corrections into the prompts, then review.
---
Seven steps, in order. Report each in two lines or fewer. Open one pull
request at the end with everything this changed.

## 1. Sweep LEARNED.md — this is the step that matters

Read every entry in `AI101/prompts/LEARNED.md` and promote each one out of it:

- **Seen twice or more, and it is a writing rule** — edit the prompt file
  itself so the rule is in the instructions, then delete the entry.
- **A script could check it** — add it to `build/lint.js` as a rule, then
  delete the entry.
- **A durable fact about the project** — add it to `CLAUDE.md`, then delete.
- **Seen once and older than 14 days** — delete it. It was a one-off, and
  carrying it costs attention on every run for the rest of the project.

The file should end near-empty. If you cannot place an entry, say which one
and why; never leave it there silently.

## 2. Outcomes against the curriculum

Read the week's `## OUTCOME` lines from `AI101/sessions/`. Against
`AI101/CURRICULUM.md`, is it running fast or slow? Name the days that did not
close. This is the only evidence that corrects the curriculum — never correct
it from how the week felt on a Sunday evening.

## 3. Wiki health

`wiki-lint` over `content/wiki/`. Contradictions, orphans, broken
cross-references, stale claims, missing pages. Also: any concept named in
three editions that still has no page.

## 4. Stages

Any page whose `stage:` should mature. Run `wiki-audit` on it first; nothing
reaches `evergreen` without that passing clean.

## 5. Open questions

`AI101/OPEN-QUESTIONS.md` — delete anything answered. Flag anything over 30
days: it becomes a lesson or it gets deleted.

## 6. Sources

Prune `AI101/sources/SOURCES.md` — anything that produced nothing in 30 days.
Dead sources cost a fetch every sweep.

## 7. Cost

Read `~/.claude/logs/pipeline.jsonl` for the week. Token cost per run and the
trend. Flag the auditor separately: opening every citation is the most
expensive line in the pipeline.

---

Then tell me the one thing that annoyed me most this week that a mechanism
could remove. **One.** Not a list. That is next week's automation and nothing
else gets built.
