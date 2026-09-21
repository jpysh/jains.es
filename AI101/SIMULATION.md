# Two-day simulation

Run this once, in a **fresh session**, before day one is real. The point is to
find out what annoys you while nothing is published, not on the morning it
matters.

It produces real files on a branch. Nothing is sent, nothing is deployed, and
the branch is thrown away afterwards.

Follow [`WORKFLOW.md`](WORKFLOW.md) for what each step is meant to do.

---

## Before you start

Two things make the simulation honest rather than decorative:

1. **Add the five AI feeds to NetNewsWire** — Simon Willison, Hugging Face
   blog, Import AI, The Batch, Ars Technica AI. URLs are in
   [`sources/SOURCES.md`](sources/SOURCES.md). Delete the `site:X.com/sama`
   Google News feed.
2. **Open NetNewsWire and let it refresh.** The sweep reads its local store,
   so an app that has not run gives yesterday's news.

If you skip step 1 the news sections will come out thin. That is not a bug in
the pipeline; it is the pipeline telling you the feed list has three AI
sources and one of them is a dead search.

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
  e. Whether the news sweep returned enough to fill section 2. If not,
     how many usable AI items it actually found.

Do not tidy anything up. Leave the branch as it is. I want to see the
mess, not a cleaned version of it.
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
