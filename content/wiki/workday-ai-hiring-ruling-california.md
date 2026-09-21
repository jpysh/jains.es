---
title: The home state of your screening vendor may be your compliance jurisdiction
summary: A California judge let FEHA claims against Workday's AI screening tools proceed for non-California plaintiffs, because the tools were built in California.
stage: evergreen
created: 2026-07-07
tags: work, hiring
sources:
  - reported | HR Dive (Emilie Shumway) | 2026-06-23 | Workday can't shake California AI discrimination claims | https://www.hrdive.com/news/workday-california-AI-bias-lawsuit-feha/823555/
---

Judge Rita Lin of the Northern District of California declined to dismiss claims that Workday's AI screening tools violated California's Fair Employment and Housing Act, and allowed those claims to proceed even for plaintiffs who never worked or applied in California, according to HR Dive's report on 23 June 2026 by Emilie Shumway. Her reasoning was that the tools were designed, developed, maintained and controlled in California, which was enough nexus to apply California law. If that reasoning holds, the state employment law governing your screening stack is not determined by where your employees are. It is determined by where your vendor's engineers sit.

## What was and was not decided

Nothing here is a finding that Workday discriminated against anyone. A denied motion to dismiss means the court accepted that the claims, taken as pleaded, are legally capable of proceeding. No evidence has been weighed. No liability has been established. The case continues.

The ruling was also not a clean sweep for the plaintiffs. Per HR Dive's report, Judge Lin kept a disability claim alive and dismissed a race-based disparate impact claim. So the surviving theory is narrower than "AI screening is discriminatory," and anyone summarising this as a verdict against algorithmic hiring is reading a headline rather than a docket.

What matters commercially is the nexus holding, not the merits. A procedural ruling on which law applies travels further than a fact-specific finding would, because it applies to every employer using a tool built in that state, regardless of the tool's accuracy.

## Why the nexus point is the expensive part

Most HR compliance registers are organised by where the company employs people. You track the jurisdictions you hire in: New York City's bias audit rule, Illinois, Colorado, whatever applies where your headcount sits. That map is how the budget gets allocated and how outside counsel gets briefed.

The Workday ruling cuts across that map. Under Judge Lin's reasoning, a plaintiff in a state with weak or no algorithmic hiring law may be able to reach a California statute because the software that screened them was built in California. An employer running the same tool in three countries may face a single body of state law it never considered, arriving through the vendor rather than through its own footprint.

Consider where the large HR technology vendors are actually headquartered and where their engineering happens. A great deal of the applicant tracking, screening, matching and video assessment market is built in California. Employers have been treating that as an irrelevant procurement detail.

## What to put in front of counsel

This is not legal advice and it is not a template. It is the set of questions worth asking, because they are cheap to ask now and expensive to ask during discovery.

**Where is each screening tool in our stack designed, developed and maintained?** Not where the contracting entity is registered. Where the product is actually built and operated. Vendors will answer this, and several will have to check.

**Does our contract allocate the risk of a claim brought under the vendor's home-state law?** Most indemnities in HR software contracts contemplate data breach and IP infringement. Very few contemplate an employment discrimination claim arising from the vendor's own model, reaching the employer under a statute neither party mapped. Ask counsel whether your current indemnity covers it, whether the cap is meaningful next to a class claim, and whether the vendor carries insurance that would respond.

**Can the vendor produce, on request, what the tool did to a specific applicant?** If a claim proceeds, someone will have to explain the decision. If the answer depends entirely on the vendor's cooperation and the contract has no audit or evidence-production clause, you have a documentation problem that is structural rather than technical.

**Which of our tools make or materially shape a rejection decision, as opposed to organising information?** This distinction does more work than anything else in the list, and it is within your control.

## The design choice that reduces the exposure

We have written before about [what an AI pilot actually costs](/blog/what-an-ai-pilot-costs/), including the screening features we built and then deleted. The relevant one here: we replaced a candidate scoring model with plain extraction. Instead of ranking applicants, the system pulls out the five fields the recruiter always checks and lays them in a row. The AI reads, the human decides, and there is a person attached to every rejection.

That change was made for adoption reasons — recruiters did not trust a score with no reasoning — but it changes the legal posture too. A tool that summarises information a human then acts on is a different thing from a tool that filters a pool before any human sees it. The first produces a record of a human decision. The second produces a record of an automated one, and under the theory now proceeding in California, someone may eventually ask you to defend it under a statute chosen by your vendor's address.

## Do this in the next quarter

List every tool in the hiring path that removes, ranks or scores a candidate before a human looks. For each one, record where it is built and who signed the contract. Take that list to counsel with the indemnity question attached. Then decide, for each tool, whether it needs to sit behind a human decision rather than in front of one.

Two of those steps are a morning's work with your procurement records. The third is a product decision you can make without waiting for the litigation to resolve, which is useful, because it will not resolve for years.
