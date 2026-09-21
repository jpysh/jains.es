# Learned — staging, not a record

Corrections land here and **leave**. They do not live here.

Every prompt reads this file before it writes anything, so every line costs
attention on every run. Anthropic's own guidance on context engineering is
blunt about it: as a context grows, the model's ability to recall anything in
it degrades. The target is the smallest set of high-signal tokens, not the
largest set of remembered ones.

So this file is a **staging area**. `/sunday` sweeps it and promotes each entry
to wherever it permanently belongs:

| The correction | Goes to | Then |
|---|---|---|
| A writing rule seen **twice or more** | The prompt file itself | Deleted from here |
| Something a script could check | A `lint.js` rule | Deleted from here |
| A durable fact about the project | `CLAUDE.md` | Deleted from here |
| Seen once, now older than 14 days | Nowhere. It was a one-off | Deleted |

Most weeks this file should end near-empty. **If it passes 20 lines, `/day`
refuses to run** until it has been swept. Good intentions do not sweep a file;
a command that will not start does.

Format: `DATE | which prompt | what was wrong, and what to do instead.`

Entries must be actionable. "The newsletter was boring" changes nothing.
"Section 2 items lead with the valuation — lead with what a reader pays or
does differently" changes tomorrow, and can be promoted into the prompt.

<!-- entries below, newest last -->
