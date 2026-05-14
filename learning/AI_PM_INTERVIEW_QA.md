# AI PM Interview — Q & A with examples from `the-edit` + styleMeUp

A living doc. After every major iteration of the apps, add new questions or extend the examples in existing answers. Read top-to-bottom for ramp-up; jump by difficulty for targeted prep.

**Difficulty key:**

- 🟢 **EASY** — first-pass screen, terminology check
- 🟡 **MEDIUM** — typical AI PM round
- 🟠 **HARD** — senior AI PM, system design
- 🔴 **PRO** — staff/principal AI PM, strategy + tradeoffs

---

## 🟢 EASY

### Q1. What is prompt caching and why does it matter for cost?

Prompt caching stores the static prefix of an LLM request server-side after the first call. Subsequent calls with the same prefix read the cache at ~10% of the normal input rate (Anthropic) or skip processing entirely (some providers).

**Why it matters:** input tokens dominate cost in most agentic systems. If a system prompt is 20K tokens and gets sent on every call, you pay full price every time. Caching cuts that to 10× cheaper from the second call onward.

**Example from `the-edit`:** the QA executor loads the full `DESIGN.md` (~21K tokens) every issue. Without caching, that's $0.063 per call. With `cache_control: { type: 'ephemeral', ttl: '1h' }`, the first run writes at 1.25× ($0.079) and every subsequent QA call within the hour reads at 0.1× ($0.0063). That's a 90% reduction on QA cost from run 2 onward.

**Pro tip:** caches break on any byte change in the prefix. Don't put `Date.now()` or run IDs in the cached portion. Watch `cache_read_input_tokens` in the response — if it's 0 across repeat calls, something is invalidating silently.

---

### Q2. What's the difference between a workflow agent and a fully autonomous agent?

A **workflow agent** has its sequence of steps defined in code. The LLM is invoked at each step but doesn't decide what step comes next. Output of step N is validated, then passed deterministically to step N+1.

A **fully autonomous agent** lets the LLM choose its own actions in a loop, often via tool use. The agent decides when it's done.

**Trade-off:** workflows are predictable, debuggable, cheaper, easier to add approval gates. Autonomous agents are flexible but expensive, hard to bound, and risky in production without strict guardrails.

**Example from `the-edit`:** the entire pipeline is a workflow agent — `research → rank → edit → prompt → qa → publish`. The orchestrator code (TypeScript) decides flow, not the LLM. Each executor is a narrow LLM call with a Zod-validated output. Approval gates between steps require human input. Total per-run cost is bounded at $2 because the model never decides "let me run more searches."

**Pro tip:** start with workflow agents. Move to autonomy only when the task structure genuinely can't be predicted.

---

### Q3. What is hallucination and how do you reduce it?

Hallucination = the model confidently asserts something that isn't true. Common in LLMs because they predict plausible-sounding next tokens, not factual ones.

**Reduction techniques (in order of effectiveness):**

1. **Grounding** — give the model real source material in the prompt and instruct it to only use that.
2. **Structured outputs** — force the response shape so it can't ramble into invention.
3. **Citation requirement** — make the model cite which source backs each claim.
4. **Verification step** — after generation, a second LLM call (or rule-based check) verifies claims against the sources.
5. **Lower temperature / use deterministic settings.**

**Example from `the-edit`:** the QA executor explicitly checks for "ungrounded claims" — if the editor wrote "Six houses confirmed this for SS26" but the research output only names 3 houses, QA returns `revise` with the requirement to remove or back the claim. On a real run, QA caught fake Lacoste and Prada SS26 references that the editor invented.

**Pro tip:** never let an LLM generate content for users without a grounding step + a verification step. The Magazine pipeline has both.

---

### Q4. What is RAG?

**Retrieval-Augmented Generation** — instead of fine-tuning a model on your data, you retrieve relevant chunks at query time and inject them into the prompt. The model generates with that context.

Three pieces: an embedding model (turns text into vectors), a vector store (cheap nearest-neighbor search), and the LLM that consumes the retrieved chunks.

**Example from `the-edit`:** not yet implemented but planned for V3. The closest analog today is `magazine_search_archive` — when the research executor sees a seed trend, it queries Supabase for fresh sources matching the trend's keywords. If ≥15 sources are recent, it skips the web search entirely and feeds the archived snippets to the structuring stage. That's keyword RAG, not vector RAG, but the principle is identical.

**Pro tip:** RAG > fine-tuning for most cases. It's faster to update, easier to debug, doesn't require retraining when your data changes.

---

### Q5. What is a "structured output"?

The model returns JSON conforming to a schema you provide, validated by the API or your code. Eliminates the parsing-hell of "extract the title from this prose response."

**Example from `the-edit`:** every executor uses Vercel AI's `generateObject` with a Zod schema. The editor returns:

```ts
{
  cover: { headline: '...', deck: '...', slug: '...' },
  trendCards: [...],
  curatorRotations: [...],
}
```

The schema rejects responses that don't fit. We even added refines: `headline` must be ≤6 words, end in a period, and not contain a colon. The model can't ship a textbook-style headline because the schema literally won't accept it.

**Pro tip:** use structured outputs for ALL programmatic LLM calls. Free text is for end users; your code wants JSON.

---

## 🟡 MEDIUM

### Q6. How do you reduce LLM costs in production?

There's a hierarchy. Apply in order:

1. **Cache static prefixes.** First and biggest win.
2. **Cap the agent** — `max_uses` on tools, max iterations on agentic loops, hard cost caps with abort.
3. **Route by job** — small model for classification/routing, large model only when quality demands.
4. **Trim context** — don't send 50K tokens when 5K will do. Summarize prior turns instead of replaying them.
5. **Batch when latency allows** — Anthropic's Batch API is 50% off.
6. **Stream** — same cost, but longer max_tokens without HTTP timeouts.
7. **Move the work to your code** — anything deterministic (counting, filtering, formatting) shouldn't be done by the LLM.

**Example from `the-edit`:** we did all of these. Started at $0.97 per research call (uncapped web search). After `max_uses: 3` + caching + archive-first lookup + cross-script cap → $1.20 per full issue with 28 generated images. Hard cap at $2 prevents runaway.

**Pro tip:** measure cost per "completed user task," not per token. A workflow that uses 100K tokens but produces a real outcome is cheaper than 10K tokens that produce a discard.

---

### Q7. How do you handle hallucination in a customer-facing AI feature?

Layered defense:

1. **Ground in real data** — never let the model invent facts.
2. **Constrain output shape** — structured outputs reduce invention surface.
3. **Verify before showing** — second-pass check (rule-based or LLM) against the source data.
4. **Show confidence** — when the model is uncertain, surface it. "We couldn't verify this." beats fake certainty.
5. **Human approval gate** for high-stakes outputs.
6. **Fall back to deterministic** — if the LLM fails verification, return a safe pre-written response.

**Example from `the-edit`:** the pipeline has 4 of these. Research grounds via web search with citations. Editor outputs Zod-validated JSON. QA verifies every claim against research sources. Two human approval gates (trend winner, draft) before publish. On a real run, QA caught and blocked a draft that invented designer references — exactly what this stack is designed to do.

**Pro tip:** customer-facing AI without a verification step is a CS ticket waiting to happen. Even a $0.02 verification call pays for itself the first time it catches a wrong claim.

---

### Q8. How do you decide when to use a smaller model vs a larger one?

Rule of thumb: use the smallest model that passes your quality bar.

Decision factors:

- **Task complexity** — classification/extraction → small model. Creative writing → large.
- **Latency budget** — small models are 3-10× faster.
- **Cost** — at scale, the per-call difference compounds.
- **Eval pass rate** — run the smaller model first; if it hits ≥95% of your quality bar, use it.

**Example from `the-edit`:** we use Claude Sonnet 4.6 for everything (single-model simplicity). For images, we route by slot:

- Cover slots → Gemini 3 Pro Image ($0.10/img) — quality matters most for the hero
- Trend/curator cards → Gemini 2.5 Flash Image ($0.039/img) — good enough at 1/3 the cost

Net: $0.50 added cost for materially better covers, $0 added cost where it doesn't matter.

**Pro tip:** model routing per job is a 30% cost reduction with no quality loss. It's free money you find when you stop using the same model for everything.

---

### Q9. What are evals and why do you need them?

Evals = systematic measurement of model output quality against a labeled or rule-based standard.

**Three types:**

- **Reference-based** — compare output to a known-good reference (BLEU, ROUGE, exact match).
- **LLM-as-judge** — a separate model rates outputs on quality dimensions.
- **User signal** — click-through, thumbs-up, completion rate.

**Why you need them:** without evals you can't tell if a prompt change improved or regressed. You can't compare model versions. You can't catch silent quality drift.

**Example from `the-edit`:** the QA executor IS the eval — it loads the full DESIGN.md and checks the issue draft against bans, Vogue test, source grounding, alt text format. Returns `approve` / `revise` / `reject` with specific revision requirements. We don't have automated evals yet (V3 candidate) but the QA gate's `revise` output is itself a quality signal we track.

**Pro tip:** the cheapest eval is "did the run pass QA on first try?" Track that ratio. If it drops after a model change, the change regressed.

---

### Q10. How do you handle rate limits?

Three layers:

1. **Per-call limits** — set sensible `max_tokens`, `max_uses` on tools, timeouts.
2. **Inter-call pacing** — explicit delays between calls when you know the next one will hit a fresh window. Salvage what you have if you breach.
3. **Backoff + retry** — exponential backoff on 429s. The Anthropic SDK does this by default.

**Example from `the-edit`:** the research executor's web search call returns 200K input tokens of search results. The structuring call that follows would immediately hit the 30K-tokens-per-minute org limit. Solution: a hard 25-second wait between stages, and a "salvage on cap" pattern — if web search exceeds its dollar cap, we proceed with whatever sources were already gathered instead of throwing them away.

**Pro tip:** rate limits aren't bugs, they're the system telling you to design differently. Salvage-on-cap is more user-respectful than fail-and-retry-from-scratch.

---

## 🟠 HARD

### Q11. You're building a feature with $0.50 per generation cost. How do you decide if it's economically viable?

You need three numbers:

1. **Conversion uplift** — how much more do users pay because of this feature? (e.g., 5% higher trial→paid)
2. **Per-user generations** — how often does the average user trigger it? (e.g., 4 generations/month)
3. **LTV per user** — annual subscription value × retention multiplier (e.g., $200/year × 1.5 years avg = $300)

**Math:** marginal cost per user = generations × $0.50. If a paying user triggers it 4× per month for 18 months, that's 72 × $0.50 = $36 marginal cost. Against a $300 LTV, the feature has a 12% margin hit — fine if it produces 12%+ uplift in retention or conversion.

**Example from `the-edit`:** Magazine issue costs $1.20 to produce. If we publish weekly, that's $62/year. To justify in styleMeUp, we need it to drive at least $62 of additional LTV per user that engages with it — about 1 extra subscriber retained per 5 free users who saw it. That's testable.

**Pro tip:** if you can't draw this math on a whiteboard, you don't understand the feature's economics. Don't ship.

---

### Q12. How would you A/B test an LLM-powered feature?

Hard because outputs are non-deterministic. You can't compare "did user A see the right thing?" the way you would for a UI tweak.

**Approach:**

1. **Fix the seed/temperature** so the variant is reproducible enough.
2. **Test the WRAPPER, not the model** — A/B test the prompt, the system message, the tool surface, the placement. Hold the model constant.
3. **Use cohort metrics, not per-output** — % of users who completed the task, time-to-completion, return rate.
4. **Sample LLM-as-judge for quality scoring** — rate a sample of outputs on a rubric, compare distributions.
5. **Pre-register what "win" means** before you start. Outcome metrics, statistical significance threshold.

**Example from `the-edit`:** we'd A/B test "headline pattern A (The Reversal) vs pattern B (The Single Verb)" by checking save rate / scroll-past rate on the resulting Magazine cards in the styleMeUp app. The model output is variable, but the user signal aggregates.

**Pro tip:** sample size for LLM A/B tests is bigger than for UI tests because the variance per call is higher. Plan for 2-3× the traffic.

---

### Q13. Vendor APIs vs hosting open-source models — when?

**Use vendor APIs when:**

- Speed to market matters (most early-stage products)
- Quality of frontier models > open-source
- You don't have ML infra team
- Spend < ~$10K/month

**Self-host when:**

- Latency-sensitive (open-source on your hardware can be faster than API round-trips)
- Cost > ~$10K/month and a smaller open model passes your evals
- Data sovereignty is a hard requirement (regulated industries)
- You want to fine-tune

**Example from `the-edit`:** vendor APIs all the way (Anthropic + Gemini). At our cost (~$1.20/issue × 52 issues/year = $62/year), self-hosting is irrational. The fixed cost of GPU infra would dwarf savings until we're at thousands of issues per week.

**Pro tip:** the line moves fast. Llama 3.3 70B is competitive with GPT-4 for many tasks. Re-evaluate quarterly.

---

### Q14. How do you design human-in-the-loop systems?

Principles:

1. **Default to autonomy, gate the dangerous parts.** Don't make the human approve every step — that defeats the point. Approve only at irreversible boundaries.
2. **Make the human's job easy.** Show them the diff, the alternatives, the cost. Don't make them re-derive context.
3. **Design for failure of the human path too.** What if they don't review for 3 days? Time-out and pause, don't auto-approve.
4. **Capture the rationale.** Every approval/rejection becomes training data for future automation.

**Example from `the-edit`:** three approval gates — trend winner (prevents wasting effort on bad week), issue draft (the editorial moment), publish (the irreversible). Each gate prints the full payload, lets you skim, then waits for stdin. `MAGAZINE_AUTO_APPROVE=true` flag for smoke tests; never default behavior. If you don't approve, nothing publishes.

**Pro tip:** the right approval cadence is "as few as possible to catch a real mistake." Too many gates = gates get rubber-stamped. One missed gate = silent shipping of bad output.

---

### Q15. How do you build multi-tenant LLM apps?

Three concerns:

1. **Data isolation** — tenant A's prompts/outputs can never leak into tenant B's. Per-tenant database, per-tenant cache namespaces.
2. **Cost attribution** — every token usage tagged with tenant ID. Bill correctly.
3. **Quality SLAs vary** — some tenants pay for higher tiers (better model, more retries). Route accordingly.

**Example from `the-edit`:** not yet multi-tenant, but the architecture supports it. `magazine_run_steps.run_id` is already a UUID — adding `tenant_id` is a single migration. Cache keys are per-system-prompt — different tenants would have different prompts → different caches automatically. The biggest lift would be auth (Supabase RLS per tenant) and a tenant-aware admin UI.

**Pro tip:** design for multi-tenant from the start even if you ship single-tenant. The marginal cost is low; the cost of retrofitting is huge.

---

## 🔴 PRO

### Q16. Walk me through how you'd build an LLM-powered feature from zero to production with no precedent.

My framework:

1. **Define the output before the model.** What does success look like as a JSON schema? Write that first.
2. **Write the eval before the prompt.** Pick 10 sample inputs and what you'd accept as good outputs.
3. **Pick the smallest model that might work.** Cheaper to upgrade later than to optimize a too-large model.
4. **Build the workflow before the agent.** Determinism beats flexibility in V1.
5. **Add observability before scale.** Cost per step, token breakdown, error rate per executor.
6. **Layer safety before launch.** Caps, gates, fallbacks, kill switches.
7. **Ship to one user first.** Yourself, a teammate. Get real feedback before exposing it.

**Example from `the-edit`:** we did this in order. Started with the manifest schema, wrote QA executor before the editor, picked Sonnet 4.6 (skipped Opus), built the deterministic orchestrator, added the cost tracker before any real run, built three approval gates, ran it on myself first. Eight commits to a working V1.

**Pro tip:** the order matters. Building the model logic before the safety net is how startups make the news for the wrong reasons.

---

### Q17. How do you measure quality in subjective LLM outputs?

You have three options:

1. **LLM-as-judge with a rubric.** A separate model scores outputs on dimensions (accuracy, tone, brand fit). Cheap, scales.
2. **Human rater panels** — gold standard for high-stakes (medical, legal). Expensive, slow.
3. **Behavioral proxies** — did users save it, share it, edit it? Indirect but real-world signal.

For creative work specifically: combine all three. LLM-as-judge for screening, humans for top candidates, behavioral for production tuning.

**Example from `the-edit`:** the QA executor IS an LLM-as-judge. It scores the issue draft against a rubric (Vogue test, §4 bans, source grounding, alt text format) and returns structured verdicts. We supplement with human approval gates (the operator reviews QA's output and the draft together). Behavioral metrics will come once styleMeUp consumes the published issues.

**Pro tip:** the rubric matters more than the judge. A great rubric with a cheap judge beats a vague rubric with the best model.

---

### Q18. Design an LLM-based content moderation system at scale.

Architecture:

1. **Pre-filter with rules.** Regex + keyword bans catch 90% of clear-cut violations cheaply.
2. **Cheap-model triage.** Anything that passes rules → small fast model (Claude Haiku, GPT-4o-mini) classifies risk.
3. **Large-model review for high-risk.** Only escalate uncertain or high-risk content to a frontier model.
4. **Human review for the top 1%.** And anything legally sensitive.
5. **Feedback loop.** Every human decision feeds back into rules + cheap-model fine-tuning.

Cost shape: 90% rules ($0), 9% cheap model ($0.001), 1% large model ($0.05), 0.1% human ($1). Effective per-item cost: ~$0.001-0.01.

**Example from `the-edit`:** mini-version of this in the prompt executor's `validatePromptSuite()`. Rule-based ban-token list catches `flat-lay`, `gradient`, brand names, etc. before they reach Gemini. Saves a $0.09 QA call. The Magazine QA executor is the "large-model review" layer. No human moderation needed at this scale.

**Pro tip:** moderation by frontier model alone doesn't scale economically past ~10K items/day. Layered approach is mandatory.

---

### Q19. Choosing between Claude / GPT / Gemini for a use case — your framework?

Five-axis evaluation:

1. **Capability** — run your eval suite on each. Don't trust benchmarks.
2. **Cost at your usage shape** — input-heavy? Output-heavy? Different models excel at different ratios.
3. **Latency** — measure end-to-end at your typical prompt size, including streaming.
4. **Reliability** — track 5xx rates and degradation events. Some providers have rougher quarters.
5. **Specific features** — long context? Native tool use? Multimodal? Caching support?

**My defaults today:**

- **Claude (Sonnet 4.6, Opus 4.7)** — long-form writing, instruction following, prompt caching, structured outputs. Best at "follow my brand voice."
- **GPT** — broad capability, great function calling, big ecosystem. Best at "drop-in production."
- **Gemini** — multimodal (images, video, audio), Imagen for image gen, fast at low cost. Best at "I need to handle PDFs/screenshots."
- **Open-source (Llama, Qwen)** — when self-hosting is justified.

**Example from `the-edit`:** Claude Sonnet 4.6 for all editorial (voice + caching), Gemini 2.5 + 3 Pro Image for generation (Anthropic doesn't do image gen). Two providers, each chosen for what they do best.

**Pro tip:** lock-in is overstated. Vercel AI SDK, LangChain, and similar abstract the provider — switching is a config change.

---

### Q20. How do you handle prompt drift when the model is updated?

"Prompt drift" = same prompt produces different (often worse) outputs after a model version change.

**Strategy:**

1. **Pin model versions explicitly.** Never use `claude-opus` (latest); use `claude-opus-4-7`.
2. **Run regression evals on every model upgrade.** Same prompts, compare outputs.
3. **Treat prompts as code.** Version control them. PR review when they change.
4. **Track quality metrics over time.** First-pass QA pass rate, user satisfaction. A drop after a model change is your signal.
5. **Have a rollback plan.** Can you re-pin to the prior version if the upgrade regresses?

**Example from `the-edit`:** every executor pins via env var (`MAGAZINE_QA_MODEL`, etc.). Default is `claude-sonnet-4-6`. When Sonnet 5.0 ships, we'll smoke-test it on a single draft, compare QA verdicts and cost, then decide whether to upgrade. Caching helps here too — the SAME cached prefix on the new model gives clean A/B comparison.

**Pro tip:** the most expensive model regressions are silent. The system keeps running, costs stay similar, but outputs degrade. Quality metrics catch this; volume metrics don't.

---

## How to use this doc

- Read each question, give yourself 60-90 seconds to answer out loud, then read the written answer.
- Notice which examples you can recall from `the-edit` / styleMeUp without looking. That's your interview baseline.
- After every major build iteration, add a new question or extend the existing example with what you just shipped.
- Top-of-funnel screens get questions 1-5. Hiring manager rounds get 11-20. Practice both.

## Topics still to add (will write after the next major iteration)

- Vector databases and embedding choice
- Fine-tuning vs prompting decisions
- Latency optimization at the edge
- Multi-modal (vision, audio) pipelines
- Agent observability and tracing
- LLM security (prompt injection, data exfiltration)
- Eval design for non-binary outcomes
- Post-launch model monitoring
