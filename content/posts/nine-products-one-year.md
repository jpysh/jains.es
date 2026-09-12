---
title: 'Nine products, one year, one team: the stack'
description: Nine products shipped in a year by one team. The six decisions made once and never revisited, and the open-source one you can run yourself.
ogTitle: 'Nine products, one year, one team: the stack'
ogDescription: The six decisions behind nine shipped products, and the open-source one you can run yourself.
date: 2026-09-11
category: retail-tech
sources:
  - primary | Jains | 2026-09-11 | AyurCalm Scheduler — MIT-licensed appointment scheduler | https://github.com/jpysh/ayurcalm-scheduler
---

In the last year we designed, built and shipped nine products: a cross-border storefront, a homestay booking site, a job board, a word game, a consulting practice, a D2C olive oil brand, an enterprise software front end, a long-form editorial manifesto, and an open-source scheduler for wellness clinics.

Different markets, different countries, one team. People assume the answer is a template. It isn't — it's a short list of decisions made once and never revisited, which is a different and much more useful thing.

## Rule one: static unless proven otherwise

Most of what a business needs on the web is pages. Pages don't need a server, a database, or a runtime. Every project starts as static HTML and CSS, and earns its way up to dynamic only when a specific requirement demands it — a checkout, a login, a booking that must not double-book.

The payoff isn't ideological. It's that a static site loads in under a second on a bad connection in another country, costs nothing to host, has almost no attack surface, and still works in five years when the framework we might have picked has had four breaking releases.

> The cheapest software to maintain is the software that isn't running.

## Rule two: one platform, not nine

Everything sits on Cloudflare. Domains, DNS, static hosting on Workers, serverless functions where something has to run, object storage where something has to be stored, and the CDN in front of all of it.

Choosing one platform for nine products means nine deployments that work identically, one dashboard, one set of credentials, one mental model. The cost across the whole portfolio is closer to a single streaming subscription than to a hosting bill — which matters, because a product that costs nothing to keep alive never has to be killed for budget reasons.

This site is the same: a git repository, pushed to GitHub, built and deployed by Cloudflare automatically on every commit. No build server to maintain, no deploy key to rotate, nothing to forget.

## Rule three: git is the source of truth, always

Every project — including the client ones, including the throwaway ones — lives in a repository. Deployment happens on push. There is no such thing as a change made directly on a server.

Two reasons. One, it means handover is real: a client gets a repository, not a promise. Two, it means any project can be picked up eight months later and understood, which is the difference between a portfolio and a pile of abandoned domains.

## Rule four: AI in the build loop, not in the product

AI accelerates the work far more than it appears in the work. Across these nine products it drafted product descriptions, alt text and metadata; turned client call recordings into page structures; generated placeholder imagery so launches weren't blocked on photography; wrote the boring half of the code; and produced first-pass translations.

What it did not do was make decisions that require knowing a customer. Which product leads the homepage, what objection to answer first, whether a price reads as premium or suspicious in a given market — every one of those came from a person, and every time we let the model have an opinion on them the result was fluent and wrong.

AI appears *inside* the product only where it survives a simple test: does it do something the user could not do faster themselves? In the job board it extracts decision fields from CVs — genuinely faster. The screening score we built in the same project failed that test and was deleted. We wrote about that in [what an AI pilot actually costs](/blog/what-an-ai-pilot-costs/).

## Rule five: no dependency we can't replace in an afternoon

Nine products means nine future maintenance obligations. So the bar for adding anything is deliberately high: no framework where the platform already has the feature, no library for something CSS does natively, no service that takes custody of data we'd need to get back out.

Concretely, that means CSS does the animation, the browser does the form validation, and the platform does the routing. The scroll-driven fades on this page are about ten lines of CSS with no JavaScript at all. That isn't minimalism as taste — it's nine products a person can still hold in their head.

## Rule six: ship it, then look at it

Every one of these went live before it was finished, on a real domain, and then changed based on what actually happened. The homestay site learned that its visitors arrive from three countries nobody predicted. The word game learned that people play in short bursts rather than long sessions. Neither fact was available before launch, and neither would have been guessed correctly in a planning document.

## The open-source one

One of the nine is public: [AyurCalm Scheduler](https://github.com/jpysh/ayurcalm-scheduler), a self-hosted appointment and therapy scheduler for massage, therapy and Ayurveda centres. MIT-licensed, TypeScript, runs on a small clinic's own infrastructure.

It exists because small wellness clinics were paying per-seat SaaS pricing to book a treatment room — a problem that is genuinely solved software, not a market opportunity. Publishing it costs us nothing and saves those clinics a recurring bill. Fork it, run it, no contact with us required.

## Whether any of this applies to you

If you're a company evaluating a build, the transferable part isn't the technology choices — it's the shape of them. Prefer boring and replaceable. Put everything in version control. Let AI take the blank page and keep the judgement. Launch before you're comfortable, and let the traffic tell you what to fix.

And if a vendor's proposal has more infrastructure in it than product, ask what happens to each of those pieces in year three.
