# Two-day simulation

Run this once, in a **fresh session**, before day one is real. The point is to
find out what annoys you while nothing is published, not on the morning it
matters.

It produces real files on a branch. Nothing is sent, nothing is deployed, and
the branch is thrown away afterwards.

Follow [`WORKFLOW.md`](WORKFLOW.md) for what each step is meant to do.

---

## Before you start

Open NetNewsWire and let it refresh. The sweep reads its local store, so an
app that has not run gives yesterday's news. Everything else is in place.

The news comes from **two passes**, not one. The sweep reads the feeds; the
discovery pass in `prompts/daily-research.md` section 8b goes and finds up to
ten stories the feed list had no way to know about. If the sweep comes back
thin, discovery is what should carry the edition — and whether it does is one
of the things this simulation is for.

---

## The prompt

Paste this whole block into a fresh Claude Code session started in
`/Users/webserver/code/jains.es`.

```
Simulate the first two days of the AI101 pipeline. Do not deploy, do not
send anything, and do not push to main.

Read AI101/WORKFLOW.md first so you know what each step is for. Then:

  git checkout -b sim/two-days

DAY 1 — use today's date.

1. Run /day 1. It should read LEARNED.md, the curriculum, OPEN-QUESTIONS,
   VISION for the horizon line, and run AI101/tools/news-sweep.sh. It
   writes AI101/sessions/<today>.md. Do not open a pull request.

2. Stop. Show me the ANGLE and the FIVE BEATS only, and nothing else.
   Wait for me to accept or steer.

3. I will not actually study, so write a plausible OUTCOME line and a
   plausible OPEN question into the session file yourself — and say
   clearly, in your message, that you did, because in real use those two
   are mine alone and an agent filling them is exactly the failure the
   design forbids.

4. Run /newsletter. It writes content/days/<today>.md. Report the word
   count, the subject-line character count, and which concepts it wanted
   to link but found no wiki page for.

5. Run /wiki. It should fold the session into topic pages under
   content/wiki/, not create a page named after the date. Tell me which
   pages it created and which it updated.

6. Run /audit over both. Report findings. Fix nothing.

7. Run npm run check and npm run build. Both must exit 0.

DAY 2 — use tomorrow's date.

8. Repeat steps 1 to 7 as day 2. Before you start, append one realistic
   correction to AI101/prompts/LEARNED.md, as if I had steered you on day
   1 — something like "section 2 items lead with the valuation". Then
   show me, in day 2's output, where that correction changed the result.
   If it changed nothing, say so plainly; that is the more useful finding.

9. Day 2's wiki step must UPDATE at least one page day 1 created rather
   than adding a new one. If it cannot, say why. Pages accreting instead
   of accumulating is the whole design, and this is the step that proves
   it.

THEN STOP and report, in this order:

  a. Every file created or changed, as a list of paths.
  b. What took the longest, and what you had to guess at.
  c. The three places the prompts were ambiguous or contradicted
     themselves. Quote them.
  d. One thing that should be a hook or a lint rule rather than a
     sentence in a prompt.
  e. The two news passes, separately. How many items the SWEEP
     returned that cleared the bar, and how many DISCOVERY returned.
     Which pass produced the item you would lead the edition with?
     If discovery produced nothing the sweep did not already have, say
     so — that means the pass is costing web fetches for nothing.
  f. How many countries appeared across the ten discovery items. One or
     two means the spread cap is not doing its job.

Do not tidy anything up. Leave the branch as it is. I want to see the
mess, not a cleaned version of it.
```

---

## The review prompt

Run this **in the same session**, after the block above has finished. It is
deliberately separate: a context that has just produced something is the worst
judge of it, and asking both questions at once gets you a defence rather than
a review.

```
Now review what you just produced against what it was supposed to be. Do
not fix anything. Do not defend anything you wrote.

Read AI101/PLAN.md sections 0, 5, 6 and 7, and the five locks in
AI101/WORKFLOW.md. Those are the goal. What is on the branch is the
result. Score the result against the goal, and quote evidence from the
actual files for every judgement.

THE EDITION — content/days/*.md
  1. Word count against the 900-1,100 ceiling, and subject line against
     43 characters. Numbers, not impressions.
  2. Every claim in sections 2, 3, 6 and 7: does it carry a dated,
     resolvable link? List any that do not.
  3. Global South relevance: does each news item lead with what a reader
     in Lagos, Nairobi, Mumbai or Dhaka pays or does differently, or does
     it lead with a valuation? Quote the ones that lead wrong.
  4. Register: would a 17-year-old and a 68-year-old both finish it?
     Point at any sentence over 25 words, any idiom, any emoji.
  5. Is section 5 four bullets that link out, or has it become a lecture?

THE WIKI — content/wiki/*.md
  6. Did day 2 UPDATE a page day 1 created, or did it add another one?
     Name the files. This is the single most important question here:
     pages accreting rather than accumulating is the whole design.
  7. Does any page read like a dated log entry rather than a topic? Quote
     the opening line if so.
  8. Does every page open with something concrete rather than a
     definition? Quote any that opens with a definition.
  9. Are prereqs and related pointing at slugs that exist?

THE TWO NEWS PASSES
  e1. Did discovery find anything the sweep could not? Name the items.
      A discovery pass that only re-finds the feeds is pure cost.
  e2. Did any item breach the two-per-country cap? Count them.
  e3. Did any excluded frame get through — a corruption scandal, a
      religion story — or was anything wrongly excluded that was
      genuinely a technology story with a fraud in it?
  e4. Every discovery item: was the link actually opened, and does the
      page carry the number quoted? Check three at random and say which.

THE LOOP
  10. The correction seeded into LEARNED.md before day 2 — quote the day
      1 output it was about, and the day 2 output that should show it
      applied. Did it actually change anything? If not, say so; that is
      the finding that matters most.
  11. Is LEARNED.md still under 20 lines? Could /sunday place every entry
      in it, or is there one you would not know where to promote?

THE PREMISE
  12. Read every line written as if I am the author. Does any of it imply
      research standing I do not have? Quote it. This is the one error
      the premise cannot survive.
  13. Is beat 4 — the part I am least sure about — actually uncertain, or
      has it been written as false modesty about something the text is
      confident about elsewhere?

THEN, in order:
  a. The three worst things about the output, worst first, with the file
     and line.
  b. For each: is that a prompt problem, a mechanism problem, or a
     me problem? Prompt problems get a LEARNED.md line. Mechanism
     problems get a lint rule or a hook. Me problems get nothing, and
     say so.
  c. One sentence: would you have sent that edition to a real list?
  d. What the goal says should happen that the pipeline has no step for
     at all. This is the gap I cannot see from inside it.

Be specific and be unkind. A review that says it mostly went well is
worth nothing to me. If something genuinely passed, say so in three
words and move on.
```

---

## What to look at afterwards

```bash
npm run dev     # then open /day/1/, /day/2/, /wiki/, /curriculum/
```

Then answer three questions for yourself, and write the answers into
`AI101/prompts/LEARNED.md`:

- Would you have sent that edition? If not, what was wrong with it?
- Did the wiki pages get better on day 2, or just longer?
- Where did you have to type something the system should have known?

That third one is next week's automation. Nothing else gets built.

## Throwing it away

```bash
git checkout main && git branch -D sim/two-days
```

Keep only the `LEARNED.md` lines. Those are the point of the exercise; the
files are not.
