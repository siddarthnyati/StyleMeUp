# StyleMeUp Magazine Weekly Agent Spec

Status: v1 planning spec
Last updated: 2026-05-04

This document defines the weekly Magazine workflow for Discover. It does not replace `DESIGN.md`, `AGENTS.md`, or `.claude/skills/magazine-issue/SKILL.md`; it explains how the system around that skill should work.

## Product Job

Magazine is StyleMeUp's editorial engine: a weekly issue that declares which old trend is returning, why it matters now, and how it can be worn without making the user do research.

V1 must feel like an editorial production desk, not an autonomous swarm. The system researches, drafts, checks, and prepares the issue. Sid approves before anything publishes.

The weekly output is:

- one Magazine issue concept
- three trend stories
- audience-aware framing for `man`, `woman`, and `non-binary`
- one motion cover prompt suite
- static prompt suites for trend and curator cards
- ingestion metadata for Discover
- a QA report with brand, source, and cost findings

## System Shape

Vercel AI is the orchestration layer. Supabase is the memory, storage, and archive layer.

The Expo app never calls model providers directly. It reads published Magazine data and assets through the app backend. All provider keys remain server-side.

The orchestrator is deterministic TypeScript. It owns sequence, state, approvals, retries, budget, and final status. Executors are narrow model calls. Executors do not talk to each other.

Workflow:

```text
research brief
-> ranked trends
-> issue draft
-> asset prompt suite
-> QA report
-> human approval
-> publish manifest
```

## Roles

### Orchestrator

Runs on Vercel. It is code, not an LLM.

Responsibilities:

- start one weekly Magazine run
- load `DESIGN.md`, `AGENTS.md`, issue archive metadata, and configured source inputs
- call executors in the approved order
- enforce budget and model routing
- persist every step to Supabase
- stop when approval is required
- resume after approval
- mark the issue as draft, approved, published, or rejected

### Research Executor

Finds evidence that a trend is returning.

Inputs:

- date range
- audience tracks
- optional seed trend
- approved source list
- issue archive summary

Outputs:

- trend candidates
- source links and dates
- old-era reference
- current signal summary
- confidence note
- source gaps

Source rules:

- Use editorial, runway, retail, resale, search, and public social signals as separate evidence types.
- Social signals are directional, not truth.
- Use official APIs or manual source packets only. No private scraping, no login scraping, no copied influencer content.
- If a claim cannot be sourced, mark it as unsupported and exclude it from user-facing copy.

### Trend Ranker

Scores candidates and chooses the strongest weekly direction.

Score each trend on:

- return signal
- old-trend-to-new-trend clarity
- styling usefulness
- fit with foundation pieces
- audience track coverage
- visual asset feasibility
- reuse risk against the issue archive
- brand fit with `DESIGN.md`

Default V1 winner:

- one issue theme
- three trend stories under that theme
- no more than one motion asset

### Editor Executor

Writes the Magazine issue draft in StyleMeUp voice.

Responsibilities:

- create the concept paragraph
- write cover copy
- write three trend-card copy sets
- write curator rotation copy
- preserve Magazine register throughout
- avoid any banned copy from `DESIGN.md` section 4

This executor should favor Claude for editorial voice unless later evals prove otherwise.

### Prompt Executor

Creates asset prompt suites for human-run tools.

Responsibilities:

- generate Nano Banana prompts for cover start and end frames
- generate one Kling prompt for the motion cover
- generate static prompts for trend cards and curator cards
- produce alt text in editorial voice
- keep assets on `--void` or approved Magazine imagery rules

Rules:

- one Kling motion piece per issue by default
- trend cards and curator cards are static
- no AI-generated human faces in UI chrome
- no stock photography
- no glassmorphism as UI
- no decorative illustration

This executor should extend `.claude/skills/magazine-issue/SKILL.md`, not fork the brand language.

### Brand QA Executor

Reviews the full issue before approval.

Checks:

- Magazine register only
- Vogue test for every string
- `DESIGN.md` section 4 bans
- source grounding for factual claims
- asset prompt compliance
- accessibility alt text
- cost ceiling
- reuse check against prior issues

Output must be one of:

- `approve`
- `revise`
- `reject`

If `revise`, the QA report must name the exact section and replacement requirement.

### Publisher Executor

Publishes only after Sid approves.

Responsibilities:

- write metadata to Supabase
- write asset paths to the issue manifest
- update `issues/index.json` or the future equivalent source of truth
- mark the run as published

The publisher must not create editorial copy or asset prompts.

## Stored Run Record

Every orchestrated step stores a structured record.

```ts
type MagazineRunStep = {
  runId: string;
  step:
    | 'research'
    | 'rank'
    | 'edit'
    | 'prompt'
    | 'qa'
    | 'approval'
    | 'publish';
  status: 'queued' | 'running' | 'complete' | 'blocked' | 'failed';
  input: unknown;
  output: unknown;
  sources: Array<{
    title: string;
    url: string;
    publisher: string;
    observedAt: string;
    signalType: 'editorial' | 'runway' | 'retail' | 'resale' | 'search' | 'social' | 'archive';
  }>;
  modelProvider?: string;
  modelName?: string;
  estimatedCostUsd?: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
};
```

The exact database schema can change during implementation, but these fields are the minimum information the product needs.

## Issue Manifest

Published issue metadata must be portable between local markdown, Supabase, and app consumption.

```ts
type MagazineIssueManifest = {
  slug: string;
  volume: number;
  publishDate: string;
  dateRange: string;
  register: 'Magazine';
  trend: string;
  trendKeywords: string[];
  eraReference: string;
  audienceTracks: Array<'man' | 'woman' | 'non-binary'>;
  coverTreatment: 'scroll_sequence' | 'rendered_hero';
  assetPaths: {
    coverStart: string;
    coverEnd: string;
    coverMotion: string;
    coverFrames: string;
    trendCards: string[];
    curatorCards: string[];
  };
  sourceSummary: string;
  qaStatus: 'approved';
};
```

## Cost Policy

Default weekly budget:

- one orchestrated research and draft run
- one motion cover
- static trend and curator cards
- no regeneration after minor copy edits
- no Opus-class editorial model unless Sid explicitly approves a cover edition
- no autonomous social crawling

Cost failures block the run. The orchestrator should report which step caused the overrun and wait for instruction.

## Approval Gates

Required human approvals:

1. Trend winner approval after ranking.
2. Issue draft approval after editor and prompt generation.
3. Publish approval after QA passes.

Anything with unsupported sourcing, off-brand copy, cost overrun, or banned visuals must stop before publish.

## Failure Modes

- If research is weak, produce a source-gap report instead of pretending the trend is real.
- If the trend overlaps a recent issue, recommend reuse or a sharper angle.
- If image prompts produce banned imagery, revise prompts before any asset upload.
- If QA rejects the issue, only regenerate the failed section.
- If Supabase publish fails, keep the issue in approved draft state.

## V1 Non-Goals

- No autonomous public posting.
- No direct Twitter/X or Instagram scraping.
- No user-specific Magazine generation.
- No Sanctuary content.
- No user-uploaded item processing.
- No real-time 3D model generation.
- No model fine-tuning.
- No multi-agent debate loop.

## Implementation Notes For Later

- Use Vercel AI Gateway for provider routing, budgets, fallback, and observability.
- Use environment variables for model routing, for example `MAGAZINE_EDITOR_MODEL`, `MAGAZINE_RESEARCH_MODEL`, and `MAGAZINE_QA_MODEL`.
- Use structured outputs for every executor so the orchestrator can validate shape before moving forward.
- Keep static brand context at the top of prompts to benefit from provider caching where available.
- Start with one route or workflow for Magazine Weekly before generalizing to First Signature.
