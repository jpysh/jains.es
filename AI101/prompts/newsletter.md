# Newsletter prompt

**Jollof Bytes** — daily, Global South, five minutes on a phone.

The name is kept deliberately. It is an existing asset with recognition, and
renaming it for geographic precision nobody asked for spends that recognition
for nothing. The scope widens in the subtitle, not the masthead.

The prompt this replaces is preserved verbatim in
[`newsletter-reference-jollof.md`](../archive/newsletter-reference-jollof.md) — the record
of what changed, and why.

---

## The five locks

Not negotiable, whatever else is tuned:

1. **Global South focus.** India and Africa first, then the rest.
2. **Five-minute read on a phone.** 900–1,100 words. Hard ceiling.
3. **Gen Z to boomer.** One register a 17-year-old and a 68-year-old both
   finish. ESL-first.
4. **No emoji.**
5. **Our voice and our sourcing discipline.** `BLOGGING.md` tiers. Every claim
   a dated, resolvable link that was opened. No "experts say".

---

## The prompt

```
Write today's Jollof Bytes.

Read, in this order:
  AI101/prompts/LEARNED.md           what this pipeline already got wrong
  AI101/sessions/{DATE}.md           today's session, its news items, its
                                     OUTCOME line and its wiki targets
  the last five files in content/days/   voice continuity; do not repeat an
                                     explanation already given
  content/wiki/                      every page and its slug, so section 2
                                     and section 5 can link to them

Write it to content/days/{DATE}.md. That file is the published edition at
/day/{N}/ and the text pasted into Substack. One artefact, two places.

Eight sections, in this order. The per-section word counts are ceilings,
not targets. The EDITION total is a band with two sides: 900 to 1,100
words. Under 900 is a miss, not a virtue — it means a section was thin,
and the fix is a better section, never padding an existing one. Report
the count against both bounds and say which section is short.

1. MASTHEAD
   JOLLOF BYTES — one line beneath it: the date, "5 min read", and the
   subscribe link. Nothing else.

2. WHAT HAPPENED  (5 items, 2-3 sentences each)
   AI and technology. Lead each item with what a reader in Lagos, Nairobi,
   Mumbai or Dhaka can do differently, or pays differently, because of it —
   not with what it means for a valuation.
   Every item carries a dated link you opened and confirmed contains the
   claim. Fewer than five is fine. Never pad.

3. THE INTERSECTION  (~120 words)
   One item where AI meets ordinary life, work or money. A price, a job, a
   queue, a form, a language. This is the section nobody else writes; it is
   worth more than any two news items.
   EVERY FIGURE IN THIS SECTION CARRIES ITS OWN DATED LINK, even one
   already linked in section 2. This section restates figures in a
   reader's own terms, and a restatement is where an unsourced number
   gets invented. If a detail makes the paragraph concrete and no source
   read today carries it, cut the detail. Do not supply a plausible year,
   version or name to fill the gap.

4. MADE / MAKING  (~100 words, 2-3 days a week, not daily)
   Art, craft, design, music, writing — made with these tools or made
   against them. Commentary, and labelled as commentary. Skip it on a day
   with nothing honest to say rather than filling the slot.

5. WHAT I LEARNED TODAY  (3-4 bullets, ~120 words)
   From today's session file, written after the 06:15 block, so it is
   today and not yesterday. One bullet is what I got wrong or am least
   sure about. Bullets, not a lecture — the teaching lives on the wiki
   page and in the video, and this section links to the wiki page rather
   than repeating it.

6. USEFUL  (~80 words)
   One tool, prompt or term explained plainly, OR one opportunity a reader
   can apply to from their house — a course, a scholarship, a programme.
   Alternate between the two. Always a link.

7. NUMBER OF THE DAY  (1-2 lines)
   One statistic, one primary source. No source, no number.

8. SIGN-OFF
   One line. One question, and an invitation to reply. For the first 30
   days the question is: "What did I lose you on?"

Linking:
  Every concept named in any section that has a wiki page links to it on
  first mention. A concept named three times across three editions and
  still with no page is a wiki page waiting to be written — say so in the
  handover line rather than explaining it a fourth time.

Front matter: `sources:` lists only what this edition actually cites.
  An item researched in the session but dropped from the edition has its
  source line dropped too. A source supporting no claim on the page is a
  citation a reader cannot check against anything.
  A source that cannot be dated from its own URL does not go in front
  matter at all. Cite it inline in the prose, where no date is claimed.
  Never substitute the date you accessed it, and never infer one.

Sourcing bar by section:
  2, 6, 7   full BLOGGING.md tiers. Dated, resolvable, opened.
  3         full tiers.
  4         commentary. Labelled as such. Links where they exist.
  5         own work. No sourcing needed, no claims about the field.

Style:
- Plain British English. One idea per sentence, under 25 words.
- Concrete before abstract. Never open a section with a definition.
- Every analogy states where it breaks, in the same paragraph.
- No emoji, no idiom, no pop-culture reference, no pun, no sarcasm.
- Dry wit only where it is about the concept. A joke beside the concept
  measurably reduces what the reader learns. Cut it.
- Single column, real text, no text-in-images, dark-mode-safe.
- Subject line under 43 characters or it truncates on a phone.
- A descriptive subheading roughly every 150 words. The first sentence of
  each section carries the point on its own.
- I am an ex-product-manager learning this in public, not a researcher.
  Never write a sentence implying research standing I do not have.

Then run the slop pass below and apply it before handing the draft over.
```

---

## The slop pass

Runs on every draft, inside this prompt, never as a separate step someone can
forget.

**Apply automatically:**

- Cut hedging and vague attribution. "Studies suggest", "experts say",
  "reports indicate" — source the claim or cut it. Never soften it.
- Cut any closing paragraph that restates the opening.
- Cut any section that exists because the template has a slot for it.
- Cut adjective triads and hype words: game-changer, revolutionary, seamless,
  robust, leverage, unlock.
- Replace a generic claim with the number, date, filename or real error
  already sitting in the lesson file. This is the fix that does the work.

**Never apply. List for the human instead:**

- Anything that changes formal register to casual.
- Removing em-dashes or semicolons.
- Adding contractions to "sound human".
- Shortening a correct sentence because it reads like a machine wrote it.

Detectors flag non-native English at roughly a 61% false-positive rate, and
formal register is a competence marker in Indian professional English, not a
symptom of generation. **The defence against slop is provenance, not stylistic
contortion.**

---

## Where it goes

`content/days/<date>.md` is the edition. The build renders it at `/day/<n>/`
and the same text is pasted into Substack. Published on the site first, so the
canonical version is the one you own.

The edition is **not** a second copy of the lesson. It carries the news, the
intersection, the making section and four bullets of learning that link out.
Anyone who wants the topic in depth follows the link to the wiki.

## Send timing

India-primary, so the evening IST window: **19:00 IST = 15:30 Madrid.** Written
in the morning block, queued, sent in the afternoon.

## What never goes in

- A prediction about the field made by someone in week 3 of learning it.
- A claim sourced to "reports suggest" or "experts say".
- Anything restating the opening in a closing paragraph.
- A section that exists because the template has a slot for it. Cut the
  section rather than fill it badly.
- An emoji.
