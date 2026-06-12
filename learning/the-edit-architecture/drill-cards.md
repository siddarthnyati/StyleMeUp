# the-edit — interview drill cards

For live answering, not reading.

Each card: **30-second answer** (what you say when they ask cold), **2-minute
answer** (what you say when they want detail), **the follow-up they'll
probably ask + how you answer it**, and **the war story** (the one
concrete moment that makes the answer real).

The 30-second answer is the bar. If you can't deliver it under a minute
without notes, drill it again. The 2-minute answer is what you reach for
when they nod and say "tell me more."

For mechanism-level depth, fall back to `principles.md`. For the visual,
share `index.html`.

---

## Card 1 · Prompt caching

**30-second answer.** Prompt caching stores the stable prefix of an LLM
request on the provider's side, keyed by a content hash. The next call
within the TTL pays one-tenth the input price on the cached portion. In
the-edit, we cache the full DESIGN.md — about 21K tokens — on every QA
call. First call costs 1.25× input price as a cache write; every call
after, for an hour, costs 0.1×. Net: 90% off on the cached portion from
the second call onward.

**2-minute answer.** Add the basics, then go specific. The cached prefix
is bytes — exact byte sequence. We mark it on the system block with
`cache_control: { type: 'ephemeral', ttl: '1h' }`. The tokens still
travel in the request payload; what changes is server-side: Anthropic
recognizes the prefix hash, skips tokenizing and prefilling it, charges
us 10% of input price for "reading" the cache. Cost math: 21K tokens at
$3 per million is $0.063 normally; cache write is $0.079; cache reads
are $0.0063. Break-even after call two. We've cached in two places — QA
(full DESIGN.md) and Research (first 3K chars of DESIGN.md + a brand
preamble). The proof it's working is in the response's `usage` object:
`cache_read_input_tokens` is non-zero. Anything that changes a byte in
the prefix voids the cache silently — timestamps, run IDs, whitespace
drift, even a different model.

**The follow-up: "If you're still sending the tokens, where's the actual
win — bandwidth?"** Not bandwidth, no. The wins are billing — 90% off on
the cached portion — and latency — server skips prefill compute, so
time-to-first-token drops by a few hundred milliseconds on a 21K-token
prefix. The billing is the headline because it's predictable and
reportable; latency is the secondary benefit.

**War story.** Early on I had `Date.now()` in the system prompt for
logging. Cache read tokens were always 0 — I thought caching was broken.
Spent an afternoon staring at the response. Then realized one byte
changed every call. Moved the timestamp into a user-message metadata
field below the cache control marker. Cache read tokens jumped to 21K
on the next call. The fix was one line; the lesson was: monitor the
proof field, not the request payload.

---

## Card 2 · Anti-hallucination via grounding

**30-second answer.** Two layers. Edit writes from cited sources only —
Research pre-supplies a `TrendCandidate[]` with URLs and snippets, so
Edit has no excuse to write from training-time memory. Then QA, a
separate LLM call, verifies every claim in the draft against the source
bundle and returns `unsupportedClaims: string[]`. Anything that doesn't
trace back triggers a `revise` verdict and the run reroutes through
Edit with the warning attached. Image generation doesn't happen until
QA returns `approve`.

**2-minute answer.** Add the architecture. Research uses Anthropic's
`web_search_20260209` tool with `max_uses: 3`, so the model is forced
to search before writing. The structured `TrendCandidate[]` (Zod schema)
propagates through Rank, Edit, Prompt as the source of truth. QA gets
both the draft and the source bundle; its schema includes
`unsupportedClaims` and `claimsGrounded: boolean`, both of which feed
the verdict. The orchestrator branches on verdict — approve continues,
revise loops back, reject aborts. We deliberately don't use RAG with a
vector store because the ground truth here is "this week's fashion
news," not a fixed corpus. Web search is the right grounding tool when
the truth is live.

**The follow-up: "What if the QA model itself hallucinates?"** Its
surface area is tiny. It doesn't generate copy, it judges. We use a
Zod-validated schema with three verdict values — no "uncertain" hedge.
Temperature 0. Same model as Edit so any bias is constant and the
rubric stays consistent. And the QA prompt is locked under code review
like a security policy — we don't soften it after the fact.

**War story.** An early issue's draft cited "Hedi Slimane's new Lacoste
line." Plausible-sounding, completely made up. QA flagged it:
`unsupportedClaims: ['Hedi Slimane Lacoste line — no source in research
bundle']`. Verdict `revise`. We re-ran Edit with the warning; rewrite
removed the claim. If we'd shipped without QA, that line goes public.
That's the whole reason the gate exists.

---

## Card 3 · Structured outputs (Zod + repair)

**30-second answer.** Every LLM call that returns structured data goes
through a Zod schema. If parse fails, a repair-text hook extracts JSON
from prose or calls a second LLM to fix the error. If that fails, one
bounded strict retry with the error appended. After that, throw. In
production, repair fires on 1-2% of calls; bounded retry on under 0.1%.

**2-minute answer.** Three escape hatches in order. The wrapper is
`generateObjectWithRepair()` in `src/lib/object-generation.ts`. First
attempt uses Vercel AI SDK's `generateObject` with our schema. The
`experimental_repairText` hook fires if the model returns prose with
JSON inside — extracts via regex, re-validates. If the JSON parses but
fails schema, the hook calls another LLM with the error message and
asks it to fix; that repair call's cost is tracked separately so we see
how often we pay for it. If repair fails, one final retry with
`STRICT RETRY: <error>` appended to the user message. Then throw. We
use Anthropic's tool-use mechanism for the schema, but Zod sits on top
for business-rule validation — enum membership, value ranges, refines
that tool-use can't express.

**The follow-up: "Why Zod when Anthropic's tool-use already validates
JSON?"** Tool-use validates JSON shape. Zod validates business rules.
An enum value that should be `'approve' | 'revise' | 'reject'` can pass
JSON validation with the string `'maybe'` — tool-use wouldn't catch
that unless you specifically declared the enum in the tool schema, and
even then enforcement is best-effort. Zod's `.refine()` lets us add
predicates that aren't expressible in JSON Schema — "headline must end
in a period," "deck must be ≤ 6 words." Two layers, different jobs.

**War story.** Edit returned a valid-shaped IssueDraft with the headline
"the new wave?" — question mark. DESIGN.md §5.5 bans question-marks in
headlines. The Zod schema had a `.refine(h => !h.includes('?'))`. Schema
failure, repair hook fires, calls the repair model with the error
message, gets back "the new wave." with a period. One retry, no human
intervention, run continues. Total added cost: a few cents.

---

## Card 4 · Eval gate (QA verdict pattern)

**30-second answer.** A second LLM call evaluates the first LLM's output
against a fixed rubric before we commit to expensive downstream work.
QA in the-edit is this gate: it checks the draft + asset prompts
against the Vogue test, banned language, claims-grounded, asset
compliance, accessibility, and budget. Returns one of three verdicts.
The orchestrator branches on it. The downstream work it's protecting?
~$1.40 of image generation per issue.

**2-minute answer.** Specifics: the schema is `QAReportSchema` with a
`verdict: 'approve' | 'revise' | 'reject'`, six boolean check fields,
an array of failures found, and revision requirements (section / issue
/ requirement). Approve continues to image gen. Revise re-runs Edit
with the revision requirements injected as warnings, then QA again —
typically succeeds on pass two; about 10% need pass three; the rest
get rejected. Reject aborts the run. QA is policy-bound to fail only
on hard ship blockers — incomplete copy, bans, ungrounded claims,
missing alt text, budget overrun. Subjective polish like "headline
could be punchier" is *not* a fail. Boolean rubrics applied
consistently beat scalar 1-10 scoring because LLMs are more reliable on
booleans.

**The follow-up: "LLM-as-judge has known bias problems — same model
judging itself. How do you mitigate?"** Three ways. First, the bias we
care about is leniency, and the rubric is external (DESIGN.md), not
subjective. Second, we use boolean checks against the document, not
comparative judgments between two outputs. Third, the human approval
gate sits downstream — if QA approves something the human disagrees
with, the human catches it before publish. So bias is bounded by an
external rubric and a human backstop.

**War story.** QA's first version had a verdict enum of `approve |
revise | reject | uncertain`. The model used "uncertain" on 30% of
runs — a hedge. Removed "uncertain" from the schema. Forced the model
to commit. The "uncertain" rate became zero; revise rate went up
slightly; rejects unchanged. The schema shape teaches the model what
answers it's allowed to give.

---

## Card 5 · Cost caps (three-axis)

**30-second answer.** Three independent caps — text generation, web
search, image generation — so a runaway in one axis doesn't drain
budget on the others. Hard cap on text is $4.00, throws when exceeded.
Soft caps on web search ($0.05) and image gen ($2.50) fire the salvage
pattern instead. Steady-state cost per issue: $1.20. Worst observed:
$1.81 on a fresh trend with extra QA loops.

**2-minute answer.** Caps live in `src/lib/cost.ts`. Three pairs of
record/exceeded functions. `recordCost()` tracks total token spend
including repair token spend. `recordWebSearchCost()` separately tracks
the $0.01-per-query overage. `recordImagineCost()` tracks per-image
Gemini spend by model. Each executor checks the relevant cap before
paying for the next unit of work. The hard cap is the only one that
throws; soft caps fire salvage (Principle 6 in principles.md) so we
don't lose the run mid-flight. We also seed prior cost on script
resume — `loadPriorCost()` queries `magazine_run_steps` so a separate
`npm run imagine` knows what `npm run draft` already spent.

**The follow-up: "Why $4 hard cap on a $1.20 steady state? Isn't that
wasteful?"** The cap is for the worst run, not the average. Three
failure modes stack: Pro model overload triggering Flash fallback on
every call (triples imagine), QA returning revise three times in a row
(triples edit+qa), repair firing on every structured call (adds
30-40%). Any two stacking puts you at $3+ without anything breaking —
just unlucky. The cap catches the genuinely runaway case (a bug
looping infinitely) without false-positive killing legitimate retries.

**War story.** Hit the cap once during development — left a recursive
call in the orchestrator by accident. The hard cap threw at $4.02,
killed the run, surfaced the bug. Without the cap I'd have noticed
when I checked Anthropic billing the next day with a $40 charge.

---

## Card 6 · Salvage-on-cap

**30-second answer.** When a soft cap fires mid-run, the executor stops
doing new work but keeps and returns what it's already gathered.
Partial data is better than a failed run. Research salvages on web
search cap: stops querying, continues to structuring with the sources
it has. Imagine salvages on image cap: stops between slots, keeps
uploaded variants, lets the picker work with `n-1` slots.

**2-minute answer.** The pattern is one if/else but the discipline is
where you put the check. We check between units of work, not in the
middle. Research checks between search rounds (`research.ts:243`); not
mid-search, because a half-finished search returns no usable result.
Imagine checks between slots (`imagine.ts:252`); not mid-slot, because
a half-generated slot has variants in inconsistent states. Hard rule:
salvage if you can return something useful; throw if you can't. We
explicitly log every salvage event so they're visible in production
review — if salvage fires every run, you have a bug, not a budget
issue.

**The follow-up: "Why not just raise the cap?"** Caps are policy, not
just safety. Raising the cap to never fire removes the signal that
we're spending more than designed. The salvage pattern preserves the
signal (the log entry) while not losing the run. Cap + salvage is the
both-and.

**War story.** Fresh-trend run in week 2 of building. Ran 5 web searches
back-to-back, hit the $0.05 cap mid-stride. Salvaged with 4 fresh
sources + 11 archive sources. Structured fine. Published. Without
salvage, that's a $0.27 spend and zero result.

---

## Card 7 · Retry + exponential backoff

**30-second answer.** Transient failures retry with delays that grow.
For Gemini image gen, 3 attempts at 3s/6s/12s, then fall through to
Flash. For Supabase storage uploads, 3 attempts at 1s/4s/16s. The
specific cadences differ because Gemini overloads are slower to
recover than S3-style storage blips. The exponential part gives the
failing dependency room to breathe; constant cadence keeps the QPS
high against a struggling provider.

**2-minute answer.** The patterns live in two places. Gemini retry is
in `basics.ts:319-346` and `imagine.ts:173-182`. Storage retry is in
`imagine.ts:186-208`. Each has explicit attempt count, explicit delay
formula, explicit fall-through tier. We never retry forever — that
turns a transient failure into a budget burn. We also distinguish
overload errors (503, "UNAVAILABLE," "high demand") from genuine
errors (auth, malformed request); only overload errors retry.

**The follow-up: "Why exponential and not constant or jittered?"**
Constant keeps QPS high against a struggling provider, slowing their
recovery. Pure exponential is deterministic — synchronized clients
all retry at the same instant and create a thundering herd. We
should jitter; we currently don't. It's a known minor improvement. In
practice we're a single-tenant low-QPS client, so the herd risk is
near zero and pure exponential has been fine.

**War story.** Wardrobe basics run: 23 of 24 succeeded; the 24th was
the black leather jacket. Pro overload, three retries at 3s/6s/12s,
all 503. Fell through to Flash. Generated successfully. Logged as
`↻ pro overloaded retrying ... → fall to flash`. One slightly
cheaper image, zero lost runs. The fall-through is the safety net
when retry alone isn't enough.

---

## Card 8 · Hybrid model routing

**30-second answer.** Cover gets Gemini Pro at $0.10/image; cards get
Flash at $0.039/image. The cover is the brand-impression moment;
cards are supporting material. Routing the right cost tier to the
right surface saves 44% of the image budget versus all-Pro with no
quality drop on what matters. Per-slot rule, dead simple — six lines
of code in a prefix-match table.

**2-minute answer.** `imagine.ts:18-22` declares the routing as a
prefix table: `cover/` → Pro, `trend/` → Flash, `curator/` → Flash.
Each variant in a slot uses that slot's model. Per-image cost is
recorded so the routing distribution is visible after the fact. A
typical issue: 2 covers × 4 variants × $0.10 = $0.80; 5 cards × 4
variants × $0.039 = $0.78; total $1.58. All-Pro would be 28 × $0.10
= $2.80. The static-routing choice is deliberate — adding an LLM-
based router to pick the model adds cost, latency, and a failure
mode for the 1% case where the router picks wrong. The static rule
is right 100% of the time; the LLM-router would be right 99%. The 1%
delta is the cover-on-Flash mistake we don't want.

**The follow-up: "What happens when Pro is overloaded — does the
fallback voids the routing intent?"** Yes, technically. If Pro
overloads on the cover three times and falls through to Flash, that
cover is now Flash-quality. We mitigate by surfacing the fallback
in the picker UI — the human sees "this variant was generated with
Flash after Pro fallback" and can choose to regenerate at Pro
before publishing. Routing intent is preserved by the human.

**War story.** Wardrobe basics run had Pro overloaded for two hours
straight. Every Pro item fell through to Flash. Logged each
fallback. Total imagine cost: as expected for Flash, not Pro.
Quality on the photographed garments was good enough that we kept
them. The fallback isn't an emergency — it's a designed safety net
that quietly degrades cost when supply is constrained.

---

## Card 9 · Deterministic orchestration

**30-second answer.** The pipeline is a fixed sequence of named stages
with two human approval gates. Not an autonomous agent. Every run
looks the same in the database. Every cost number is predictable
within ±20%. When something fails, it fails at a named stage — "the
bug is in edit.ts" beats "the bug is somewhere in the agent's
chain-of-thought." Determinism is the right shape when you can
enumerate the steps upfront.

**2-minute answer.** `src/orchestrator/index.ts` is a flat sequencer.
Each stage is a named function: `runResearch`, `runRank`, `runEdit`,
`runPrompt`, `runQA`, `runImagine`, `runPick`, `runPublish`. The
orchestrator calls them in order. Two human approval gates
interrupt — one after Rank to approve the winning trend, one after
QA to approve the draft before paying for images. Each stage writes
its output to `magazine_run_steps` before returning, so any stage
can be resumed from disk without re-running the prior ones. What we
don't have: no LLM-as-orchestrator picking next step, no tool loop
where the model picks from a buffet, no recursive agent calls. Tools
are scoped per stage — Research has web search, nothing else does.

**The follow-up: "When would you move to autonomous agents?"** When
the path can't be enumerated upfront. Customer support triage —
next step depends on the ticket. Coding agents — next file to read
depends on what the first file said. Magazine publishing isn't that
shape. Steps are known. The wrong-shape tool is expensive both
directions: deterministic systems built with agents are slow and
flaky; autonomous problems built with workflows are brittle. Match
the tool to the problem.

**War story.** Early iteration had QA call back into Edit if it found
a small issue. Recursive. Worked 70% of the time; the other 30%
infinite-looped because the small issue wasn't fixable by Edit
alone. Refactored to a verdict + orchestrator-controlled re-run.
Same effective behavior, no recursion, easy to debug. The
orchestrator is the boring layer that makes the smart layers
debuggable.

---

## Card 10 · Search archive (cheap RAG)

**30-second answer.** Every web search result is stored in a
`magazine_search_archive` Postgres table indexed by trend keywords.
Next run's Research checks the archive first; if ≥15 fresh sources
exist (within 7 days) for the trend keywords, skip web search
entirely and build the narrative from cached snippets. Steady-state
issue cost dropped 25% because of this — from $1.60 fresh-trend to
$1.20 archive-hit.

**2-minute answer.** It's RAG in pattern (retrieve, then augment
generation) but not vector RAG. The retrieve is a Postgres keyword
+ recency query with a GIN index on `trend_keywords text[]`. Lookup
is `where trend_keywords && $1 and last_seen_at >= now() - '7
days'`. Cheap, fast, no embedding step, no vector store. Upsert on
every search merges new URLs with existing rows — `last_seen_at`
refreshed, keywords and run-ID arrays deduped. The threshold of 15
sources is the heuristic that says "we have enough to write without
new search." 7-day freshness is the heuristic that says "still
relevant." Both are tunable knobs.

**The follow-up: "Why not vector search? You're calling this RAG."**
Vector adds an embedding step (cost), a vector store (infra), and
similarity thresholds (tuning). Our query is "any article about
denim from the last 7 days." Keyword + recency, not semantic
similarity. RAG is a *pattern*, not specifically vector search.
Pick the retrieve mechanism that matches your retrieval question.
Ours is exact keyword; vector would be overkill.

**War story.** Week one of shipping, every issue paid the full $0.27
for fresh Research. Built the archive on week two. Week three's
issue keyword-matched on "denim" — 22 archive hits, zero web
searches, Research cost dropped to $0.05. That delta is real
dollars when you ship 52 issues a year.

---

## Card 11 · Multimodal generation

**30-second answer.** Text and image generation are different models
with different cost structures and different failure modes. We
treat them as separate budgets, separate quality gates, separate
retry strategies. Text is Claude Sonnet via Vercel AI SDK; image is
Gemini directly via `@google/genai`. The handoff is the text-stage
output of *generation prompts* — validated against banned tokens in
`prompt.ts` before they reach Gemini, so we never pay to generate
a flat-lay the brand bans.

**2-minute answer.** Two-axis cost reporting in the dashboard makes
the separation real: text spend per issue ~$0.20; image spend
~$1.40. When the imagine number spikes 30%, we know to investigate
imagine specifically — not waste time looking at text. Different
failure modes: image failures are usually "model overloaded, try
again," handled by retry+fallback. Text failures are usually
"schema invalid," handled by Zod repair. Different remediation
paths because different root causes. QA validates prompts, the
human picker validates images — splitting the visual judgment from
the eval judgment puts each in the right hands.

**The follow-up: "What about future unified multimodal models that
take text + image and output both — does this architecture survive?"**
Yes, because the separation isn't about the model, it's about the
billing axis and the failure mode. A unified model still has image-
token and text-token costs on input, and an output cost split. The
billing axes don't go away because the model is unified. The
architecture stays; the binding to two providers becomes a binding
to one. We'd save the prompt-to-image handoff stage, which would be
nice — one less integration boundary.

**War story.** First version generated 28 images on every issue
before QA gate. Drafts with banned compositions cost $1.40 of
image gen before we found out. Moved validation into `prompt.ts`
to catch banned tokens at $0.04 of text instead of $1.40 of image.
Catch errors at the cheapest stage that can see them.

---

## Card 12 · Streaming

**30-second answer.** Research calls on fresh trends take 90+ seconds.
HTTP timeouts in serverless and reverse proxies are 30-60 seconds.
Without streaming, the connection dropped at ~30s and we lost the
work while still paying for tokens. Switched from `messages.create()`
to `messages.stream()` — server-sent events keep the pipe alive.
Same cost, same response, zero timeouts. The change was one line.

**2-minute answer.** Both `.create()` and `.stream()` return the same
Message shape — `.stream().finalMessage()` resolves once the full
response arrives. The difference is on the wire: SSE chunks every
few hundred ms keep the connection visibly alive, so proxies and
serverless platforms don't kill it for idleness. Streaming doesn't
reduce the work — the model still takes 90 seconds — it just keeps
the pipe open. We're not consuming the stream incrementally
(though we could); we're using it purely for connection
persistence. Total Anthropic cost unchanged, total wallclock
unchanged, timeout rate went from ~15% to 0%.

**The follow-up: "Why not just raise the timeout?"** We don't own all
the timeouts in the chain. Vercel serverless: 10s on Hobby, 60s on
Pro. Node `fetch`: 300s default but the proxy in front might be 30s.
Raising specific timeouts is whack-a-mole; streaming routes around
the chain because chunked transfer is "the connection is alive" by
definition. Every proxy sees traffic and resets its idle timer.
Architecture > config.

**War story.** Build week 3, the deeper search rounds started timing
out at exactly 30 seconds. Looked at Vercel logs — function
duration was 28-31s, often exactly at the limit. Switched to
stream. Next run completed cleanly at 87 seconds. Zero
infrastructure change.

---

## Quick reference — the order to drill these

If you have 90 minutes total prep time:

1. **15 min:** Card 1 (prompt caching) — the one you flagged.
2. **15 min:** Card 4 (eval gate) — most-asked AI PM question by hiring
   managers right now.
3. **10 min each:** Cards 2 (grounding), 5 (cost caps), 9
   (orchestration) — the three concepts that come up in every system-
   design probe.
4. **5 min each:** Cards 3, 6, 7, 8, 10, 11, 12 — the supporting cast.

If you have 30 minutes total: drill Card 1 cold three times. Then read
Card 4 once. The rest you can reach for via `principles.md` if pushed.
