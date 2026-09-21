---
description: The 06:00 block. Research today's session, write the lesson file, open a PR.
---
Read `AI101/prompts/LEARNED.md` first. It is the record of what this pipeline
has already got wrong; do not repeat any of it.

Read `AI101/OPEN-QUESTIONS.md`. If today's session can settle one, say which in
the session plan.

Then follow `AI101/prompts/daily-research.md` exactly.

Arguments: $ARGUMENTS

- **Empty** — new day. Work out the day number by counting files in
  `content/lessons/` and adding one.
- **A number** — that day.
- **`again "<steer>"`** — regenerate today's lesson file with that steer.
  **Never overwrite the `## ANGLE` or `## HORIZON` sections**; those are the
  human's judgement and the reason the file exists. Regenerate the code, the
  beats, the script and the news. Then append one line to
  `AI101/prompts/LEARNED.md` recording the steer, so tomorrow does not need it.

Do not summarise the prompt back to me. Write `content/lessons/<today>.md`,
append anything offline to `TASKS.md`, and open a pull request. The PR body is
the angle and the five beats, nothing more — I read it on a phone.
