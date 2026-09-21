# AI101

The operating system for the site. Everything that decides what gets
published, how, and from what.

Nothing in here is a web page. `content/` holds what readers see;
this folder holds what produces it.

## Read these to understand the project

| File | What it is |
|---|---|
| [`PLAN.md`](PLAN.md) | Why any of this is shaped as it is. The decisions and what they cost |
| [`CURRICULUM.md`](CURRICULUM.md) | Twelve weeks, day by day. Rendered at [jains.es/curriculum](https://jains.es/curriculum/) |
| [`WORKFLOW.md`](WORKFLOW.md) | **Start here if you want the mechanics.** What runs when, three diagrams |
| [`RUNBOOK.md`](RUNBOOK.md) | The daily schedule, Madrid time |
| [`VISION.md`](VISION.md) | The long horizon. Read for one line a day, never taught directly |
| [`SIMULATION.md`](SIMULATION.md) | A dry run of two days, with a review prompt |

## These change

| File | Changes | Who |
|---|---|---|
| [`prompts/`](prompts/) | Weekly, via the `/sunday` sweep | agent, reviewed |
| [`prompts/LEARNED.md`](prompts/LEARNED.md) | Daily. **Staging, not a record** — `/day` refuses to run past 20 lines | both |
| [`sources/SOURCES.md`](sources/SOURCES.md) | Weekly. What gets scouted, and the discovery brief | human |
| [`OPEN-QUESTIONS.md`](OPEN-QUESTIONS.md) | After a session. Things not understood yet, each with a test | human |
| [`TASKS.md`](TASKS.md) | Things only the human can do offline | both |
| [`sessions/`](sessions/) | One file a day. Plan, beats, script, outcome. **Never a page** | agent, then human |
| [`runs/`](runs/) | One directory per training run: config, loss curve, what broke | human |
| [`tools/news-sweep.sh`](tools/news-sweep.sh) | Reads NetNewsWire's local store. No network, no cost | — |

## The shortest version

One study session a day produces one artefact. That becomes a topic page
on the wiki, a video, and an edition of the newsletter. Nothing is
researched twice, and three things never happen without a human:
publishing, sending, and approving the day's angle.

Two agents, six slash commands, three learning loops. The loops are what
stop the prompts going stale: daily captures a correction, weekly promotes
it into the prompt file, monthly deletes the rules that never fired.
