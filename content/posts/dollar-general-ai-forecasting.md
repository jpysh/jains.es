---
title: Dollar General bought its forecasting engine instead of building it
description: AI forecasting and replenishment across 21,000 stores and 34 DCs, from Relex rather than in-house. A useful benchmark for anyone costing a build.
ogTitle: Dollar General bought its forecasting engine instead of building it
ogDescription: 21,000 stores, 34 DCs, a vendor platform. What that says about your in-house forecasting plan.
date: 2026-09-07
category: retail-tech
sources:
  - reported | Retail Dive (Kelly Stroh) | 2026-09-04 | Dollar General deploys AI across distribution centers, stores | https://www.retaildive.com/news/dollar-general-ai-distribution-centers-stores/829201/
---

Dollar General is running AI-based forecasting, replenishment and allocation across its entire North American network — 21,000 stores and 34 distribution centres — on a platform from Relex Solutions rather than one it built, according to Retail Dive's report on 4 September 2026. The deployment consolidates ordering schedules, lead times and supplier coordination into a single environment, and CEO Todd Vasos described the ambition as building "agentic operating systems for the enterprise." For any supply chain leader currently costing an in-house forecasting build, this is the most useful comparison available: a retailer with the scale, the transaction volume and the thin margins to justify building one decided not to.

Scale is normally the argument for building. Above a certain volume, per-store or per-SKU licence costs start to look like a tax on your own size, and the internal case writes itself. Dollar General sits well above that line and went the other way, at full network scope rather than as a pilot.

## The question the decision actually answers

Forecasting builds get approved on a premise that rarely gets tested: that the forecast is where the company's advantage lives. It usually is not. The advantage tends to sit in the decisions wrapped around the forecast — what you carry, at what price, in which store, under what space constraint, with which supplier terms. A better demand signal makes those decisions better. It is not the same thing as being the reason they are good.

Three tests separate the two cases.

**Does your assortment logic depend on a forecast nobody else could produce?** If your merchandising rules are unusual but the underlying demand prediction is ordinary, you are building a commodity component in order to keep a proprietary one. Those can be separated, and the interface between them is where the work belongs.

**Would you fire the model if it were worse than a vendor's?** Teams that build rarely benchmark honestly against what they could have bought, because by the time there is something to benchmark, the build is a sunk commitment with a team attached. Decide the comparison and the switching trigger before the first sprint, or accept that you have decided never to switch.

**Who runs it in year three?** Forecasting systems are not finished software. They need retraining, seasonality handling, promotion effects, new-store cold starts and someone on call when Christmas ordering depends on them. A build is a permanent headcount line, not a project cost, and that line competes with analysts who could be improving the decisions instead.

## What Dollar General's version of the problem tells you

The specific detail worth noting is the consolidation. Ordering schedules, lead times and supplier coordination in one environment is a data and process integration achievement more than a modelling one. Most retailers running poor forecasts are not held back by their algorithm. They are held back by lead times that live in three systems and disagree, supplier calendars maintained in spreadsheets, and store ordering schedules that were set by a team that has since reorganised twice.

That work does not get easier if you build. It is the same work, and it is the majority of the effort either way. The difference is that a vendor deployment forces it to happen on a schedule, because the platform cannot be configured without it, whereas an internal build lets the team defer it and compensate with model complexity. The second route produces a more sophisticated forecast on worse inputs.

## What to do with this in the next quarter

If you have an in-house forecasting build in planning or early delivery, run a short, honest evaluation against two vendor platforms before the next stage gate. Not a procurement exercise. A comparison of what each would do with your actual data, scoped to a category and a region, with the integration work costed in both cases. The integration cost is the number that matters and it is roughly the same on both sides, which is what makes the model comparison clean.

If you are already committed to a build, write down the switching trigger now and put it in the programme documentation: the accuracy level, the date, and who decides. Builds do not fail loudly. They continue.

And if you are buying, budget the data consolidation as the project and the platform as a line item within it. A retailer with 21,000 stores can absorb a long configuration phase. A mid-size operator discovering its lead-time data is unreliable in month four of a fixed-price implementation cannot.

The same dependency shows up on the customer-facing side. [Home Depot's store-level assistant](/blog/home-depot-magic-apron-every-store/) only works because it is wired to inventory a customer can check against the shelf, which turns every data gap into something a shopper discovers out loud.

The broader pattern here is the same one that shows up whenever a large operator publishes an AI decision. The interesting part is almost never the model. It is which parts of the operation the company decided were not worth owning.
