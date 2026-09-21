# Open questions

Loose ends from study sessions. Not tasks — `TASKS.md` is for things only you
can do offline. This is for things you did not understand yet.

`/day` reads this file. If today's session can settle one, it says so in the
session plan and you close it. `/sunday` prunes anything answered.

Each entry carries the date it was raised and **what would settle it**, because
a question with no test attached sits here for six months.

```
DATE | day N | the question
              settled by: what would answer it
```

A question that has sat here 30 days is either the subject of a lesson or it
gets deleted. Do not let this file become a museum.

<!-- entries below, newest last -->

```
2026-09-21 | day 1 | Why does the curriculum say about 4x when the paper
              measures 8.0x under the same tokeniser?
              settled by: running token_tax.py on the paper's FLORES-200
              sentences rather than on a single UDHR line, and comparing.
```

```
2026-09-22 | day 2 | A Devanagari character is three UTF-8 bytes. When a
              token holds two of the three, is that one failed merge or two?
              settled by: finding the convention used in arXiv 2607.24276's
              merge-failure measure, since its r = 0.89 depends on it.
```

Closed 2026-09-22: the day 1 question about tokens-per-sentence versus
tokens-per-character. Fertility is a defined quantity in arXiv 2607.24276,
so the comparison has a convention and was never a free choice.
