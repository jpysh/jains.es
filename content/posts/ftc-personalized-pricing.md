---
title: The FTC's personalized pricing statement is a disclosure rule in disguise
description: The FTC says it cannot ban individualised pricing, but hiding how personal data sets a price may breach Section 5. What retail pricing teams should audit now.
ogTitle: The FTC's personalized pricing statement is really about disclosure
ogDescription: The exposure is not the pricing. It is failing to tell customers how their data sets it.
date: 2026-09-03
category: retail-tech
sources:
  - primary | Federal Trade Commission | 2026-08-19 | FTC Seeks Comment on Enforcement Policy Statement Regarding Personalized Pricing | https://www.ftc.gov/news-events/news/press-releases/2026/08/ftc-seeks-comment-enforcement-policy-statement-regarding-personalized-pricing
  - primary | Federal Trade Commission | 2026-09-03 | FTC Extends Public Comment on Proposed Policy Statement Regarding Personalized Pricing | https://www.ftc.gov/news-events/news/press-releases/2026/09/ftc-extends-public-comment-proposed-policy-statement-regarding-personalized-pricing
  - reported | Retail Dive (Kristen Doerer) | 2026-08-26 | The FTC is turning its sights on personalized pricing. What does it mean for customers? | https://www.retaildive.com/news/ftc-personalized-surveillance-pricing-what-it-means-CX/828626/
---

The Federal Trade Commission published a proposed enforcement policy statement on personalized pricing on 19 August 2026 and opened it for public comment on a 2-0 vote. The FTC's own position is that it cannot prohibit the practice outright. What it says instead is that failing to disclose how a retailer uses personal data to set an individual's price may violate Section 5 of the FTC Act. For anyone running pricing or personalization, that turns a long-running policy argument into a near-term documentation problem: you need to be able to say what your prices vary by, and you need to have decided what you tell customers about it.

Personalized pricing, in the FTC's framing, means using personal data to set a price based on what the agency believes that individual will pay. The enforcement theory attached to it is deception, not unfairness in the price itself. A retailer charging two customers different amounts is not the violation. A retailer charging two customers different amounts while presenting the number as the price is where the exposure sits.

## The practical problem is that most retailers cannot answer the question

Ask a pricing team what their price varies by and you will get a clean answer about channel, region, promotion and loyalty tier. That answer is usually about the pricing engine the team owns. It rarely covers everything in the stack that moves a number in front of a specific person.

The places individual-level variation tends to arrive from without anyone deciding to do it:

- **Personalization and offer engines.** A targeted discount applied to a segment of one is a personalised price with a different owner and a different budget line.
- **Vendor-side dynamic pricing.** If a third party sets or adjusts prices on your behalf, their model's inputs are your disclosure problem. Most contracts describe the outcome, not the features.
- **App versus web differences.** Device, session and logged-in state frequently feed repricing logic that nobody classifies as personalised.
- **Retention and win-back flows.** Offers triggered by churn risk scores are priced against a prediction about an individual, which is exactly the mechanism the FTC describes.
- **Loyalty tiers built on behavioural data.** Tier-based pricing is well understood. Tiers assigned by predicted spend rather than actual spend are a different thing wearing the same label.

None of these is necessarily a problem. All of them need to be findable before you can write a truthful sentence about how prices are set.

## What to do in the next quarter

**Inventory the variation, not the intent.** Get one list of every system that can cause two customers to see different prices for the same item at the same moment, with an owner's name against each. Include anything a vendor operates. The test is whether the output differs by person, not whether the team meant it to.

**Separate segment pricing from individual pricing.** These attract different scrutiny and most organisations have them in one bucket. Regional pricing, member pricing and a published clearance schedule are ordinary retail. A price set from a model's estimate of one shopper's willingness to pay is the thing under discussion.

**Draft the disclosure before the lawyers ask for it.** Someone has to write the plain sentence that describes what you do. Doing that while the practice is still changeable is cheaper than doing it under a civil investigative demand. It also tends to kill the least defensible use cases without a meeting, because a practice nobody will put in writing usually should not be running.

**Read your vendor contracts for model inputs.** Ask each pricing or personalization vendor, in writing, which personal or behavioural attributes enter their pricing logic. If the answer is a product description rather than a feature list, that is the gap.

**File a comment before 25 September.** The FTC extended the comment period by seven days on 3 September 2026, moving the deadline from 18 to 25 September. That window is the only point where an operator's account of how this works in practice reaches the record for free. Pricing leaders who think a disclosure obligation is workable but that a specific construction of it is not should say so while it is still a proposal.

## Where this is heading regardless of the outcome

The FTC's proposal sits on top of state activity that has already moved, including action in Maryland and Connecticut. A retailer operating nationally does not get to wait for one federal answer, because the state rules land on their own schedule and the compliance work underneath all of them is the same work: knowing what your prices vary by, and being able to describe it.

That work is unglamorous and it has a useful side effect. Teams that complete the inventory usually find variation they did not know they had, running in systems nobody has reviewed in two years. Some of it is not earning anything. The audit pays for itself before the regulation arrives.

The thing to avoid is treating this as a legal review of the pricing engine. The engine is the part you already understand. The exposure is in the offers, the vendors, the retention flows and the app, and those have four different owners who have never been in the same room about it.

The cost of getting the disclosure question wrong is not only regulatory. [Ulta's licence plate reader deployment](/blog/ulta-licence-plate-readers/) shows how fast a data practice nobody had explained becomes a brand problem, at a scale of deployment far too small to have earned anything back.
