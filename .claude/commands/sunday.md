---
description: The weekly 45-minute block.
---
Four things, in order. Report each in two lines or fewer.

1. `wiki-lint` over `content/wiki/`. Contradictions, orphans, broken
   cross-references, stale claims, missing pages.
2. Any page whose `stage:` should mature. Run `wiki-audit` on it first; a page
   only reaches `evergreen` after that passes.
3. Prune `AI101/sources/SOURCES.md` — anything that has produced nothing in 30
   days. Dead sources cost a fetch every sweep.
4. Read `~/.claude/logs/pipeline.jsonl` for the week. Report token cost per
   run and the trend. Flag the auditor separately: opening every citation is
   the most expensive line in the pipeline.

Then tell me the one thing that annoyed me most this week that a mechanism
could remove. One. Not a list.
