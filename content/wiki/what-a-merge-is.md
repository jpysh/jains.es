---
title: What a merge is
stage: seedling
created: 2026-09-22
summary: Byte-pair encoding builds a vocabulary by repeatedly gluing together the most common adjacent pair. A merge is a count, not a judgement, and the order of the counts is what makes some languages expensive.
tags: tokenisation, mechanism
prereqs: tokenisation-and-the-cost-of-your-language
related: tokenisation-and-the-cost-of-your-language, start-here
sources:
  - primary | Priyansh Srivastava | 2026-07-27 | The Tokenizer Tax: Quantifying and Explaining the Cross-Lingual Cost of Subword Tokenization for Indian Languages | https://arxiv.org/abs/2607.24276
  - primary | Negar Foroutan and others | 2025-08-06 | Parity-Aware Byte-Pair Encoding: Improving Cross-lingual Fairness in Tokenization | https://arxiv.org/abs/2508.04796
---

Open a Python prompt and print the first fifty entries of `cl100k_base`:

```python
import tiktoken
ranks = tiktoken.get_encoding("cl100k_base")._mergeable_ranks
for piece, rank in sorted(ranks.items(), key=lambda kv: kv[1])[:50]:
    print(rank, piece)
```

You are looking at the fifty merges that happened first. Not the fifty most
important pieces of text, and not fifty anybody chose. The fifty most common
adjacent pairs in whatever pile of text this tokeniser was built from.

That is what a merge is.

## The algorithm, in four lines

Byte-pair encoding starts with 256 pieces: every possible byte. Then it
repeats one step until the vocabulary is the size it was told to reach.

1. Look at all the training text, already split into pieces.
2. Count every adjacent pair of pieces.
3. Take the pair that occurs most often. Glue it into a single new piece.
4. Add it to the vocabulary with the next rank number, and go back to 1.

`cl100k_base` did this about a hundred thousand times.

There is no step where a language is considered. There is no step where
somebody decides that `ing` deserves to be one token. Step 3 is a count, and
the count is over the corpus somebody assembled.

## Rank is the interesting column

The vocabulary maps bytes to a number, and the number is the rank: the order
in which that piece was created.

A low rank means the pair was extremely common early on. A high rank means it
only became worth merging after the obvious merges were used up.

So reading the ranks in order is reading a compressed description of the
training corpus. If the first thousand entries are English fragments and
punctuation, that is what the corpus was.

## Why this makes your language expensive

Here is the part worth carrying away, and it is the opposite of what people
assume.

**Your language is not missing from the vocabulary. It is unmerged.**

Every byte your keyboard can produce is in the vocabulary on line one, because
the vocabulary starts with all 256 of them. A Devanagari character is three
bytes in UTF-8, and all three of those bytes are present.

What is absent is the merges. The pairs that would have glued those three
bytes into one character, and that character to the next, never reached the
top of the count in step 3 — because the corpus did not contain enough of the
language for them to.

The result is that your text stays fragmented into single-byte pieces. The
Tokenizer Tax paper calls this a **failed byte-pair merge**, and reports that
merge failure correlates with the cost at Pearson r = 0.89 across fourteen
Indian languages.

### An analogy, and where it breaks

Think of the vocabulary as a set of shortcuts on a keyboard, learned by
watching one typist. Whatever that typist types often becomes a single key.
Everyone else types letter by letter.

**Where it breaks:** a keyboard can learn a new shortcut tomorrow. A
tokeniser's vocabulary is frozen when the model is trained, so the only way to
change it is to train another model.

## The order is a choice

Step 3 says "take the pair that occurs most often". Nothing forces that.

A preprint from August 2025 changes it to what the authors call a fair-max
rule: instead of maximising the overall compression gain, merge the pair that
most improves whichever language is currently worst compressed. They report
this reduces tokenisation inequality by up to 89% against classical BPE, with
negligible impact on the global compression rate and no evidence of systematic
degradation in downstream model performance.

That single substitution in step 3 is the entire difference. It is worth
sitting with, because it means the cost measured in
[tokenisation and the cost of your language](/wiki/tokenisation-and-the-cost-of-your-language/)
is not a fact about scripts. It is a consequence of a rule, and rules can be
swapped.

## What is still unsettled here

- **What counts as a failed merge?** A Devanagari character is three UTF-8
  bytes. When a token holds two of the three, is that one failure or two? The
  r = 0.89 figure above depends on a convention for this, and this page does
  not yet know which convention the paper used.

## Related

- [Tokenisation and the cost of your language](/wiki/tokenisation-and-the-cost-of-your-language/)
  — the measured cost this page explains the mechanism of.
- [Start here](/wiki/start-here/)
