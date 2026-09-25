# Workflow — one day, one command

`/daily` does the whole day. You are the only human, at three points (the red boxes).
The previous three-block version is in `archive/WORKFLOW-v1.md`.

```mermaid
flowchart TD
    subgraph IN["Inputs (read every run)"]
        NNW[("NetNewsWire local store<br/>tools/news-sweep.sh — free, offline")]
        WEB["Web discovery<br/>max 15 searches, 25 fetches"]
        CUR["CURRICULUM.md — today's topic"]
        OQ["OPEN-QUESTIONS.md"]
        LRN["prompts/LEARNED.md — past corrections"]
        WIKI0[("content/wiki/ — existing pages")]
    end

    S1["1 Session<br/>prompts/daily-research.md<br/>→ AI101/sessions/DATE.md"]
    H1{{"YOU: approve angle,<br/>5 news items, wiki targets"}}
    S2["2 Edition<br/>prompts/newsletter.md + slop pass<br/>→ content/days/DATE.md"]
    S3["3 Wiki<br/>fold into topic pages<br/>→ content/wiki/*.md"]
    S4["4 Short script<br/>45–60 s, ~130 words<br/>→ content/shorts/DATE.md"]
    A["5 Audit — fresh subagent<br/>opens every citation"]
    B["6 Validators<br/>npm run build + npm run check<br/>tier, date, tags, dead links"]
    PR["7 One pull request<br/>numbers + audit result"]
    H2{{"YOU: merge"}}
    H3{{"YOU: paste to Substack,<br/>film the Short, do the 120-min session"}}
    OUT["Cloudflare deploy<br/>/day/N/ and /wiki/slug/"]

    IN --> S1 --> H1 --> S2 --> S3 --> S4 --> A
    A -- findings --> S2
    A -- clean --> B
    B -- fails --> S2
    B -- passes --> PR --> H2 --> OUT
    H2 --> H3
    H3 -- "your corrections" --> LRN
    H3 -- "OUTCOME and OPEN lines" --> OQ

    classDef human fill:#fde2e2,stroke:#c0392b
    class H1,H2,H3 human
```

## Budget (Claude Pro, 5-hour window)

Pro gives roughly 10–40 agentic prompts per rolling 5-hour window, plus a weekly cap.
`/daily` runs on Sonnet with a hard cap of 15 searches, 25 fetches and one audit
subagent, which should fit one window with room left. The simulation's two audit
subagents alone used 169,537 tokens, so never run more than one. Run `/daily` in
a fresh session; do not use Opus for it. One `/daily` run is the only heavy job in a window. Keep other work out of the
same window. Monthly: prune `LEARNED.md` by hand, moving repeated rules into
the prompt they belong to.
