---
name: magazine-issue
description: Generate a complete weekly Magazine issue prompt suite for [STYLE]'s Discover tab — a single markdown brief containing all image prompts (Nano Banana), motion prompts (Kling), editorial copy in Magazine register, and ingestion metadata, sized to one cover plus N trend cards plus M curator rotations. Use whenever Sid says "publish vol N", "new issue on X", "this week's magazine", "draft a discover issue", or names a trend that should become an issue (e.g. "let's do corduroy", "issue on the camel coat"). Trigger this even when the request is casual or doesn't say the word "magazine" — if the input is a fashion trend or aesthetic and the context is Discover content, this is the right skill. Do NOT trigger for Sanctuary content (closet, capture, looks), user-facing copy outside Discover, or general styling advice.
---

# Magazine Issue Skill

**Brand source of truth: `DESIGN.md` v3, sections 1.5, 5, 6, 7, 8, 12.** Every line of generated output must conform. If a generated line contradicts DESIGN.md, DESIGN.md wins. No exceptions.

This skill produces a **prompt suite** — a markdown brief that Sid runs through subscription tools (Nano Banana Pro, Kling 3.0) to produce one week's Discover content. The skill itself does not generate images. That separation is the whole cost strategy. Read the Cost Guards below before anything else.

---

## Cost Guards (read first, every invocation)

**Hard ceiling: $0.50 in Anthropic API costs per suite generation. Reject if exceeded.**

Per-issue total cost is dominated by Sid's flat-fee subscriptions, not API spend. The math:

| Asset | Tool | Per issue | Marginal cost |
|---|---|---|---|
| Suite text (this skill) | Claude Sonnet + Haiku | 1 | ~$0.25 with caching |
| Cover motion video | Kling 3.0 (subscription) | 1 (cover only) | flat-fee, ~$2 amortised |
| Image frames | Nano Banana Pro (subscription) | 6-10 | flat-fee, ~$0.40 amortised |
| Cover scroll frames | ffmpeg, local | 24-36 | $0 (extracted from Kling video) |

Run more issues per month → per-issue subscription cost falls. Target: 4 issues/month → ~$10-12 per issue all-in.

**Mandatory cost cuts — apply every invocation:**

1. **One LLM call per suite.** Generate everything in a single response. If Sid wants refinement, edit the markdown — do not regenerate.
2. **One Kling video per issue. Cover only.** Trend cards and curator cards are static images. No exceptions unless Sid explicitly says "two motion pieces this week."
3. **Reuse before regeneration.** Before generating new prompts, check `issues/index.json` for trend keyword similarity. If a close match exists in the reuse window (default 12 months), pull those assets and note in the Reuse Log. Never regenerate a corduroy issue 6 months after the last one — riff on it.
4. **Cheap model for metadata.** Use Haiku for the Discovery Feed Metadata section (slugs, alt text, schema). Use Sonnet for editorial concept and headlines. Never Opus unless explicitly requested by Sid for a "cover edition."
5. **Static-first composition.** Default cover treatment is `scroll_sequence` (frames extracted from one Kling video, not 24+ separate Nano Banana renders). Only use `rendered_hero` (true 3D model via Spline/Blender, ~$200-500 freelance render) when Sid explicitly asks.
6. **Brand context is cached.** DESIGN.md sections live in this skill's body, prepended to every prompt. Anthropic prompt caching gives ~90% discount on the cached portion. The user's input is variables only.
7. **Frames from video, not separate renders.** Cover scroll sequence frames come from `ffmpeg -i cover-motion.mp4 -vf fps=24 frames/%03d.webp` — never request 24 separate Nano Banana frames. This single rule saves ~$10/issue.

---

## Inputs

```yaml
required:
  trend:        # e.g. "corduroy" | "the camel coat" | "wide-leg silhouettes"
  volume:       # integer, e.g. 18
  date_range:   # e.g. "may 6 — may 12, 2026"

optional (defaults shown):
  trend_cards: 4              # number of trend pieces in the issue
  curator_cards: 3            # number of curator rotation cards
  cover_treatment: scroll_sequence    # or "rendered_hero" — flag with Sid before using
  reuse_window_months: 12     # how far back to check for asset reuse
  audience_persona: classy    # one of: fatigued_millennial | professional | classy
  era_reference: auto         # the trend's last cultural moment, e.g. "2013" — "auto" lets the agent decide
```

If any required input is missing, ask once, concisely. Do not start generating.

---

## Brand context (cached — reference by section, do not paraphrase)

**Register: Magazine. (DESIGN.md §1.5)**
- Canvas: `--void` `#000000` true black
- Type: monumental UPPERCASE display (Söhne Breit) for power moments; Migra italic lowercase for editorial captions
- Accent: `--signal` `#E10600` ONLY on a single CTA, if any. `--moment` `#FFD60A` ONLY for first-signature reveal — never in regular issues. `--power` `#B8954A` only as quiet underline.

**Voice: Magazine. (DESIGN.md §5)**
- Declarative. Editorial. Dry. Confident-without-trying.
- Sentences short, often verbless. Final. No hedging.
- The Vogue test: would this sentence appear, verbatim, in a Vogue or Burberry campaign? If no, rewrite. If still no, delete.
- Banned: sparkle emoji, "Powered by AI", "Let's…", exclamation points outside error recovery, "magic/smart/intelligent/amazing" as adjectives, any emoji in product UI.
- Reference exemplars:
  - *"LAST SEEN: 2013. RETURNING."*
  - *"FOR THURSDAY."*
  - *"Three pieces, one silhouette. Below."*
  - *"Sold out. The next drop: Friday."*

**Imagery: Magazine. (DESIGN.md §8)**
- Three categories only: Magazine hero (full-bleed model+garment, cinematic natural light, slight warm grade); cutout product (garment on `--void`, single subtle shadow, sharp focus); user capture (does NOT apply on Magazine surface — never include).
- Studio-light feel: every product image must appear shot in a studio with key + fill.
- Banned: flat lays from above with props, lifestyle shots, before/after splits, grid collages, heavy filters, photographs of phones/devices/screens within imagery, stock photography ever, AI-generated human faces in UI chrome, decorative illustration, mascots.

**Cold-start mandate. (DESIGN.md §12)**
- The blank screen is the enemy. Every issue must feel cinematic from frame 1.
- A user who has uploaded nothing must still see a fully-realised editorial experience.

**Anti-references. (DESIGN.md §3)**
- No Pinterest masonry. No Instagram chrome. No "AI stylist" garbage. No purple/blue gradients. No glassmorphism on UI. No Material elevation. No rounded corners >4px on structural elements.

---

## Workflow (skill execution)

When invoked, run these steps in order. Do not skip.

1. **Parse inputs.** Confirm `trend`, `volume`, `date_range`. If any required field is missing, ask once and stop.
2. **Reuse check.** Search `issues/index.json` for trend keyword similarity (embedding cosine > 0.85 against last `reuse_window_months` of issues). If a close match exists, surface it: `"Vol N (date) covered '{trend}'. Reuse, riff, or fresh?"` Wait for Sid's call.
3. **Concept generation.** Sonnet, ~150 tokens. One paragraph, 60-90 words, Magazine voice. Names the era of origin, why it returns now, what makes the 2026 version different. Vogue test applies.
4. **Cover prompts.** Sonnet. Two image prompts (Frame 1 = assembled, Frame 2 = exploded) plus one motion prompt for the Frame 1 → Frame 2 transition. Reference §8 imagery rules verbatim in each prompt. End each image prompt with the negative-space / no-text closer (template below).
5. **Trend cards (× N).** Sonnet, batch — generate all N in one response so the agent can ensure variety. Each card a different garment archetype, different color grade, different angle of the trend. No two cards the same silhouette.
6. **Curator cards (× M).** Sonnet, batch. Pseudonymous studio names only — no real influencers, no public figures, no AI-generated faces. Each card is a still-life or styled flat-lay representing a curator's eye, never their face.
7. **Discovery feed metadata.** Switch to Haiku for this section — it's structured YAML, not editorial. Cheap.
8. **Reuse log.** Append findings from step 2 — what was reused, what was generated fresh.
9. **Write to file.** `issues/vol-{volume}-{trend-slug}.md`. Confirm overwrite with Sid if the file already exists.

Total tokens: ~3000 input (mostly cached brand) + ~1800 output. Cost with caching: ~$0.20-0.30.

---

## Output: the prompt suite template

Generate the file at `issues/vol-{volume}-{trend-slug}.md` using this exact structure. Replace `{placeholders}` with generated content. Keep section headers verbatim — downstream tooling parses them.

````markdown
# [STYLE] · Vol. {volume} · {trend}

*{date_range}* · register: Magazine · audience: {audience_persona}

---

## Concept

{One paragraph, 60-90 words, in Magazine voice. Names the trend's last cultural moment (era_reference), why it returns now, what's different in 2026. Verbless sentences allowed. Vogue test applies.}

---

## Cover

**Treatment**: {cover_treatment}

### Frame 1 — assembled

**Tool**: Nano Banana Pro
**Aspect**: 16:9
**Quality**: 4K

**Prompt**:
> {80-120 word ultra-realistic product photograph paragraph. Lead with subject + setting + lighting direction. Specify exact materials, finish, surface details. Reference photography style ("commercial luxury fashion photography", "Mr Porter editorial aesthetic", "Hodinkee-grade product detail"). Include shot specs (lens equivalent, depth of field, angle). End with the closer:}
>
> *"Pure product photography. No text, no labels, no callout lines, no annotations, no diagrams, no markings of any kind. Clean negative space surrounding the subject. Industrial design rendering, Apple keynote aesthetic. 8K, octane render quality. Pitch-black salt-textured void background."*

### Frame 2 — exploded

**Tool**: Nano Banana Pro
**Aspect**: 16:9
**Quality**: 4K

**Prompt**:
> {Same subject, deconstructed state. Adapt the Maison Vayron watch-component vocabulary to garments — for a jacket: shell, lining, buttons, pocket bags, interior structure floating apart in still air. For pants: fabric panels, zip assembly, waistband, cuff, belt loops. For knitwear: yarn-lengths and seams suggested rather than literal. "Each component perfectly centered and aligned, suspended in still air with even spacing between them. Dramatic studio lighting from upper left, each component softly shadowed beneath, micro-detail visible on every surface."}
>
> *{Same closer as Frame 1.}*

### Motion (Frame 1 → Frame 2)

**Tool**: Kling 3.0
**Duration**: 10s
**Aspect**: 9:16 (mobile-first; web crops from this)
**Resolution**: 1080p
**Multi-shot**: ON
**Start frame**: Frame 1 (above)
**End frame**: Frame 2 (above)

**Prompt**:
> Weightless zero-gravity motion throughout. Rigid solid components, no deformation, no melting, no morphing, no fabric simulation drift. Cinematic rim lighting from upper left, soft volumetric haze, particles catching the light beams. Hyper-realistic luxury film grade, slow-motion, 24fps cinematic feel, single continuous take, no cuts. {Trend-specific direction — e.g., "Components separate gradually outward, rotating once before settling at final positions."}

### Editorial copy

```
EYEBROW (--micro, uppercase, letter-spacing 0.12em, --smoke-300):
{e.g. "VOL. 18 · THIS WEEK'S RETURN"}

MONUMENTAL HEADLINE (--monumental, ONE per screen):
{1-4 words. Verbless. Final. Migra Italic lowercase OR Söhne Breit UPPERCASE — pick one and note which.}

DEK (Migra italic, lowercase, --display-md):
{2 lines. Editorial. Vogue test.}

CTA (single, optional, --signal #E10600 ONLY if present):
{e.g. "see the issue ↓" — usually omit; the cover is the CTA}

ALT TEXT (editorial voice, accessibility):
{Editorial alt text per DESIGN.md §13 — not "image of jacket" but e.g. "wide-wale corduroy trousers, deep brown, photographed against a pitch-black studio void with directional light from upper left."}
```

---

## Trend cards (× {trend_cards})

Each card has one image and three lines of copy. Cards must vary: different garment archetypes, different color grades, different angles of the trend.

### Card 1 · {sub-angle, e.g. "the wide wale"}

**Image prompt** (Nano Banana, 4:5):
> {~60 words. Same template as cover Frame 1, but tighter. Single garment, cutout-on-void or cutout-on-bone. Studio light. Specify the angle that distinguishes this card from the others.}

**Copy**:
```
EYEBROW: {e.g. "FOR THURSDAY"}
HEADLINE: {Migra italic, lowercase, ~3-5 words. e.g. "the wide wale."}
BODY: {1 line. e.g. "twelve threads to the inch. coat-weight."}
```

### Card 2 · {next sub-angle}
{...same structure...}

### Card 3 · {next sub-angle}
{...same structure...}

### Card 4 · {next sub-angle}
{...same structure...}

---

## Curator rotation (× {curator_cards})

**Constraint**: no AI-generated human faces (DESIGN.md §4 + §8). No real public figures. Curator rotations represent **taste**, not **people**. Each card is a styled still-life that evokes the curator's point of view.

### Curator 1 · {pseudonymous studio name, e.g. "ATELIER ROUGEMONT"}

**Image prompt** (Nano Banana, 4:5):
> {Beautifully shot still life. 3-5 garments arranged on a `--bone` (#FAFAFA) or `--void` (#000000) surface. Single directional light, sharp shadows, editorial composition. The arrangement should suggest the curator's eye — give one specific aesthetic note, e.g. "tonal browns, mid-century proportions, leather-and-wool texture interplay" or "cool greys, military hardware, post-Helmut Lang minimalism". 60-80 words. End with the no-text closer.}

**Copy**:
```
EYEBROW: "CURATED BY {STUDIO NAME}"
HEADLINE: {Migra italic. 3-5 words. e.g. "three for autumn."}
BODY: {1 line attributing taste, not identity. e.g. "from a paris atelier of one." — never names a real person.}
```

### Curator 2 · {next studio}
{...same structure...}

### Curator 3 · {next studio}
{...same structure...}

---

## Discovery feed metadata

For ingestion into the Discover tab and search index. Generated with Haiku — structured, not editorial.

```yaml
issue:
  slug: vol-{volume}-{trend-slug}
  volume: {volume}
  trend: "{trend}"
  trend_keywords: ["{primary}", "{synonym 1}", "{synonym 2}", "{era of origin}"]
  era_reference: "{e.g. 2013}"
  embedding_seed: "{60-word concept text repeated here for reuse-detection embedding}"
  cover_alt: "{alt text from cover}"
  primary_color_grade: "{cool-cinema-black | warm-amber-rim | neutral-studio | other}"
  garment_categories: ["{e.g. outerwear}", "{denim}", "{knitwear}"]
  audience_persona: "{audience_persona}"
  publish_date: "{YYYY-MM-DD}"
  expires_after_weeks: 26
  asset_paths:
    cover_start: "magazine-issues/vol-{volume}/cover-start.webp"
    cover_end:   "magazine-issues/vol-{volume}/cover-end.webp"
    cover_motion: "magazine-issues/vol-{volume}/cover-motion.mp4"
    cover_frames: "magazine-issues/vol-{volume}/frames/"
    trend_cards: ["magazine-issues/vol-{volume}/trend-1.webp", ...]
    curator_cards: ["magazine-issues/vol-{volume}/curator-1.webp", ...]
```

---

## Reuse log

{One of:}

- "No close matches in the last {reuse_window_months} months. Generated all assets fresh."
- "Vol. {N} ({date}, '{trend}') overlaps at similarity {0.XX}. Reused: {list}. Generated fresh: {list}."

---

## Production checklist (Sid runs)

- [ ] Run Frame 1 prompt in Nano Banana Pro → save `assets/vol-{volume}/cover-start.webp`
- [ ] Run Frame 2 prompt in Nano Banana Pro → save `assets/vol-{volume}/cover-end.webp`
- [ ] Run motion prompt in Kling 3.0 with Frame 1 + Frame 2 attached → save `assets/vol-{volume}/cover-motion.mp4`
- [ ] Extract scroll frames: `ffmpeg -i cover-motion.mp4 -vf fps=24 frames/%03d.webp`
- [ ] Run trend card prompts (× {trend_cards}) in Nano Banana → save `assets/vol-{volume}/trend-N.webp`
- [ ] Run curator prompts (× {curator_cards}) in Nano Banana → save `assets/vol-{volume}/curator-N.webp`
- [ ] Compress all webp under 200KB: `cwebp -q 80 input.png -o output.webp`
- [ ] Upload to Supabase Storage bucket `magazine-issues/vol-{volume}/`
- [ ] Insert metadata YAML row into `magazine_issues` Postgres table
- [ ] Append entry to `issues/index.json` with embedding (for future reuse-check)
- [ ] Visual QA on a 2021-era phone: cover scrolls at 60fps, no jank, no flash-of-unstyled-text
- [ ] Vogue test on every line of copy. Strip anything that fails.

---

*generated by `magazine-issue` skill · {timestamp}*
````

---

## Failure modes and fixes

- **Output sounds like marketing copy, not Vogue.** Re-read DESIGN.md §5. Strip every adjective. Add "Vogue test applies" to the offending section's prompt and regenerate just that section.
- **Image prompts produce wrong color grade.** Add explicit grade direction: "shot at golden hour with soft warm rim light" or "shot under cool overcast studio light, 5500K key + 4000K fill". Implicit grade direction is the most common failure.
- **Curator cards keep generating faces.** Reinforce in the curator prompt: "still life only. zero people. zero hands. zero mannequins. arrangement of garments and objects only." Run again.
- **Trend feels stale.** Reuse check should catch this in step 2. If it slipped through, declare staleness explicitly: "this trend was covered in vol N {date}. Three alternative angles: [A], [B], [C]. Pick one or confirm fresh angle."
- **Cost overrun.** Diagnose: did the agent call Opus instead of Sonnet for editorial sections? Did it regenerate the suite after Sid's edit? Did Kling get asked for >10s or >1080p? Each is a budget violation — flag and stop.
- **Sid asks for two motion pieces this week.** Allowed but flag the cost: "second motion piece adds ~$2 to issue cost. Confirm?"

---

## Examples

The first run of this skill should produce `issues/vol-18-corduroy.md`. That file becomes the canonical worked example for future issues. Reference it whenever the brand voice or prompt structure is unclear.

Sid validates the first issue end-to-end before the skill is considered shipped:
1. Generate suite with this skill (~$0.30, ~5 minutes)
2. Run all prompts through Nano Banana + Kling (~30 minutes Sid time, ~$3 amortised subscription)
3. Build the actual scroll-driven Discover hero page from the assets (Claude Code, ~15 minutes)
4. Open on phone. Does it pass the Vogue test? Does it pass the Maison Vayron / Apple-keynote bar? If yes, ship the skill. If no, iterate the templates above.

---

## What this skill is NOT

- Not for Sanctuary content (closet items, capture flow, looks). Sanctuary uses on-device cutout — different agent entirely.
- Not for user-uploaded items. Magazine is curated, one-to-many. Sanctuary is user-driven, one-to-one.
- Not for marketing copy, social posts, App Store descriptions, paid ads. Different register, different voice rules — write a separate `marketing-copy` skill if needed.
- Not a styling assistant. Does not recommend outfits to users. That's the recommendation engine, not the editorial engine.

---

*v1 · canonical · drop into repo at `.claude/skills/magazine-issue/SKILL.md` for Claude Code, or `skills/magazine-issue/SKILL.md` for the agent runtime · owner: Sid · last updated: 2026-05-01*
