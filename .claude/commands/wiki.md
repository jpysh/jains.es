---
description: The 10:05 block. Turn today's artefact into wiki pages.
---
Use the `wiki-ingest` skill on today's lesson file and its artefact, writing
into `content/wiki/`.

Front matter is not YAML. `tags`, `prereqs` and `related` are
**comma-separated strings**. Any other list breaks the parser in
`build/site.js`.

Every new page starts at `stage: seedling`. A page only reaches `evergreen`
after `/audit` has passed over it.

If today's session contradicts a live page — section 8 of the lesson file says
so — use `wiki-update` on that page and record what changed and why. A silent
correction is worse than none.

Then run `npm run build`. It must exit 0.
