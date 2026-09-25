---
title: Tokenisation and the cost of your language
stage: seedling
created: 2026-09-21
modified: 2026-09-22
summary: The same sentence costs several times more in Hindi than in English, because a tokeniser cuts it into more pieces. The multiplier is measurable, and it is a design choice rather than a property of the script.
tags: tokenisation, cost, languages
prereqs: start-here
related: what-a-merge-is, start-here
sources:
  - primary | Priyansh Srivastava | 2026-07-27 | The Tokenizer Tax: Quantifying and Explaining the Cross-Lingual Cost of Subword Tokenization for Indian Languages | https://arxiv.org/abs/2607.24276
  - primary | Gates Foundation | 2026-09-14 | Gates Foundation Commits US$1 Billion to Help Build and Deliver Equitable AI | https://www.gatesfoundation.org/ideas/media-center/press-releases/2026/09/goalkeepers-report-equitable-ai
---

Send one sentence to a language model's API in English. Send the official
translation of that same sentence in Hindi. You are billed more for the Hindi.

Not a little more. A preprint published on 27 July 2026 measured fourteen
Indian languages against six tokenisers. Under `cl100k_base`, the tokeniser
behind GPT-3.5 and GPT-4, Indian languages cost an average of 8.0 times what
English costs for the same content. Malayalam costs 13.0 times. The usable
context window falls to as little as 12% of what an English user gets for the
same money.

That is the fact this page exists to explain.

## Why it happens

A model does not read letters. It reads **tokens**: numbered pieces of text,
drawn from a fixed list built before the model was trained.

The list is built by looking at a very large amount of text and keeping the
pieces that appear often. Common English words survive whole. Rarer sequences
get split into smaller pieces. Text the list has barely seen gets split down
to individual characters, and sometimes below that, into single bytes of the
character's encoding.

So the size of your bill depends on how much of your language was in the text
the list was built from.

The Gates Foundation's release of 14 September 2026 gives the number behind
that: more than 90% of the data used to train early large language models came
from English-language sources. That is the cause. The 8.0x is the effect.

### An analogy, and where it breaks

A shop sells rice in twenty-kilo sacks, five-kilo sacks and one-kilo bags. If
you want twenty kilos and the shop stocks that size, you buy one sack. If it
has never stocked your size, you buy twenty small bags, and you pay more for
the same rice.

**Where it breaks:** a real shop could stock your size tomorrow. A tokeniser's
vocabulary is fixed when the model is trained. Nobody can add your size to a
model that already shipped — you have to wait for the next one.

## The mechanism, named

The paper identifies what actually drives the cost: **failed byte-pair
merges**. Merge failure correlates with the tax at Pearson r = 0.89 across
fourteen Indian languages.

*Updated 2026-09-22.* This section previously stopped at that sentence, which
named the cause without showing it. What follows was added after reading the
vocabulary directly.

**Your language is not missing. It is unmerged.**

A tokeniser's vocabulary starts with all 256 possible bytes. Every byte your
keyboard produces is on line one. A Devanagari character is three bytes in
UTF-8, and all three are present.

What is absent is the merges. Byte-pair encoding builds the rest of the
vocabulary by counting adjacent pairs and gluing the most common one, about a
hundred thousand times over. The pairs that would have joined your three bytes
into one character never reached the top of that count, because the corpus did
not hold enough of your language.

So the fragmentation is not rejection. Nobody looked at your script and
decided against it. That distinction matters, because a corpus can be changed
and a script cannot.

The full mechanism, and the one line of the algorithm that would change it,
is on [what a merge is](/wiki/what-a-merge-is/).

## It is not your script

This is the part worth carrying away.

The same paper ran multilingual tokenisers — XLM-R and OpenAI's `o200k_base`
— over the same fourteen languages. The average Indic tokenisation tax fell
by 73%.

If the cost were a property of Devanagari or Tamil script, changing the
tokeniser could not have done that. The cost is a consequence of a corpus
decision. Corpus decisions are reversible.

## Measure it yourself

The cheapest experiment in the field. Ten minutes, no GPU, no account.

```
pip install tiktoken
```

```python
import tiktoken
enc = tiktoken.get_encoding("cl100k_base")
print(len(enc.encode("All human beings are born free and equal in dignity and rights.")))
print(len(enc.encode("सभी मनुष्यों को गौरव और अधिकारों के मामले में जन्मजात स्वतन्त्रता और समानता प्राप्त है।")))
```

Use a sentence with an official translation rather than your own. Article 1 of
the Universal Declaration of Human Rights has official versions in most
languages, so the comparison is between two translations, not between your
English and your Hindi.

Then swap `cl100k_base` for `o200k_base` and run it again. The second number
is the one that shows the cost is a choice.

## What is still unsettled here

Written on day 1 of learning this, and these are open rather than rhetorical.

- ~~**Tokens per sentence, or tokens per character?**~~ **Settled
  2026-09-22.** The two do give different multipliers from the same table, but
  the choice is not free: the paper reports *fertility*, which is a defined
  quantity, so a figure compared against it must use the same definition. What
  was wrong here was treating a convention as a preference. It got through
  because this page was written before its own source had been read closely
  enough.
- **Why 8.0x and not 4x?** The 8.0x is measured across fourteen languages in
  arXiv 2607.24276. The 4x is the figure
  [this project's own curriculum](https://github.com/jpysh/jains.es/blob/main/AI101/CURRICULUM.md)
  told the author to expect, and it carries no source there. Stated that way
  because an earlier version of this page called 4x "commonly repeated
  guidance", which laundered an unsourced number into a consensus that was
  never demonstrated. Not yet resolved, and the honest position is that only
  one of the two figures has a source.
- **What counts as a failed merge?** A Devanagari character is three UTF-8
  bytes. When a token holds two of the three, is that one failure or two? The
  r = 0.89 above depends on a convention for this. Raised 2026-09-22.

## Related

- [What a merge is](/wiki/what-a-merge-is/) — the algorithm underneath the
  cost measured on this page.
- [Start here](/wiki/start-here/) — what this wiki is and how to read a page
  that says it is probably wrong.
