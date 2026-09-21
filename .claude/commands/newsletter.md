---
description: The 09:20 block. Write today's Jollof Bytes from the lesson file.
---
Read `AI101/prompts/LEARNED.md` first, then the last five files in
`content/newsletters/` for voice continuity.

Follow `AI101/prompts/newsletter.md` exactly, including the slop pass at the
end. Apply the automatic fixes. List the register findings separately rather
than applying them.

Write the draft to `content/newsletters/<today>.md`. Create the directory if it
is missing. That directory is gitignored — the drafts stay local, the machinery
that writes them is public. Do not commit it, and do not send it. I edit it and
queue it in Substack myself.

Arguments: $ARGUMENTS

- **Empty** — write today's draft.
- **`again "<steer>"`** — regenerate the whole draft with that steer. It is
  cheap, so nothing is preserved. Then append one line to
  `AI101/prompts/LEARNED.md` recording the steer.

End with the word count and the subject line's character count. Over 1,100
words or over 43 characters, say so plainly rather than quietly trimming
something that mattered.
