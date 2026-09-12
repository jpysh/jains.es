---
title: What an AI pilot actually costs a 50-person company
description: Real numbers for a first AI project at a mid-sized company — what it costs to build, what it costs to run, and the 40% we built and deleted.
ogTitle: What an AI pilot actually costs a 50-person company
ogDescription: Real numbers for a first AI project — build cost, running cost, and the parts we deleted.
date: 2026-09-11
category: hrtech
sources:
  - primary | Jains | 2026-09-11 | Excelminds Jobs — job board and candidate pipeline | https://excelmindsjobs.com
---

Every mid-sized company we talk to has the same two beliefs at once: that AI will change how they work, and that finding out will cost six figures. The second belief is why nothing happens. So here are real numbers.

This is what a first AI project costs a company of roughly fifty people — not a strategy engagement, not a platform licence, an actual working thing in production. We'll also cover the parts we built and then deleted, because that's where most of the wasted budget in this category goes.

## The short answer

A useful first AI project at that size lands between **€4,000 and €15,000** to build, and between **€30 and €400 a month** to run. The range is wide because of one variable: whether your data is already in a system or still lives in people's inboxes.

If you were quoted €80,000 for a pilot, you were quoted for a discovery phase, a steering committee and a platform licence. None of those three things is the software.

## Where the money actually goes

**Model usage is the small number.** This surprises people every time. A company-wide assistant answering a few hundred questions a day, or a pipeline classifying a few thousand documents a month, runs at tens of euros. Not thousands. The cost of intelligence collapsed; most pricing expectations haven't caught up.

**Getting at your data is the big number.** The expensive part is never the AI. It's that the information the model needs is split across a CRM, a shared drive, three spreadsheets and one person who knows how the numbering works. Every hour of that is an hour of integration work, and it's the line item that separates a €4,000 project from a €15,000 one.

**Your team's attention is the real currency.** A pilot that needs eight hours a week from your operations lead has already cost you more than the invoice. We design around roughly two hours a week, because anything more gets quietly deprioritised the first busy month — and a deprioritised pilot is a total loss, not a partial one.

**Running it is cheap if it's built simply.** Static hosting is free. Serverless compute at this volume is free or close to it. Where monthly costs balloon is managed platforms billing per seat for infrastructure that would otherwise cost €5 a month.

## What we threw away building AI screening

We built a job board and candidate pipeline for a recruiter working in Nigeria — you can see it at [Excelminds Jobs](https://excelmindsjobs.com). The obvious AI feature was CV screening: rank the applicants, save the recruiter hours. We built it. Then we threw most of it away.

> The ranking was accurate and nobody trusted it. A score with no reasoning is just a number arguing with a professional's judgement.

Three things died in that project, and they're the same three that die in most of them:

**The scoring model.** Replaced with extraction. Instead of "this candidate is a 78% match", the system now pulls out the five things the recruiter always looks for — years in role, location, notice period, certifications, a sane employment timeline — and lays them in a row. The AI reads; the human decides. Adoption went from occasional to every single day.

**The chat interface.** Everyone asks for a chatbot. Almost nobody wants to type a question when a filtered list would answer it. We replaced the chat box with better defaults on the list view and usage went up.

**The automated rejection emails.** Technically simple, quietly a liability. In hiring, an automated decision communicated automatically is a legal and reputational exposure that no efficiency gain covers. The system now drafts; a person sends.

Roughly 40% of what we built in that pilot is not in the product today. That's not failure — it's the actual cost structure of a first AI project, and any quote that doesn't have room for it is a quote for something that won't get used.

## A pilot that doesn't waste your money

Four rules we hold to:

- **One workflow, not one department.** "AI for HR" is not a project. "Pull the five decision fields out of every incoming CV" is a project, and it ships in days.
- **Something clickable in week one.** If the first deliverable is a document, the second one will be too.
- **Measure the boring number.** Not accuracy — *time to first decision*. It's the one your team feels, and the one that predicts whether they keep using it in month three.
- **Own the output.** Your domain, your repository, your data. If the pilot fails, you should lose the pilot, not your leverage.

## When it isn't worth it

If the process you want to automate runs fewer than about twenty times a month, and a person can do it in ten minutes, leave it alone. The maintenance will outrun the saving. We say this to roughly one enquiry in five, before any money changes hands.
