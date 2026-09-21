# Curriculum — months 1–3

120 minutes a day. Every day produces one publishable artefact. Everything here
runs free on the M2 Air or on Kaggle. Nothing needs a paid GPU.

**Spine:** Karpathy's *Neural Networks: Zero to Hero* — the best free resource
for exactly this path, and the one that builds from a blank file rather than
importing a library. We follow it, but we do not just re-record it: every day
the lesson is re-anchored to something the audience cares about, which for an
India-primary audience is usually *cost, language, or access*.

---

## Weeks 1–2 — Tokenisation: why your language costs more

The best possible opening for this audience, because it is their problem and it
is measurable on day one with no GPU and no maths.

| Day | Session | Artefact |
|---|---|---|
| 1 | `pip install tiktoken`. Count tokens for the same sentence in English, Hindi, Tamil, Bengali. Tabulate the ratios. | "Your language costs 4× more" — code + table |
| 2 | Why: byte-pair encoding, what a merge is, walk `cl100k_base` vocab by hand | How a tokeniser actually reads text |
| 3 | Build BPE from scratch, ~120 lines, no libraries (Karpathy `minbpe`) | Working tokeniser you wrote |
| 4 | Train it on English text. Vocab size vs sequence length trade-off | Why vocab size is a design decision |
| 5 | Train the same tokeniser on Hindi text. Measure fertility before/after | You improved a tokeniser for your own language |
| 6 | Special tokens, `<|endoftext|>`, chat templates, why they break things | The invisible tokens that control the model |
| 7 | Review + the week's loose ends | Weekly digest |
| 8–10 | Unicode, UTF-8, why Devanagari is expensive at the byte level | The encoding layer under the tokeniser |
| 11–14 | Buffer + the first real "what I got wrong" episode | — |

**Reference:** Karpathy, *Let's build the GPT Tokenizer* (2h24m) and
[`karpathy/minbpe`](https://github.com/karpathy/minbpe).

**Why this first:** it needs no maths, no GPU, no training loop, and it produces
a genuinely novel result for an Indian audience on day one. It also makes the
next eight weeks legible — once you know text becomes integers, "what does the
model do with the integers" is an obvious question.

---

## Weeks 3–4 — From counting to learning

| Day | Session |
|---|---|
| 15–16 | Bigram counts in a 2-D array. Sample from it. Bad text, but *structured* bad text |
| 17–18 | The same thing as a neural network: one-hot, a weight matrix, matmul |
| 19–20 | Loss: why negative log likelihood, what cross-entropy measures |
| 21–22 | The training loop: forward, backward, `zero_grad`, step. Line by line |
| 23–24 | Sampling: greedy, temperature, top-k. Why temperature changes personality |
| 25–28 | Embeddings: why a lookup table beats one-hot. Visualise them |

**Reference:** Karpathy, *makemore* parts 1–2. **JIT maths this fortnight:**
dot product, matmul shapes, `log`/`exp`, softmax, cross-entropy.

---

## Weeks 5–6 — Backprop, properly

The fortnight where most self-learners quietly start importing instead of
understanding. Do not skip it — it is also the most watchable content you will
make, because deriving a gradient badly on camera is genuinely interesting.

| Day | Session |
|---|---|
| 29–31 | `micrograd`: build a scalar autograd engine, ~100 lines |
| 32–34 | Backprop by hand through a two-layer MLP. On paper. On camera |
| 35–37 | MLP character model; train/dev/test; overfitting you can see |
| 38–40 | Initialisation, why deep nets die, batchnorm and what it actually fixes |
| 41–42 | Buffer |

**Reference:** *makemore* parts 3–4, `karpathy/micrograd`.
**JIT maths:** chain rule, partial derivatives, gradient of matmul.

---

## Weeks 7–9 — Attention and the transformer

| Day | Session |
|---|---|
| 43–45 | The problem attention solves: fixed context is not enough |
| 46–48 | Self-attention from scratch: Q, K, V, and why the dot product |
| 49–50 | Scaling by √d_k — derive why, don't assert it |
| 51–52 | Causal masking; why a language model must not see the future |
| 53–55 | Multi-head; residuals; layer norm; the full block |
| 56–58 | Positional encoding: learned vs sinusoidal vs RoPE |
| 59–63 | Assemble GPT, ~10M params, train on the M2 Air |

**Reference:** Karpathy, *Let's build GPT: from scratch, in code, spelled out.*
**Artefact at day 63:** a transformer you wrote, that generates text, on your
own laptop. This is the first genuinely shareable milestone.

---

## Weeks 10–12 — Scale to the ceiling, then explain the ceiling

| Day | Session |
|---|---|
| 64–66 | `nanoGPT`: read every line, diff it against yours |
| 67–70 | Dataset prep; move to Kaggle; checkpoint and resume across sessions |
| 71–76 | Train ~30–50M params on ~1–2B tokens. Publish the loss curve daily |
| 77–80 | Evaluation that is not vibes: perplexity, and its limits |
| 81–84 | Scaling laws plotted against **your own** curves |
| 85–90 | **"What GPT-2-124M would have cost me, and why I stopped here"** |

That last piece is the flagship of month 3. The honest accounting — a T4 run
takes roughly eight days for a third-length run, a real one needs rented H100
hours, here is the arithmetic — is more useful to a budget-constrained audience
than a trophy would be, and no well-funded channel will publish it.

---

## Months 4–6 — Making models small enough to matter

The through-line: **a model nobody can afford to run is not useful to your
audience.** This is where the two quotes in the brief meet.

- Quantization: int8, int4, GPTQ, AWQ. What actually degrades, measured
- QLoRA on the M2 Air via MLX: fine-tune a 1–4B model on your own data
- Knowledge distillation: small student, large teacher
- Pruning and sparsity; what survives and what does not
- Inference optimisation: KV caching, speculative decoding, batching
- Running a useful model on a phone-class device — the end of the arc
- Distributed training on Modal's free monthly credits

**Hardware note:** the M2 Air with MLX handles 4-bit inference at 7–8B and
QLoRA at 1–4B. The Intel mini cannot train — no Metal — and is the orchestrator,
scraper and CI runner only.

---

## The rule for every session

By the end of 120 minutes you must have **one runnable artefact**: a file, a
number, a plot, or a broken thing with a diagnosis. "I read about X" is not a
session. If the session fails, the artefact is the failure and the diagnosis —
that is a legitimate episode and roughly one a week is expected.
