# the-edit — AI Principles, Mechanism-First

A deep-dive companion to the interactive architecture diagram (`index.html`)
and the live-answer drill cards (`drill-cards.md`).

This doc is organized **mechanism-first**. For every AI principle used in the
pipeline, the answer is:

1. What the principle does in one sentence
2. Why it was needed in **the-edit** specifically
3. **The mechanism** — what actually happens at runtime, with the file:line
  in the repo
4. How to **prove** it worked (the log line, the field, the number)
5. **What silently breaks it** — failure modes you'd want to be asked about
6. **The follow-up that catches people** — the question a sharp hiring
  manager will ask, and the answer

Use this doc to study. Use `drill-cards.md` for live answering. Use
`index.html` when you need to show the system on a screen-share.

---

## 0 · The pipeline in one paragraph

**the-edit** is a deterministic TypeScript workflow agent that publishes
one weekly Magazine issue for the styleMeUp Discover tab. Eight stages run
in order: **Research** (web search + structuring) → **Rank** (score and
pick a winning trend) → human approval gate → **Edit** (write the issue
copy) → **Prompt** (generate Nano Banana / Kling asset prompts) → **QA**
(verdict: approve / revise / reject) → human approval gate → **Imagine**
(Gemini image generation, 4 variants per slot) → **Pick** (human picks one
variant per slot) → **Publish** (assemble manifest, write to Supabase).
Cost ceiling per issue: **$1.20 in steady state, $1.60 on a fresh trend,
$4.00 hard cap**. Two LLM providers — Anthropic Claude Sonnet 4.6 for
all text stages, Google Gemini (Pro for hero, Flash for cards) for image
gen. The whole thing is wired through the Vercel AI SDK with Zod schemas
on every structured output.

---

## Principle 1 · Prompt caching (the long version)

This is the principle you said you don't feel solid on. We're going to
walk it from the byte level up so a hiring manager can't push you off it.

**In plain English.** We send the same 21K-token brand bible with every
QA call. Anthropic notices it's the same bytes as last time (it keeps a
fingerprint), skips re-reading it, and charges us 10% of the normal
price for the part it remembered. Like a barista who starts your usual
order when you walk in — you still walk in, they just don't re-ask.

### What it is — one sentence

Prompt caching stores the **stable prefix** of an LLM request on the
provider's servers after the first call, so the second call within the
TTL reads the cached prefix at ~10% of the input token price instead of
reprocessing it from scratch.

### Why we needed it in the-edit

The QA executor (`src/executors/qa.ts`) loads the **entire DESIGN.md
file** as part of its system context every time it runs — the brand
bible is ~21,000 tokens of bans, voice rules, headline patterns,
photography conventions, and accessibility checks. Without caching, every
QA call pays full input price on those 21K tokens. That's about $0.063
per call at Sonnet 4.6 input pricing ($3 / 1M input tokens). The QA
stage runs at least once per issue, often twice (if it returns a
`revise` verdict and we re-run). It also runs on every test iteration
during development. Across a week of building and shipping the issue,
that's dozens of QA calls — and the cached portion is **the same bytes
every single time**. There is no reason to pay for it twice.

### The mechanism — what actually happens

The single most important sentence to internalize:
**caching does not mean "don't send the tokens." You still send them in
the request payload. Caching changes what Anthropic does with them on
their side, and what they charge you.**

Here is the request shape (verbatim from `qa.ts:96–103`):

```typescript
system: [
  {
    type: 'text',
    text: BRAND_PREAMBLE + '\n\n--- DESIGN.md ---\n\n' + designMd,
    providerOptions: {
      anthropic: { cacheControl: { type: 'ephemeral', ttl: '1h' } },
    },
  },
],
```

What happens step by step on the first call of the day:

1. Your code sends the full request: `[brand preamble][DESIGN.md][user
  message]`. The full payload, including the 21K tokens, crosses the
   wire.
2. Anthropic's server reads the `cacheControl` marker on that system
  block. The marker tells the server: "Everything up to and including
   this content block is a cacheable prefix. Hash it."
3. The server computes a content hash of the prefix (the BRAND_PREAMBLE +
  DESIGN.md bytes — exact byte sequence, before any tokenization
   differences) and stores the **already-tokenized + already-processed**
   prefix in its cache, keyed by that hash. The cache entry has a TTL of
   1 hour from this moment.
4. The server processes the rest of the request (the part after the
  cached block, plus the user message) normally.
5. The server returns a response. The `usage` object includes a new
  field: `cache_creation_input_tokens: 21000` (the number of tokens it
   stored).
6. **Billing**: cache write tokens are charged at **1.25× the normal
  input rate**. So that first call is slightly *more* expensive than
   no-cache: ~$0.079 instead of $0.063 for the DESIGN.md portion.

On the second call within the hour:

1. Your code sends the same request again. The full 21K tokens cross the
  wire **again**. Yes, really.
2. Anthropic's server reads the `cacheControl` marker, hashes the
  prefix, and finds a match in its cache that hasn't expired.
3. The server skips reprocessing the prefix. It already has the
  tokenized, processed representation in memory. It just appends the
   new user message and continues from there.
4. The response's `usage` object now includes:
  `cache_read_input_tokens: 21000`, and `cache_creation_input_tokens: 0`,
   and `input_tokens: <only the new user message size>`.
5. **Billing**: cache read tokens are charged at **0.1× the normal input
  rate**. So that DESIGN.md portion now costs $0.0063 instead of $0.063
   — a **10× reduction** on the cached portion.

That's the mechanism. The tokens still travel; the *work* of tokenizing

- processing them is what's cached; the *price* is what changes.

### The cost math, written out


| Call                 | What gets billed         | Total for DESIGN.md portion |
| -------------------- | ------------------------ | --------------------------- |
| Call 1 (cache write) | 21K tokens × $3/M × 1.25 | $0.079                      |
| Call 2 (cache read)  | 21K tokens × $3/M × 0.10 | $0.0063                     |
| Call 3+              | 21K tokens × $3/M × 0.10 | $0.0063                     |


Break-even is right after call 2. From call 3 on, you're saving ~$0.057
per call. Across 10 QA runs in a development session, you save ~$0.50
just on the cached prefix. Across a year of shipping a weekly issue plus
dev iteration, this is dollars-to-tens-of-dollars per stage — and **QA
is one stage of one pipeline**. Multiply across every stage that has a
stable prefix (we cache in two places: QA and Research) and the savings
compound.

### What's actually in the cached prefix

For QA (`qa.ts:96–103`):

- **BRAND_PREAMBLE** — ~300 tokens of "you are the editor-in-chief of
Style Me Up Magazine. The brand bible follows. Treat every line as
inviolable." Stable across runs.
- **DESIGN.md** — ~21,000 tokens of brand bible. Stable until I edit it.

For Research (`research.ts:128`):

- **BRAND_PREAMBLE** — same 300 tokens.
- **First 3000 chars of DESIGN.md** — only the parts the research stage
needs (voice + bans). Research doesn't need photography rules. Smaller
prefix = faster cache hit, less cost.

**Why two different prefixes?** Each cache is keyed by its own content
hash. QA's full DESIGN.md and Research's first-3000-chars are **two
separate cache entries**, computed and billed independently. That's
fine — they each amortize across many calls within the hour.

### Proof it worked

The Anthropic API response includes a `usage` object on every call.
Three fields that matter:

```
input_tokens:               // new bytes (not cached)
cache_creation_input_tokens: // bytes written to cache this call
cache_read_input_tokens:    // bytes read from cache this call
```

In `research.ts:144–151`, we log this on every research call:

```
[research/search] ~$0.247 | cached 18234 read · 0 write | ...
```

That `read 18234` is the proof the cache hit. If you ever see
`read 0 · write 18234` on call N where N > 1, the cache invalidated
silently — see "What silently breaks it" below.

### What silently breaks it

The cache is keyed by the **exact byte sequence** of the prefix. Anything
that changes those bytes invalidates the cache for the rest of the hour.
Things that have bitten us or could:

- **A timestamp in the prefix**. `\`Current run started at {Date.now()}`
in your system prompt = guaranteed cache miss every call.
- **A run ID, request ID, or user ID** in the cached portion. Don't put
per-request data above the cache control marker — put it *after*.
- **Whitespace drift** from a code formatter or a copy-paste with a
trailing space. The fix in this repo: load DESIGN.md from disk via
`readFileSync` (`src/lib/context.ts`), don't rebuild the string.
- **A different model**. Caches are per-model. Switching from
`claude-sonnet-4-6` to `claude-haiku-4-5` voids the cache.
- **Editing DESIGN.md.** Any edit changes the bytes. New cache write on
the next call. This is expected — but if you're iterating on DESIGN.md
during a dev session, you'll pay the 1.25× write each iteration.
- **TTL expiry.** Default ephemeral TTL is 5 minutes; we set `'1h'`
explicitly. If your gap between calls exceeds the TTL, it's a cache
miss + new write.

### The follow-up that catches people

**Q: "If you're sending the full payload either way, isn't this just an
Anthropic accounting trick? Where's the actual win — bandwidth?
Latency?"**

A: It's not just billing. There's a real latency win too. The server
skips the tokenization and the prefill (computing attention over the
cached tokens). On a 21K-token prefix, that's hundreds of milliseconds
saved per call — measurable in our logs. Bandwidth, you're right, is
not the win; the bytes still travel. The wins are (1) tokens-billed at
10% on the cached portion, (2) prefill compute skipped, which shows up
as faster time-to-first-token. The billing is the headline because it's
predictable and reportable; the latency is the secondary benefit.

**Q: "Why ephemeral and not the long-lived cached prompts beta?"**

A: Long-lived needs a fixed cache ID and explicit management. Ephemeral
is keyed by content hash — zero infrastructure on our side, automatic
eviction, works the moment we add `cacheControl`. For a weekly pipeline
where the cached content (DESIGN.md) edits occasionally, ephemeral fits.
If we shipped a real-time consumer feature with the same prefix called
1000×/sec, long-lived starts to make sense.

---

## Principle 2 · Anti-hallucination via grounding

**In plain English.** The model isn't allowed to write from memory — it
has to search the web first and write only from what it found, with
links. Then a second model call re-reads the draft and checks every
claim against those links. Anything that doesn't trace back gets the
draft sent back for a rewrite. Open-book exam, then a fact-checker.

### What it is — one sentence

Hallucinations are eliminated at the source by forcing the LLM to write
**from cited evidence** rather than from training-time memory, and
verified at the gate by a second LLM call whose only job is to check
the first one's work against ground truth.

### Why we needed it in the-edit

The Magazine issue is a **public-facing editorial product**. A
hallucinated designer attribution ("Hedi Slimane's new Lacoste line")
in a public-facing magazine isn't a developer bug — it's a defamation
risk and a brand credibility hit. We can't ship if we can't trust the
copy.

### The mechanism

Two layers, in order.

**Layer 1 — grounding at write time.** The Research executor
(`research.ts:120–167`) uses Anthropic's `web_search_20260209` tool with
`max_uses: 3`. The model must search before it writes; everything that
goes into the trend candidates must come from a search result. We then
pass the structured `TrendCandidate[]` (with URLs, publishers, snippets)
downstream to Edit, so the Edit executor (`edit.ts`) is writing from a
list of cited sources, not from memory.

**Layer 2 — verification at the QA gate.** The QA executor (`qa.ts`)
receives both the issue draft AND the source bundle. Its Zod schema
(`QAReportSchema`, `qa.ts:11–26`) requires it to emit `unsupportedClaims: string[]`. If a claim in the copy doesn't trace back to the sources, QA
flags it and returns `verdict: 'revise'`. The orchestrator (`index.ts`)
won't proceed to image generation if the verdict isn't `approve`.

### Proof it worked

We have an actual receipt: QA caught a fake "Lacoste FW26" reference in
an early-week issue. The verdict came back `revise` with
`unsupportedClaims: ['Lacoste FW26 collection — no source in research bundle']`. We re-ran Edit with the warning in context; the rewrite
removed the claim. Receipt logged in the `magazine_run_steps` table.

### What silently breaks it

- **Stale archive sources.** Our search archive (Principle 10) can serve
sources older than 7 days; if Edit writes from a source that's been
superseded ("the brand discontinued that line yesterday"), QA can't
catch it because the source still cites the original claim.
- **Source compression**. If Research summarizes a source down to "Lacoste
is doing tennis polos" and the original article said "Lacoste *might
consider* tennis polos in a hypothetical relaunch," Edit will write
declaratively and QA will pass it because the summary supports it.
Solved by passing raw snippets, not LLM-summarized versions, into QA.
- **QA prompt drift**. If someone tunes QA's prompt to be more
permissive ("don't be too strict"), hallucinations slip through. The
prompt should be locked under code review like a security policy.

### The follow-up that catches people

**Q: "Why don't you just RAG instead of using web search?"**

A: RAG works when the question's answer lives in your corpus. We're
writing about *this week's fashion trends* — by definition not in any
fixed corpus. Web search is the right grounding tool when the ground
truth is the live web. RAG would be appropriate for, say, a customer
support bot answering questions about our return policy — fixed corpus,
high recall need. Different problems, different tools.

**Q: "What about the QA model itself hallucinating?"**

A: QA is structurally limited to a boolean check against sources we
pass in — it doesn't generate copy, it judges. Its surface area for
hallucination is tiny. We also keep its temperature at 0 (deterministic)
and use the same schema-validated output (`QAReportSchema`) so any
non-conforming output fails Zod parsing and triggers a bounded retry.

---

## Principle 3 · Structured outputs with Zod + repair

**In plain English.** Instead of letting the model answer in free prose,
we hand it a form with required fields and reject anything that doesn't
fill the form correctly. If the answer comes back malformed, we try to
fix it automatically; if that fails, we ask once more with the error
attached; then we give up loudly instead of passing junk downstream.

### What it is — one sentence

Every LLM call that returns structured data is validated against a Zod
schema; if validation fails, a repair-text hook attempts to extract /
fix the JSON, and if that fails too, one strict bounded retry runs with
the error appended to the prompt.

### Why we needed it in the-edit

LLMs return JSON unreliably at the boundaries — trailing commas, missing
fields, hallucinated extra fields, prose wrapping ("Here's the JSON you
asked for: ..."). Without a schema gate, the next stage of the pipeline
chokes on malformed input. With raw `JSON.parse` and no retry, you lose
the whole run on one bad output. With Zod + repair + bounded retry, you
recover gracefully and never silently degrade.

### The mechanism

Every executor (`research`, `rank`, `edit`, `prompt`, `qa`) calls the
shared wrapper in `src/lib/object-generation.ts:10–25`:

```typescript
export async function generateObjectWithRepair<T>({
  schema, model, system, messages, ...
}: Args<T>): Promise<{ object: T; cost: CostBreakdown }> {
  return generateObject({
    model, schema, system, messages,
    experimental_repairText: async ({ text, error }) => {
      // Hook: extract JSON from prose, ask LLM to fix the error
    },
  }).catch(async (err) => {
    // Bounded strict retry once
    return generateObject({
      model, schema, system,
      messages: [...messages, { role: 'user', content: `STRICT RETRY: ${err.message}` }],
    });
  });
}
```

Three escape hatches in order:

1. **Repair on parse failure**. If the model returns prose with JSON
  inside ("Sure! Here it is: `{...}`"), the `experimental_repairText`
   hook from the Vercel AI SDK extracts the JSON via regex and re-validates.
2. **Repair on schema failure**. If the JSON parses but doesn't match
  the schema, the hook calls a second LLM (Sonnet or Haiku, depending
   on the executor) with the error message and asks it to fix. The
   repair call's cost is tracked separately so we can see how often we
   pay for it.
3. **One strict retry**. If both fail, one final retry with `STRICT
  RETRY: ` appended to the user message. After that, we
   throw — the orchestrator catches it, marks the run failed, and
   surfaces it to the dashboard.

### Proof it worked

Each call's cost breakdown (`research.ts:144–151`) includes a `repair`
line item when repair fires. In production, repair fires on roughly
1-2% of structured calls. The bounded retry fires on <0.1%. Neither has
been the cause of a failed run in steady state.

### What silently breaks it

- **Schemas that are too strict.** A `.length(3)` constraint on an array
of trend cards means a 4-card response fails. Use `.min(3).max(3)` if
you mean exactly 3, but consider whether 4 should be allowed if it's
better data. We loosened the trend card array to `.min(1).max(6)` and
normalized to 3 downstream.
- `**.refine()` predicates that depend on `Date.now()`** or other
non-deterministic values — same retry will fail again. Refinements
must be pure functions of the input.
- **Repair cost spiral**. If the repair call also fails schema, you can
loop. The wrapper guards against this with a single retry depth.

### The follow-up that catches people

**Q: "Why not use OpenAI's structured outputs / strict JSON mode
instead of a schema validator on top?"**

A: We use Anthropic. Their tool-use mechanism is the equivalent and we
do use it for the schemas; the repair + bounded retry sits on top
because tool-use can still emit values that pass JSON parsing but fail
business rules (e.g., a string that should be an enum value but isn't,
or a number that should be > 0 but is -1). Zod gives us business-rule
validation, not just JSON validation. The two layers compose.

---

## Principle 4 · Eval gate — the QA verdict pattern

**In plain English.** Before we spend $1.40 generating 28 images for a
draft, a cheap 2-cent model call grades the draft against the brand
rulebook and answers exactly one of three ways: approve, revise, or
reject. The expensive step only runs on "approve." A senior editor
with a checklist, standing between the writer and the printing press.

### What it is — one sentence

A second LLM call evaluates the first LLM's output against a fixed
rubric before we commit to expensive downstream work (here: $1.40 of
image generation), and returns one of three verdicts the orchestrator
can branch on.

### Why we needed it in the-edit

Image generation is the single most expensive stage in the pipeline.
Generating 28 images on a draft that contains a banned headline pattern
or a hallucinated claim wastes ~$1.40 and time. The eval gate is the
cheap pre-flight check before we light the expensive engine.

### The mechanism

QA (`qa.ts:38–131`) takes the issue draft + the prompt suite + the
source bundle, and emits a `QAReport` with a `verdict` enum:

```typescript
verdict: z.enum(['approve', 'revise', 'reject']),
checksPassed: {
  vogueTest: boolean,
  noBannedLanguage: boolean,
  claimsGrounded: boolean,
  assetCompliance: boolean,
  accessibility: boolean,
  budgetWithinCap: boolean,
},
failuresFound: string[],
revisionRequirements: Array<{ section, issue, requirement }>,
```

The orchestrator branches on the verdict:

- `approve` → continue to the human approval gate, then imagine.
- `revise` → re-run Edit with `revisionRequirements` injected as
warnings; QA again.
- `reject` → abort the run, log the reason, surface to dashboard.

Two policy notes (`qa.ts:64–76`):

- QA is told to only fail on **hard ship blockers** (incomplete copy,
bans, unsupported claims, missing alt text, budget overrun). Subjective
polish ("the headline could be punchier") is *not* a fail.
- The Vogue test is the editorial standard ("would this run in Vogue?")
— yes/no, not 1-10. Boolean rubrics are easier for the model to apply
consistently than scalar ones.

### Proof it worked

We caught the Lacoste hallucination (Principle 2). We caught a flat-lay
composition in a prompt (banned by DESIGN.md §8). We caught a headline
that didn't match any of the four allowed patterns from DESIGN.md §5.5.
Each catch is a `revise` verdict with `revisionRequirements`. The
revised draft passes on the second pass in ~90% of cases. The other
~10% either succeed on the third pass or are rejected.

### What silently breaks it

- **QA prompt drift toward leniency**. Already covered in Principle 2.
- **Schema escape hatches**. If you add an "uncertain" verdict, models
will use it as a hedge. We deliberately have only three: approve /
revise / reject. No middle.
- **QA running before all the inputs are available**. If you call QA
on the issue draft alone, it can't check claims-grounded because it
doesn't have the sources. We pass both at once.

### The follow-up that catches people

**Q: "Isn't this just LLM-as-judge with extra steps? Those have known
bias problems."**

A: Two replies. First: LLM-as-judge is *exactly* what this is, and
yes, judge bias is real. The bias we care about is the model being too
lenient on its own kind of output (Claude judging Claude). We mitigate
by (a) using the same model with the same system prompt — bias is
constant, which makes the rubric repeatable; (b) using boolean checks
against an external rubric (DESIGN.md), not subjective scoring; (c)
keeping the human approval gate downstream so the human is the final
judge for anything the LLM judge waves through. Second: the bias
problem matters most when you're comparing LLMs to each other. Here,
QA is comparing one LLM's output to a *document*. The document is the
ground truth, not the model.

---

## Principle 5 · Cost caps — the three-axis hierarchy

**In plain English.** Three separate spending limits — one for text, one
for web searches, one for images — instead of one big budget. Separate
tabs for food, wine, and dessert: if someone orders a $150 bottle, the
wine tab cuts them off but dinner still gets served. One shared budget
would let any single axis quietly drain the others.

### What it is — one sentence

Three independent cost caps (text generation, web search, image
generation) gate the pipeline at different stages so a runaway in one
axis doesn't drain budget on the others.

### Why we needed it in the-edit

LLM costs scale unpredictably with input. Web search has per-query
overage charges separate from token costs. Image gen has per-image
flat costs. One global cap would let one axis steal from the others —
e.g., a long research session could exhaust the cap and leave nothing
for image gen, but image gen is what produces shippable assets.
Separate caps let each axis fail independently.

### The mechanism

`src/lib/cost.ts` exposes three pairs of `record`* / `exceeded`*
functions:

```typescript
recordCost(stage, costUsd)            // model tokens + repair tokens
exceededHardCap()                     // total > $4.00 → throw

recordWebSearchCost(queryCount)       // queries × $0.01
exceededWebSearchCap()                // > $0.05 → research salvages

recordImagineCost(model, count)       // Gemini per-image cost
exceededImagineCap()                  // > $2.50 → imagine stops mid-run
```

Each executor checks the relevant `exceeded*` before paying for the
next unit of work. The hard cap (`$4.00`, `cost.ts:19`) is the only
one that throws — the soft caps (web search, imagine) call into the
salvage pattern (Principle 6) instead.

### Proof it worked

`magazine_run_steps` table logs `estimated_cost_usd` per stage. A
healthy run looks like:

```
research/search: $0.247 (3 queries, $0.03 web search)
research/structure: $0.027
rank: $0.025
edit: $0.031
prompt: $0.040
qa: $0.020 (cache read)
imagine: $1.42 (2 covers + 5 cards × 4 variants)
publish: $0.000
total: ~$1.81
```

A weekly average from the last 6 issues sits at $1.20–$1.60.

### What silently breaks it

- **Forgetting to seed prior cost on resume**. If the imagine script is
re-run separately from draft (which it is — `npm run imagine` is its
own entry point), the hard cap needs to know what draft already
spent. We added `loadPriorCost()` (`cost.ts:123–142`) that queries
`magazine_run_steps` for the run and seeds the in-memory totals
before any new spend.
- **Counting cache write as a normal token charge**. Cache writes
cost 1.25× — if you bill them as 1.0× in your tracker, you
underestimate. We use the actual multiplier (`research.ts:150`).

### The follow-up that catches people

**Q: "Why $4.00 hard cap when the steady state is $1.20? That's 3×
headroom — isn't that wasteful?"**

A: The cap is for the *worst* run, not the average. Three failure
modes can blow past $1.20: (1) the Pro image model is overloaded and
every Pro call retries before falling back to Flash, tripling the
imagine spend; (2) QA returns revise three times in a row, tripling
the edit + qa spend; (3) repair fires on every structured call,
adding 30-40% to text costs. Stacking two of those puts you at $3+
without anything going *wrong* — just unlucky. The cap catches the
genuinely runaway case (a bug in our orchestrator looping infinitely)
without false-positive killing legitimate retries.

---

## Principle 6 · Salvage-on-cap pattern

**In plain English.** When the budget runs out mid-run, don't throw away
the work already paid for — stop adding new work and ship what's in the
cart. Out of money at the cheese counter? Skip the cheese, check out
with the groceries you have. You only abandon the cart if it's
genuinely empty.

### What it is — one sentence

When a soft cap is exceeded mid-run, the executor **stops doing more
work** but keeps and returns what it's already gathered, so the
pipeline can continue with partial-but-useful data instead of failing
the whole run.

### Why we needed it in the-edit

Mid-run failure is catastrophic — we lose all the cost already spent.
Mid-run *graceful degradation* keeps the run shippable on a smaller
result set.

### The mechanism

Two examples in the repo.

**Research** (`research.ts:243–254`). If `exceededWebSearchCap()` returns
true between search rounds, we log a warning and stop querying. We
continue to structuring with whatever sources we have. We only throw
if `sources.length === 0 && capExceeded` — i.e., zero results AND no
budget to keep trying.

**Imagine** (`imagine.ts:252–258`). If `exceededImagineCap()` returns
true between slots, we stop generating new slots but keep the variants
already uploaded to `magazine_image_variants`. The run is publishable
on partial assets — the pick UI just shows fewer choices per missing
slot, and Pick is allowed to publish with `n - 1` slots if the missing
one is a curator (curators are optional). Hard requirement: at least
the cover and 3 trend slots must be filled.

### Proof it worked

In the change log: 2026-05-08, the search cap fired on a fresh-trend
run that ran 5 queries before hitting cap. We salvaged with 4 fresh
sources + 11 archive sources, structured successfully, and published.
The alternative was losing the whole run and $0.27 of spend.

### What silently breaks it

- **Salvaging zero results.** If salvage returns an empty array, the
next stage will fail differently. The guard is "salvage if you can,
throw if you can't" — never silently return empty.
- **Salvage masking a real bug**. If the cap fires every run, you have
a bug, not a budget issue. We log every salvage event so they're
visible in production review.

### The follow-up that catches people

**Q: "Why not just raise the cap?"**

A: Caps are policy, not just safety. Raising the cap to never fire
removes the signal that we're spending more than designed. The
salvage pattern preserves the signal (the log entry) while not
losing the run. Cap + salvage is the both-and.

---

## Principle 7 · Retry + exponential backoff

**In plain English.** When a call fails because the other side is busy,
wait and try again — and wait twice as long each time (3s, 6s, 12s) so
the struggling service gets room to recover. Like calling someone
who's busy: you don't redial every second, and after three tries you
use the backup number (the cheaper model).

### What it is — one sentence

Transient failures (network, provider overload, rate limit) retry
with increasing delays so we don't hammer the failing dependency and
do let it recover.

### Why we needed it in the-edit

Two specific places it bit us: (1) Gemini Pro overload returning 503,
(2) Supabase storage upload returning fetch failed under load.
Both are transient; both fix themselves within seconds; both will
fail forever if you don't retry.

### The mechanism

**Gemini gen retry** (`basics.ts:319–346`, replicated in
`imagine.ts:173–182`):

```typescript
for (const tier of order) {           // ['pro', 'flash'] or ['flash']
  for (let attempt = 0; attempt < 3; attempt++) {
    try { return await ai.models.generateContent(...) }
    catch (e) {
      const overloaded = msg.includes('503') || msg.includes('UNAVAILABLE');
      if (overloaded && attempt < 2) {
        await sleep(Math.pow(2, attempt) * 3000); // 3s, 6s, 12s
        continue;
      }
      if (overloaded && tier === 'pro') break;  // fall to flash
      throw e;
    }
  }
}
```

Three attempts at the requested tier with 3s/6s/12s backoff, then
fall through to the cheaper tier (Principle 8). Total wait before
falling through: ~21 seconds. Survives every 503 we've seen.

**Storage upload retry** (`imagine.ts:186–208`): 3 attempts at
[1s, 4s, 16s] for storage uploads after generation. Different cadence
because storage failures are usually quicker to recover (regional
S3-style transient blips, not provider overload).

### Proof it worked

Wardrobe basics run: 23 of 24 succeeded; the 24th was the leather
jacket that fell back to Flash after Pro 503'd three times. Logged
as `↻ pro overloaded retrying in 3000ms → 6000ms → 12000ms → fall to flash`. The image generated successfully on Flash. Net result: one
slightly-cheaper image, zero lost runs.

### What silently breaks it

- **No upper bound on attempts.** Infinite retry on a permanent
failure (auth error, malformed request) burns time and money. We
cap at 3 per tier.
- **Retrying non-idempotent operations**. Re-running a paid
generation that succeeded but the response got lost = double-charge.
We accept this small risk because Gemini's idempotency window is
too short to rely on; the alternative is dropping the image
entirely.

### The follow-up that catches people

**Q: "Why exponential and not constant?"**

A: Constant backoff (every 5 seconds) keeps QPS high against a
struggling provider, which makes their recovery slower. Exponential
backoff gives the provider room to breathe. The cost to us is
slightly more latency on individual calls; the benefit is the
provider recovers faster and our overall success rate goes up.

---

## Principle 8 · Hybrid model routing — Pro for hero, Flash for cards

**In plain English.** The cover image — the first thing a user sees —
gets the expensive model ($0.10/image). The small supporting cards get
the cheap one ($0.039). Head chef plates the entree; line cooks do the
sides. Same issue costs $1.58 instead of $2.80 and nobody can tell
where we saved.

### What it is — one sentence

Different parts of a single output have different quality requirements,
so we route them to different model tiers and pay the premium price only
where the user will notice.

### Why we needed it in the-edit

A magazine issue has one cover (the front page, the first thing the user
sees) and ~6 cards (trends + curator rotations, the inside spreads).
The cover sets the brand impression; the cards support it. Gemini Pro
costs $0.10/image; Flash costs $0.039 — a 2.5× ratio. Spending Pro on
cards wastes 60% of the imagine budget on assets the user spends
seconds on instead of dozens.

### The mechanism

`imagine.ts:18–22` declares the routing:

```typescript
const MODEL_BY_SLOT_PREFIX: Array<[string, string]> = [
  ['cover/',   'gemini-3-pro-image-preview'],
  ['trend/',   'gemini-2.5-flash-image'],
  ['curator/', 'gemini-2.5-flash-image'],
];
```

Per-slot model selection. Each variant in a slot uses the model for
that slot. Costs are recorded per-image (`imagine.ts:297`) so we can
see the routing distribution after the fact.

### Proof it worked

A typical issue's imagine cost breakdown:

- 2 cover slots × 4 variants × $0.10 = $0.80
- 5 card slots × 4 variants × $0.039 = $0.78
- **Total: $1.58**

If we used Pro for everything: 28 × $0.10 = $2.80. **44% savings**
with no quality drop on the surfaces that matter. If we used Flash
for everything: 28 × $0.039 = $1.09 — but the cover would look like
a card, and the brand impression on issue open would be weaker.

### What silently breaks it

- **Forgetting to set the prefix correctly**. If a new slot type ships
without an entry in `MODEL_BY_SLOT_PREFIX`, it defaults to whatever
the last-matched prefix returned, which can be wrong. Better to throw
on unknown slot type.
- **Pro fallback to Flash invalidating the routing intent.** If Pro is
overloaded and the cover falls back to Flash (Principle 7), the cover
isn't Pro anymore. The fix is to surface the fallback in the variant
picker UI so the human can choose to retry the cover at Pro before
publishing.

### The follow-up that catches people

**Q: "Why not have the model decide which model to use per call?"**

A: That's adding an LLM call to route an LLM call. The routing logic
here is `if slot starts with 'cover/' then pro`. That's six lines of
code and zero variability. An LLM-based router would add cost, add
latency, add a failure mode, and produce the same answer 99% of the
time. The 1% it produces a different answer is the 1% we don't want
— a wrong model on a hero asset. Static routing is correct when the
rule is stable.

---

## Principle 9 · Deterministic orchestration over autonomous agents

**In plain English.** Our code decides the order of steps (research,
rank, edit, QA, images, publish) — the model never picks what to do
next. A recipe, not a chef improvising. Because the steps are the same
every week, a recipe gives us the same cost, the same shape, and a
named place to look when something breaks. Improvisation is for tasks
where you *can't* know the steps in advance.

### What it is — one sentence

The pipeline is a **fixed sequence of named stages** with human
approval gates in the middle, not an autonomous agent that decides
what to do next from a tool buffet.

### Why we needed it in the-edit

We knew the steps. Research → Rank → Edit → Prompt → QA → Imagine →
Pick → Publish. Every issue follows the same path. Letting an agent
"decide what to do next" would add tool-call overhead, increase
variability, and make debugging harder (every run has a different
shape).

### The mechanism

`src/orchestrator/index.ts` is a flat sequencer. Each stage is a
named function (`runResearch`, `runRank`, `runEdit`, ...). The
orchestrator calls them in order. Two human approval gates
interrupt: one after Rank (approve the winning trend) and one after
QA (approve the issue draft before paying for images). Each stage
writes its output to the `magazine_run_steps` table before returning,
so any stage can be resumed from disk without re-running prior
stages.

What we're *not* doing:

- No LLM-as-orchestrator deciding "should I research again or move
to rank?" That decision is in our code.
- No tool loop where the model picks from a buffet. Tools are
scoped per stage (Research has web search; nothing else does).
- No recursive agent calls. The pipeline is acyclic.

### Proof it worked

Every run looks the same in the database. Every cost number is
predictable within ±20%. Every failure points to one named stage,
which means "the bug is in `edit.ts`" not "the bug is somewhere in
the agent's chain-of-thought." When a hiring manager asks "how do
you debug an issue in production," the answer is "open the run in
the dashboard, see which stage failed, read its input/output rows."

### What silently breaks it

- **Hidden side effects in a stage**. If `runEdit` writes to a
different table than its declared output, replay breaks. We keep
side effects in `runPublish` and only there.
- **Stages that secretly depend on each other through global state.**
We pass everything explicitly through the run record.

### The follow-up that catches people

**Q: "When would you move to autonomous agents?"**

A: When the path can't be enumerated upfront. Customer support
triage is a good fit — the next step depends on the ticket. So is
a coding agent — the next file to read depends on what the first
file said. Magazine publishing isn't that shape. The steps are
known. Autonomy where it's needed; determinism where it's possible.
The wrong-shaped tool is more expensive in both directions —
deterministic systems built with agents are slow and flaky;
autonomous problems built with workflows are brittle.

---

## Principle 10 · Search archive — cross-run memory as cheap RAG

**In plain English.** Every web search result we ever pay for gets filed
in a database with keyword tags and a date. Next week, before searching
again, we check the filing cabinet: 15+ fresh articles about "denim"
from the last 7 days? Skip the search, write from the files. That one
habit cut steady-state issue cost by 25% — we stopped re-buying
information we already owned.

### What it is — one sentence

Every web search result is stored in a `magazine_search_archive` table
indexed by trend keywords, and the next run's Research stage checks
the archive first; if ≥15 fresh sources match, it skips web search
entirely.

### Why we needed it in the-edit

Web search is the most expensive recurring cost in Research ($0.03–$0.05
per run in query fees, plus token cost on returned snippets). The same
trend ("denim" / "loafers") often comes up multiple times across issues.
Re-searching is wasteful when last week's sources are still fresh.

### The mechanism

`src/lib/archive.ts`:

- **Storage**: `magazine_search_archive` table, primary key on `url`,
with `trend_keywords text[]`, `last_seen_at timestamptz`,
`source_run_ids text[]`, `raw_snippet text`. GIN index on
`trend_keywords` for fast keyword overlap queries.
- **Lookup** (`findFreshSources()`, `archive.ts:78–96`):
  ```sql
  select ... from magazine_search_archive
  where trend_keywords && $1   -- array overlap
    and last_seen_at >= now() - interval '7 days'
  order by last_seen_at desc
  limit 30
  ```
- **Skip threshold**: `ARCHIVE_MIN_SOURCES = 15` (`research.ts:40`).
If `findFreshSources()` returns ≥15, Research skips web search
entirely and builds the trend narrative from archive snippets.
- **Upsert** (`archiveSources()`, `archive.ts:18–73`): every new
search result is merged into the archive — `last_seen_at` refreshed
to now, `trend_keywords` and `source_run_ids` arrays merged via
Set dedup.

### Proof it worked

Cost-per-run, before vs after archive:

- Week 1 (fresh trend, no archive hit): **$1.60** (research $0.27)
- Week 2+ (archive hit, skip search): **$1.20** (research $0.05)

That's a **25% reduction in steady-state cost** for free — the archive
costs nothing to write (we'd be making the web search calls anyway)
and pays back on every subsequent run on the same trend keywords.

### What silently breaks it

- **Trend keywords too narrow.** If "denim" and "raw-denim" don't both
exist as keywords on the archive rows, you miss hits. We standardize
via a small normalizer (lowercase, hyphen-collapse) before storing.
- **Stale sources outliving relevance.** A 6-day-old article about
"fall trends" may be relevant; a 6-day-old article about "today's
drop" is not. The 7-day window is a heuristic. We accept the
occasional stale source as the trade for the cost saving.
- **Archive corruption from a buggy upsert** (e.g., overwriting
trend_keywords instead of merging). We use Postgres array operators
(`||` for concat, `array_agg(distinct ...)` for dedup) so the merge
is atomic.

### The follow-up that catches people

**Q: "Why not vector search? You're calling this RAG."**

A: Vector search would be overkill. Our query is "any article about
denim from the last 7 days." That's a keyword + recency filter, not
a semantic similarity match. Vector adds an embedding step (cost),
a vector store (infra), and similarity thresholds (tuning). Keyword

- GIN index on Postgres is one table, one index, and runs in
milliseconds. RAG is a *pattern* — retrieve, then augment generation
— not specifically vector search. Our retrieve is keyword; our
augment is "stuff the snippets into the prompt." Same pattern,
cheaper implementation.

---

## Principle 11 · Multimodal generation strategy

**In plain English.** Words and pictures come from different providers
with different prices and different ways of failing, so we budget them
separately, gate them separately, and fix them differently. Text is
~$0.20 per issue; images are ~$1.40 — and we check the image *prompts*
against the brand bans while they're still cheap text, before paying
image prices to find out.

### What it is — one sentence

Text and image generation are different models with different cost
structures and different failure modes, so we treat them as separate
budgets and separate quality gates rather than one unified
"generation" budget.

### Why we needed it in the-edit

Conflating text and image costs hides the real distribution. Text is
roughly $0.20 per issue; image is roughly $1.40. Treating them as
one number means a text-side cost spike (long QA prompt loop) and an
image-side spike (Pro fallback storm) look the same to the budget
guard. They have different causes and different fixes.

### The mechanism

- **Text** (Research, Rank, Edit, Prompt, QA) uses Anthropic Claude
Sonnet 4.6 via the Vercel AI SDK. Cost tracked through
`recordCost()`.
- **Image** uses Google Gemini directly via the `@google/genai`
SDK. Cost tracked through `recordImagineCost()`. Routing rules
(Principle 8) live separately from text routing.
- **Prompt-to-image handoff** (`prompt.ts`): the text-stage outputs
*generation prompts* (Nano Banana for stills, Kling for motion).
These prompts are validated against the banned-token list
(`prompt.ts:12–25`) BEFORE they reach the image model, so we don't
pay $0.10 to generate a flat-lay that DESIGN.md §8 bans.
- **Image QA happens at Pick time, not in the QA executor**. QA
validates the prompts; the human picker validates the actual
images. Splitting the validation across stages keeps QA cheap
(no image input tokens) and pushes the visual judgment to the
human who's better at it.

### Proof it worked

Two-axis cost reporting in the dashboard:

```
Issue v45 — total $1.34
  Text:  $0.21   (research 0.05 / rank 0.03 / edit 0.03 / prompt 0.04 / qa 0.06)
  Image: $1.13   (28 variants, 8 cover @ Pro / 20 card @ Flash)
```

When the imagine number spikes 30% one week, we know to investigate
imagine specifically — not waste time looking at text spend.

### What silently breaks it

- **Treating image-gen failures the same as text failures**. Image
failures are usually "model overloaded, try again" — handled by
Principle 7. Text failures are usually "schema invalid" — handled
by Principle 3. Different remediation paths.
- **Prompt-to-image drift**. If the text-stage starts emitting
prompts the image model interprets badly (e.g., adjective overload
causing the model to ignore the noun), images degrade even though
text-stage is fine. We monitor this by sampling images per run.

### The follow-up that catches people

**Q: "What about future multimodal models that take text + image as
input and output both — does this architecture still make sense?"**

A: Yes, because the SEPARATION of concerns isn't about the model, it's
about the budget axis and the failure mode. A combined model would
still have an image-token cost and a text-token cost on the input
side, and an output cost split between text and image tokens. The
billing axes don't go away because the model is unified. The
architecture stays; the binding to two providers becomes a binding to
one. (We'd save the prompt-to-image handoff stage, which would be
nice — one less integration boundary.)

---

## Principle 12 · Streaming as a latency / timeout mitigation

**In plain English.** Our research calls take 90 seconds, and every
proxy between us and Anthropic kills connections that look idle for 30.
Streaming sends the answer as a steady drip of small chunks instead of
one blob at the end, so the line never looks dead. The model isn't any
faster — the connection just survives. One line of code, timeout rate
went from 15% to zero.

### What it is — one sentence

When a model call's expected duration approaches the HTTP timeout
window, switching from `messages.create()` to `messages.stream()`
keeps the connection alive via chunked transfer encoding so the
client doesn't drop before the response completes.

### Why we needed it in the-edit

The Research executor on a fresh trend can run for 90+ seconds (web
search × 3 + structuring). Vercel serverless functions, Node's default
`fetch`, and most reverse proxies have idle timeouts in the 30–60
second range. Without streaming, the connection drops mid-call, the
client sees `APIConnectionTimeoutError`, and we lose the work — but
the model continues running on Anthropic's side, so we pay for tokens
we never get to use.

### The mechanism

Switched the Research call from:

```typescript
const response = await anthropic.messages.create({ ... });
```

to:

```typescript
const stream = anthropic.messages.stream({ ... });
const response = await stream.finalMessage();
```

Both return the same shape (`Message`). The difference is on the wire:
`stream` opens a Server-Sent Events connection, the server sends
periodic event chunks during generation, and the client doesn't see
idle time. `finalMessage()` resolves once the stream completes and
gives you the assembled message + usage object — same as `create()`.

No other code changed. Same prompt, same cost, same response. The
streaming itself doesn't reduce the work — the model still takes 90
seconds. It just keeps the pipe open.

### Proof it worked

Before: ~15% of Research calls on fresh trends timed out at ~30s.
After: 0% timeouts. Tokens billed unchanged. Wallclock time per call
unchanged. The change was free.

### What silently breaks it

- **Buffered proxies that don't honor SSE**. If you put a buffering
proxy in front of your streaming endpoint (CloudFront with the wrong
config, some load balancers), the proxy holds the chunks and the
client still times out. We host Anthropic calls directly from
serverless, no intermediary.
- **Error handling on stream events**. Streaming errors arrive as
events, not exceptions. The Vercel AI SDK abstracts this; raw SDK
use needs explicit `stream.on('error', ...)` handlers.

### The follow-up that catches people

**Q: "Why not just raise the timeout?"**

A: We don't own all the timeouts in the chain. Vercel's serverless
plan caps function duration at 10s on Hobby, 60s on Pro. The HTTP
timeout in `fetch` is 300s by default but the proxy in between might
be 30s. Streaming routes around the chain because chunked transfer is
"the connection is alive" by definition — every proxy sees traffic
and resets its idle timer. Raising specific timeouts is whack-a-mole;
streaming is the architectural fix.

---

## Appendix A · Cross-reference to existing learning docs

`AI_PM_INTERVIEW_QA.md` already covers most of these at a shallower
depth. Use this doc to *understand*; use that doc to *answer briefly*.
The cross-walk:


| Principle (this doc)            | AI_PM_INTERVIEW_QA.md | Depth there           |
| ------------------------------- | --------------------- | --------------------- |
| 1 · Prompt caching              | Q1                    | 4/5                   |
| 2 · Grounding                   | Q3, Q7                | 4/5                   |
| 3 · Structured outputs          | Q5                    | 3/5                   |
| 4 · Eval gate                   | Q9                    | 3/5                   |
| 5 · Cost caps                   | Q6, Q11               | 4/5                   |
| 6 · Salvage-on-cap              | Q11                   | 3/5 (named, not deep) |
| 7 · Retry + fallback            | Q27                   | 4/5                   |
| 8 · Hybrid routing              | Q8, Q19               | 4/5                   |
| 9 · Deterministic orchestration | Q2                    | 3/5                   |
| 10 · Search archive             | Q4                    | 2/5 (planned framing) |
| 11 · Multimodal                 | not covered           | gap                   |
| 12 · Streaming                  | Q6 (mention)          | 2/5 (mention only)    |


When a hiring manager probes any of these, read the existing Q first
(the 60-second answer), then come here for the mechanism if they push.

## Appendix B · Glossary

- **Cached prefix.** The stable bytes at the front of a request that
the provider can re-use across calls. Marked with `cache_control` on
Anthropic.
- **Ephemeral cache.** Anthropic's auto-evicting cache with a TTL
(default 5min; we use 1h). Keyed by content hash. No infrastructure
to manage.
- **Repair-text hook.** Vercel AI SDK feature that runs a callback
when `generateObject` fails to parse the model's output. The
callback can extract or rewrite the text and re-attempt validation.
- **Salvage-on-cap.** A pattern where a soft cap halts new work but
returns partial results, so the next stage gets useful input
instead of failing.
- **Slot.** A single asset position in an issue (e.g., `cover/01`,
`trend/02`). Each slot holds 4 image variants; pick selects one.
- **Verdict.** The enum field on a QA report (`approve` / `revise` /
`reject`) that the orchestrator branches on.
- **Vogue test.** "Would this run in Vogue?" boolean check. Used in
QA and in DESIGN.md §5.5 for every line of copy.

