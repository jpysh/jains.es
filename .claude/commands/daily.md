---
description: The whole day in one run. Session, edition, wiki, Short, audit, one PR.
model: sonnet
---
Today is $ARGUMENTS if given (a day number), else count `content/days/` and add one.
Date is today's local date. Branch `day/<n>` off `main`.

Budget: at most 15 web searches and 25 page fetches in total, one audit subagent,
no other subagents. If research is not done inside that, stop and say what is missing.

**Nothing invented. Ever.** No story, date, number, quote or learning goes in
unless it is on a page you opened in this run. For each news item and statistic,
keep the exact sentence from the source that supports it. If you cannot find that
sentence, cut the claim. Never date a source from memory; use the date printed on
the page, or drop the source. The learning sections describe only what the
session file and my OUTCOME line say happened, never what probably happened.

Stop and ask me at each **CHECK**. I answer in one line; carry on.

1. **Session.** Follow `AI101/prompts/daily-research.md`. Write `AI101/sessions/<date>.md`.
   **CHECK:** show the ANGLE, the five news items (title, date, source) and the
   wiki targets, each item with its URL and the quoted supporting sentence.
   I approve, cut or swap.
2. **Edition.** Follow `AI101/prompts/newsletter.md`, slop pass included (provenance
   fixes only). Write `content/days/<date>.md`. Link every concept that has a wiki page.
3. **Wiki.** Fold the session into the slugs in section 7 of the session file,
   writing to `content/wiki/`. New page: `stage: seedling`, first tag is its cluster.
   Existing page: revise in place, bump `modified`, say what changed if it contradicts.
   Never make a page per session. Source dates must be YYYY-MM-DD; drop a source
   with no real date rather than invent one. Append the session's OPEN items to
   `AI101/OPEN-QUESTIONS.md`.
4. **Short.** Write `content/shorts/<date>.md`: 45–60 seconds spoken, about 130 words.
   Hook line (a number or a surprise, no question), three beats, one statistic with
   its source named aloud, closing question that asks for a comment. Plain British
   English, sentences under 15 words. Not published on the site.
5. **Verify.** Run `build/check-links.sh` on the edition, today's wiki changes and the
   Short; every URL must resolve. Then one fresh subagent runs
   `.claude/commands/audit.md` on the same files: it re-opens every URL and confirms the
   quoted sentence is on that page and says what we say. Fix every finding by cutting
   or re-sourcing, never softening. Re-run both until clean, at most twice, then stop
   and show me what is left.
6. **Build.** `npm run build` and `npm run check` must exit 0. Print: edition word
   count, subject length, sentences over 25 words, and the Short's word count.
7. **PR.** Commit, push, open one PR. Body: angle, subject line, the five items,
   link check and audit result, the numbers from step 6. I read it on a phone.
   **CHECK:** I merge. Then I paste the edition into Substack and film the Short.

When I correct something, append one line to `AI101/prompts/LEARNED.md`:
`DATE | step | what was wrong, and what to do instead.` Prune it by hand monthly.
