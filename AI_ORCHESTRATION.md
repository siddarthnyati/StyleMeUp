# StyleMeUp AI Orchestration

Status: v1 planning spec
Last updated: 2026-05-04

This document defines how StyleMeUp should use model calls without turning the product into an uncontrolled agent swarm. It applies first to Magazine Weekly and later to First Signature, Capture, and recommendation work.

## Core Decision

Use Vercel AI as the orchestration layer and Supabase as memory, archive, and asset storage.

The orchestrator is deterministic application code. Model calls are executors. Executors return structured outputs. They do not message each other, publish directly, or decide the workflow.

The Expo app calls StyleMeUp endpoints only. It never sends provider keys, system prompts, or raw orchestration logic to the client.

## Mental Model

```text
Expo app
-> StyleMeUp API
-> deterministic orchestrator
-> executor model call
-> structured output
-> Supabase record
-> next executor or approval gate
```

This is a workflow-agent pattern: low autonomy, high control, observable, and reversible.

## Orchestrator Responsibilities

- choose the workflow
- validate inputs
- load compact context
- select executor models through env config
- call one executor at a time
- validate structured output
- store inputs, outputs, sources, costs, and errors
- enforce approval gates
- handle retries and partial failure
- return a stable status to the app

The orchestrator should never rely on an LLM to decide whether to publish, spend more money, or bypass a gate.

## Executor Responsibilities

Executors are narrow model calls.

Good executor examples:

- research a weekly trend
- rank trend candidates
- write Magazine copy
- create asset prompts
- check copy against `DESIGN.md`
- generate one first-signature look from stored closet state

Bad executor examples:

- "run the whole product"
- "search the internet and publish whatever is best"
- "talk to the other agents until you agree"
- "manage user data and choose tools freely"

## First Workflows

### Magazine Weekly

Primary V1 workflow. It is safe because it is one-to-many, weekly, human-approved, and not personalized per user.

Flow:

```text
research -> rank -> edit -> prompt -> QA -> approval -> publish
```

See `MAGAZINE_AGENT_SPEC.md`.

### First Signature

Later workflow. It is user-facing and should stay smaller.

Flow:

```text
starter selections + persona
-> generate one look
-> brand/copy check
-> deterministic fallback if needed
-> return to app
```

This workflow must never block the app on a long research chain. It should be fast, cacheable, and safe to fall back.

## Model Responsibilities

Use models by job, not by loyalty.

- Claude: Magazine voice, editorial copy, prompt-suite prose.
- OpenAI/Codex: implementation planning, structured schema design, code generation, QA automation.
- Gemini: visual/reference review, multimodal research packets, broad source synthesis.

In production, exact model names should be environment-configured so the app can switch providers without code churn.

## Context Policy

Context should be compact and purposeful.

Always include:

- the relevant `DESIGN.md` sections
- the relevant `AGENTS.md` rules
- the workflow-specific spec
- the user or issue inputs needed for the current step

Do not include:

- whole repo dumps
- unrelated prior chat
- every possible tool definition
- raw social feeds
- unsourced claims as facts

If a step needs archive memory, retrieve only the most relevant prior issues or user facts.

## Memory Policy

Supabase stores durable memory.

Use these memory classes:

- semantic: published issues, trend keywords, wardrobe taxonomy
- episodic: each Magazine run and approval decision
- working: current in-progress run state
- procedural: prompts, rubrics, workflow specs

The app should not treat model output as truth until it is validated and stored with a status.

## Safety And Control

Hard gates:

- no client-side provider keys
- no service-role keys in the app
- no autonomous publish
- no public social posting in V1
- no direct model writes to production tables
- no unsupported factual claims in Magazine copy
- no banned `DESIGN.md` section 4 copy or visuals

Human approval is required for:

- weekly trend winner
- final Magazine issue
- publish action
- any cost increase beyond default budget

## Observability

Every workflow run should expose:

- current step
- status
- model/provider used
- estimated cost
- source count
- QA status
- approval owner
- last error

This is how Sid and future devs debug the system without reading every raw model trace.

## Cost Controls

Start with the cheapest reliable design:

- extra prompt context before new systems
- one structured call before chains
- workflow agents before autonomous agents
- archive retrieval before fine-tuning
- model changes only after evals show a need

Default cost posture:

- batch work weekly where possible
- cache static brand context
- use cheaper models for metadata and classification
- regenerate sections, not whole artifacts
- keep one motion asset per Magazine issue

## Product Evals

Each workflow needs a rubric before it becomes production.

Magazine eval:

- source-grounded
- trend feels timely
- old-return-to-new framing is clear
- copy passes Vogue test
- no banned language
- no banned imagery
- asset prompts are runnable
- cost stays inside budget

First Signature eval:

- uses user-selected foundation pieces
- respects persona
- produces one usable look
- includes one concise rationale
- falls back deterministically
- returns quickly

## Scaling Path

V1:

- one Magazine Weekly orchestrator
- manual approval
- Supabase archive
- local docs and markdown issue output

V2:

- add First Signature endpoint
- add issue archive retrieval
- add QA automation dashboard
- add asset upload workflow

V3:

- add stateless reviewer executors
- add semantic search over issue archive
- add automated source monitoring
- consider fine-tuning only if context engineering and evals plateau

## Open Decisions

- Exact Vercel project and deployment shape.
- Exact Supabase tables and RLS policies.
- Whether Magazine research begins from manual source packets or live APIs.
- Whether there are three total trend stories per week or three per audience track.
- Whether `issues/index.json` remains the local manifest or Supabase becomes the only source of truth.
