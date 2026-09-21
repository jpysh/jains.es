---
description: The 09:20 block. Write today's edition from the session file.
---
Read `AI101/prompts/LEARNED.md`, then the last five files in `content/days/`.

Follow `AI101/prompts/newsletter.md` exactly, including the slop pass. Apply
the automatic fixes. List the register findings separately rather than
applying them.

Write `content/days/<today>.md`. That is the published edition at `/day/<n>/`
**and** the text I paste into Substack. Site first, so the canonical copy is
the one I own.

Link every concept that has a wiki page, on first mention. A concept named in
three editions with still no page is a page waiting to be written — say so
rather than explaining it a fourth time.

Arguments: $ARGUMENTS

- **Empty** — write today's edition.
- **`again "<steer>"`** — regenerate it. It is cheap, so nothing is
  preserved. Append one line to `AI101/prompts/LEARNED.md`.

Run `npm run build`; it must exit 0. Then print the word count and the subject
line's character count. Over 1,100 words or over 43 characters, say so plainly
rather than quietly cutting something that mattered.
