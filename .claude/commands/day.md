---
description: The 06:00 block. Research today's session, write the session file, open a PR.
---
Read `AI101/prompts/LEARNED.md` first. **If it is over 20 lines, stop and tell
me to run `/sunday` — do not continue.** A staging file that never empties is
read on every run and quietly costs accuracy on every run.

Then follow `AI101/prompts/daily-research.md` exactly.

Arguments: $ARGUMENTS

- **Empty** — new day. Work out the number by counting files in
  `AI101/sessions/` and adding one.
- **A number** — that day.
- **`again "<steer>"`** — regenerate today's session file with that steer.
  **Never overwrite `## ANGLE`, `## HORIZON`, `## OUTCOME` or `## OPEN`.**
  Those four are mine. Regenerate the plan, the code, the beats, the script
  and the news. Then append one line to `AI101/prompts/LEARNED.md`.

Write `AI101/sessions/<today>.md`. It is working material, not a page.
Append anything offline to `TASKS.md`, and open a pull request. The PR body is
the angle and the five beats, nothing more — I read it on a phone.
