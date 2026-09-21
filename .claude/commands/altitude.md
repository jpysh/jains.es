---
description: Monthly. Delete the rules that never fired and promote the ones that always do.
---
The anti-staleness pass. Nothing else deletes instructions, so without this
the prompts only ever grow, and a prompt that only grows becomes brittle
conditional logic the model reads past.

Read `AI101/prompts/*.md` and `CLAUDE.md` against the last month of output in
`content/days/`, `content/wiki/` and `AI101/sessions/`. Answer three questions
with evidence, not opinion.

**1. Which rule never fired?** A rule no output ever needed is a rule nobody
is following and nobody noticed. Quote it, say you found no case where it
changed anything, and propose deleting it.

**2. Which rule fires every single time?** A rule the model re-reads thirty
times a month and obeys every time is not guidance, it is a constant. Propose
moving it into `build/lint.js` or a hook, where it costs nothing per run and
cannot be forgotten.

**3. Which rule is contradicted by what actually shipped?** Either the output
is wrong and needs a mechanism, or the rule is wrong and needs deleting. Say
which, and why.

Also check: is `CLAUDE.md` still under 200 lines? It loads on every request
and is copied into every subagent's context, so length there is a cost
multiplier. If it is over, the surplus is usually procedural material that
belongs in a skill or in `.claude/rules/`, not a prohibition — cut that first.

Open one pull request. Deleting a rule is a real change and gets reviewed like
one. **Propose at least one deletion.** A review that only adds is not a
review.
