---
description: The 10:05 block. Turn today's artefact into wiki pages.
---
Read `AI101/prompts/LEARNED.md` first.

Use the `wiki-ingest` skill on today's lesson file and its artefact, writing
into `content/wiki/`. Carry the lesson's `## OUTCOME` line onto the page it
belongs to — that is what makes the page a lesson rather than a summary.

Front matter is not YAML. `tags`, `prereqs` and `related` are
**comma-separated strings**. Any other list breaks the parser in
`build/site.js`.

Every new page starts at `stage: seedling`. A page only reaches `evergreen`
after `/audit` has passed over it.

If today's session contradicts a live page — section 8 of the lesson file says
so — use `wiki-update` on that page and record what changed and why. A silent
correction is worse than none.

Append anything from the lesson's `## OPEN` section to
`AI101/OPEN-QUESTIONS.md`, with the date and what would settle it.

Arguments: $ARGUMENTS

- **Empty** — ingest today.
- **`again`** — re-ingest today. Leave any page at `stage: evergreen`
  untouched; regenerate seedling and budding pages only.

Then run `npm run build`. It must exit 0.
