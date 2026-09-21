---
description: The 10:05 block. Fold today's session into the topic pages.
---
Read `AI101/prompts/LEARNED.md` first.

Today's session file names its wiki targets in section 7. Work through them
with the `wiki-ingest` and `wiki-update` skills, writing to `content/wiki/`.

**The session does not become a page of its own.** It is folded into the topic
it belongs to. A reader looking for tokenisation wants one page on
tokenisation that got better today, not thirty dated fragments.

- New page: `stage: seedling`, `created` today, first tag is its cluster.
- Existing page: revise in place, bump `modified`, and if the session
  contradicts what is there, say what changed and why in the page. A silent
  correction is worse than none.
- Carry the session's `## OUTCOME` line into whichever page it evidences.
- Front matter is not YAML. `tags`, `prereqs` and `related` are
  **comma-separated strings**. Any other list breaks the parser.
- A page only reaches `evergreen` after `/audit` has passed over it.

Append anything in the session's `## OPEN` section to
`AI101/OPEN-QUESTIONS.md`, with the date and what would settle it.

Arguments: $ARGUMENTS — `again` re-runs, leaving `evergreen` pages untouched.

Then run `npm run build`. It must exit 0.
