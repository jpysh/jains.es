# Workflow — one day, one command

`/daily` does the whole day. You are the only human, at three points (the red boxes). Nothing is invented: every claim carries a sentence quoted
from a page opened in the run, and step 5 re-opens every page to check it.
The previous three-block version is in `archive/WORKFLOW-v1.md`.

```mermaid
flowchart TD
    NNW[("NetNewsWire sweep<br/>free, offline")] --> S1
    WEB["Web discovery<br/>max 15 searches"] --> S1
    CUR["CURRICULUM.md<br/>today's topic"] --> S1
    CTX["LEARNED.md, OPEN-QUESTIONS.md,<br/>existing wiki pages"] --> S1

    S1["1 Session<br/>AI101/sessions/DATE.md"] --> H1{{"YOU: approve angle,<br/>news items + quoted sources"}}
    H1 --> S2["2 Edition<br/>content/days/DATE.md"]
    S2 --> S3["3 Wiki<br/>content/wiki/*.md"]
    S3 --> S4["4 Short script<br/>content/shorts/DATE.md"]
    S4 --> V["5 Verify<br/>check-links.sh + fresh audit agent<br/>quote must be on the page"]
    V -- "finding: cut or re-source" --> S2
    V -- clean --> B["6 npm run build + check"]
    B -- fails --> S2
    B -- passes --> PR["7 One pull request"]
    PR --> H2{{"YOU: merge"}}
    H2 --> OUT["Cloudflare deploy<br/>/day/N/ and /wiki/slug/"]
    H2 --> H3{{"YOU: paste to Substack,<br/>film the Short, study"}}
    H3 -. "corrections" .-> CTX

    classDef human fill:#fde2e2,stroke:#c0392b,color:#000
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
