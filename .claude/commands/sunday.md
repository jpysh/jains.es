---
description: The weekly 45-minute block.
---
Six things, in order. Report each in two lines or fewer.

1. Read the week's `## OUTCOME` lines from `content/lessons/`. Against
   `AI101/CURRICULUM.md`, is the curriculum running fast or slow? Name the days
   that did not close. This is the only evidence that corrects the curriculum —
   do not correct it from how the week felt.
2. `wiki-lint` over `content/wiki/`. Contradictions, orphans, broken
   cross-references, stale claims, missing pages.
3. Any page whose `stage:` should mature. Run `wiki-audit` on it first; a page
   only reaches `evergreen` after that passes.
4. `AI101/OPEN-QUESTIONS.md` — delete anything answered this week. Flag
   anything older than 30 days: it becomes a lesson or it gets deleted.
5. Prune `AI101/sources/SOURCES.md` — anything that has produced nothing in 30
   days. Dead sources cost a fetch every sweep.
6. Read `~/.claude/logs/pipeline.jsonl` for the week. Token cost per run and
   the trend. Flag the auditor separately: opening every citation is the most
   expensive line in the pipeline.

Then tell me the one thing that annoyed me most this week that a mechanism
could remove. One. Not a list. That is next week's automation, and nothing else
gets built.
