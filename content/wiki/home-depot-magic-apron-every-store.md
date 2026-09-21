---
title: Home Depot pointed its AI assistant at customers, and at its own inventory data
summary: Magic Apron now covers 2,000+ US stores with aisle-level location and real-time stock. A customer-facing assistant publishes your inventory accuracy to everyone.
stage: evergreen
created: 2026-09-02
tags: retail, commerce
sources:
  - reported | Retail Dive (Tatiana Walk-Morris) | 2026-09-01 | The Home Depot extends AI assistance in local stores | https://www.retaildive.com/news/the-home-depot-extends-ai-assistance-stores/829240/
---

Home Depot has extended its Magic Apron AI assistant to customers in all of its 2,000-plus US stores, with a store-localised version that answers aisle-level product location questions, reports real-time inventory and handles store navigation, plus image and voice search, according to Retail Dive's report on 1 September 2026. Customers reach it through Store Mode in the app and through QR codes in the aisles. The decision worth studying is not the assistant. It is that Home Depot aimed it at shoppers rather than associates, and wired it to store-level stock, which means every gap between the inventory record and the shelf is now something a customer discovers out loud.

Most in-store AI has gone the other way. Associate-facing tools are the safer build: a store employee who gets a wrong aisle number walks the shopper there anyway, absorbs the error, and nobody logs it. The failure is invisible and the data quality problem never gets funded. Put the same lookup in the customer's hand and a wrong answer becomes a customer standing in aisle 12 looking at a bay that does not contain what the app promised.

## Inventory accuracy stops being an internal metric

Every retailer has a number for stock record accuracy and most of them know it is optimistic. The usual reasons are ordinary: shrink recorded late, returns put back on the wrong shelf, deliveries received in bulk against a location nobody updated, planogram changes ahead of the reset. Those errors are tolerable when the record's audience is a replenishment algorithm and a district manager's report.

A customer-facing assistant changes who reads the record. Aisle-level location claims are the harshest version of this, because they are verifiable in ten seconds by a person standing in the store. Real-time inventory is nearly as exposed. A shopper who drives to a store on the strength of an in-stock answer and finds nothing has a worse experience than one who was told nothing at all.

This is the part that tends to be underbudgeted. The model is a procurement decision now. Getting bay-level product locations correct across thousands of stores, and keeping them correct through resets and seasonal changes, is field operations work with headcount attached to it.

## Questions to answer before shipping something similar

**What is your accuracy, by store, not on average?** A network average hides the distribution. The stores at the bottom of it are the ones generating the complaints, and they are usually the stores with the highest staff turnover, which is also why the data drifted.

**Do you have location data below the department level?** Many retailers have department or aisle mappings that were built once for a store-locator feature and never maintained. Bay-level accuracy is a different dataset and most organisations do not have it.

**What does the assistant say when it does not know?** An assistant that declines to guess a location is more useful than one that guesses well most of the time. This is a product decision, and it is the single cheapest control on the reputational downside.

**Who owns the correction loop?** When a customer's question reveals a wrong record, does anything happen? A customer-facing assistant is the best free inventory-audit mechanism a retailer will ever get, and it only works if the mismatches route to someone in the store.

**Which questions are you deliberately not answering?** Product location, stock and navigation are checkable against reality. Advice, compatibility and project guidance are not, and they carry a different kind of risk in a category where a wrong answer means a returned part or a failed installation.

## The sequencing most retailers should use

Point the assistant at your staff first, and instrument it. Not because associate tools are more valuable, but because they generate the accuracy data you need in order to know whether a customer-facing version is safe to ship. Six weeks of associate lookups will tell you, per store, how often the record and the shelf disagree. That number decides whether you are building a product or publishing a defect.

Then pick the narrowest customer-facing question you can answer reliably. "Is this in stock at this store" is harder than it sounds and more valuable than a general chat interface. If your accuracy will not support it, fixing the data is the project, and the assistant is what you do afterwards. That is the same conclusion [Dollar General reached from the supply side](/blog/dollar-general-ai-forecasting/), where the consolidation of ordering and lead-time data was the work and the platform sat inside it.

Home Depot's advantage here is a category where customers already arrive with a specific part in mind and a store format big enough that finding it is a genuine problem worth solving. Retailers with smaller footprints should be honest that aisle-level navigation solves less, and that the inventory accuracy work is the same size either way.

The broader read is that customer-facing AI has a prerequisite most AI budgets do not include. A model is cheap and arrives configured. Operational data that survives contact with a customer's question is neither, and no assistant will paper over the gap. It will advertise it.
