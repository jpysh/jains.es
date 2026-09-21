# Daily kickoff prompt

Paste this into Claude Code each morning, or let the overnight run fire it.
It is the single entry point to the day.

---

```
Today is day {N} of the curriculum. Read CURRICULUM.md and find today's session.

Read AI101/sources/SOURCES.md. Read the last three files in content/lessons/
so you know what I have already said and do not repeat it.

Produce, in this order:

1. TODAY'S SESSION PLAN — 120 minutes, broken into blocks with a time on each.
   End state must be ONE runnable artefact: a file I can execute, a number I
   can quote, or a plot. Name the artefact explicitly.
   If today's session depends on something from a previous day that I did not
   finish, say so and adjust rather than assuming it is done.

2. THE ANGLE — one sentence. What does today's session let me tell an Indian
   reader that they did not know this morning? If the honest answer is
   "nothing yet, this is scaffolding", say that and find the angle in the
   scaffolding itself.

3. THE CODE — the starting file, complete and runnable, with the parts I am
   meant to work out left as clearly marked TODOs. Do not write the whole
   thing; leave me the part that constitutes the learning.

4. FIVE BEATS — the video structure. Each beat:
   name it / the wrong mental model / the artefact to point at / the takeaway.
   Beat 4 is ALWAYS "the part I am least sure about". That is a fixed slot.

5. NEWS — the three most relevant items from the `news` sources in SOURCES.md
   in the last 24h. Each with a dated primary URL that you opened and confirmed
   contains the claim. If fewer than three clear the bar, return fewer. Never
   pad.

6. WHAT I NEED TO DO OFFLINE — anything only I can do. Append to TASKS.md.

Rules:
- Every factual claim carries a dated, resolvable link you have actually opened.
- No claim survives without a source. Cut it rather than soften it to
  "studies suggest".
- Concrete before abstract. Never open with a definition.
- Every analogy states where it breaks, in the same paragraph.
- Plain British English. Sentences under 25 words. One idea per sentence.
- No idiom, no pop-culture reference, no pun, no sarcasm.
- I am an ex-product-manager learning this in public, not a researcher.
  Never write a sentence that implies research standing I do not have.
```

---

## Why beat 4 is fixed

The evidence on learning-by-teaching says the benefit depends on preparation,
explanation quality and **feedback** — and that the documented failure mode is
teaching something incorrectly to an audience too polite to correct it. A
standing "here is what I am least sure about" beat does three things at once:
it invites the correction that makes the protégé effect work, it converts the
project's biggest liability (a beginner teaching) into its clearest
differentiator, and it means a later correction reads as method rather than
as failure.
