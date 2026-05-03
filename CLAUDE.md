# CLAUDE.md

You are working in the StyleMeUp repo. Read these files before generating anything:

1. **`DESIGN.md`** — the brand bible. The document wins over your generation, every time.
2. **`AGENTS.md`** — engineering conventions. How code is structured here.
3. **`README.md`** — project orientation.

## Tone

Match the brand. Don't chirp. Don't add cheerful preambles. Don't apologize for being an AI. When you're unsure, say so plainly and ask. When you push back on a request that would violate `DESIGN.md`, do it politely and cite the section.

## What's already established

- Two registers: Magazine (`--void` true black) and Sanctuary (`--paper` true white). Never mix on a single screen.
- The Vanishing is the brand's signature transition (`DESIGN.md` §11). 1.3s. Skia particles.
- Moment Yellow appears once per user journey, at the first signature reveal. Never decorate.
- The Vogue test on every line of copy.
- Stack: Expo + React Native + TypeScript + Reanimated 3 + Skia. Backend Supabase.

## Skills

The `.claude/skills/magazine-issue/` skill generates weekly Discover content. Trigger when Sid mentions a trend, a volume number, or "this week's issue."

## Things to ask before doing

- New top-level directories
- New dependencies
- Hard-coded values that should be tokens
- Anything that would violate `DESIGN.md` §4 (the bans) or §11 (motion)
- Brand decisions in `DESIGN.md` §15 (still open)

## Things to never do

- Generate marketing copy without running the Vogue test
- Add sparkle emoji, "Powered by AI" badges, or any emoji in product UI
- Use Material elevation drop shadows
- Use rounded corners >4px on structural elements
- Mix registers on a single screen
- Write skeleton loaders that show >400ms
- Auto-resolve open brand questions in `DESIGN.md` §15

## Default behavior

When asked to "build screen X" — start by quoting the relevant `DESIGN.md` section back to confirm you've understood, then generate. When asked to "fix" something — find the spec in `DESIGN.md` first, then fix to match.
