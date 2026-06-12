# StyleMeUp — Next Steps & Build Brief

Last updated: 2026-05-18

This doc is the handoff brief. Track A (app build) is scoped for a
coding model (Fable). Track B (learning docs) is writing work, model-
agnostic. They run in parallel and don't block each other.

---

## The two tracks

- **Track A — App.** Finish the onboarding redesign we have mockups for,
  then move to personalization. This is the "next phase of the app."
- **Track B — Docs.** Keep growing `learning/the-edit-architecture/`
  (the glossary gospel) and feed every shipped app feature back into the
  relevant entry as a real-world example.

The discipline: **every Track A feature that ships gets a one-line entry
in `CHANGE_LOG.md` and, where relevant, a concrete example added to the
matching glossary/principles section.**

---

## Track A — App build (scoped for Fable)

Context already shipped (do not redo):
- Phase 1 — gender routing through the starter pack (commit `78b9ed4`).
- Phase 2 — three audience hero plates generated, in Supabase at
  `wardrobe-basics/firstfit/{man,woman,non-binary}.png`, helper at
  `lib/firstFitHeroes.ts` (exports `getFirstFitHeroUrl`, `AUDIENCE_ORDER`,
  `AUDIENCE_CAPTIONS` — captions already correct and differentiated).
- Catalog expansion — 24 new wardrobe-basics photos wired into
  `lib/wardrobeBasicsPhotos.ts` (commit `4799634`).
- claude.design mockups — **variant 2 (three columns)** chosen for the
  audience picker. A "what you already own" editorial-list mockup also
  exists but is NOT yet decided (see Decisions Needed).

### PHASE 4 — Rebuild the audience picker as a Magazine cover  [COMPLEX]

The highest-leverage build. The current screen is the bland outline-card
version Sid rejected, and it still has the caption bug.

- **File:** `screens/Onboarding/Identity.tsx` (174 lines, full rewrite of
  the body; currently `@register Sanctuary` — change to Magazine).
- **Use:** `lib/firstFitHeroes.ts` — already has the hero URLs and the
  correct per-audience captions. Do NOT hardcode captions in the screen;
  the current screen's inline `identities` array has the OLD buggy copy
  (man and woman both say "cut from that rail"). Pull from
  `AUDIENCE_CAPTIONS` and `AUDIENCE_ORDER` instead.
- **Layout:** claude.design variant 2 — three full-bleed vertical columns
  (man | woman | non-binary), each column a hero photo with the slug
  label + caption at the bottom on an ink-to-transparent gradient. Void
  (`--void`) background. Magazine register. No card outlines, no rounded
  corners > 4px (DESIGN.md §4).
- **Behavior:** tap a column → `setAudienceIdentity(label)` then
  `router.push('/onboarding/starter-pack')`. Keep the web `<a>` + native
  `Pressable` split that exists today.
- **Leave room for the Vanishing transition** (see Known Gaps) — assume
  the column can scale + fade on tap, but don't build the Skia particle
  effect here.
- **Acceptance:**
  - Renders three real hero photos from Supabase (not SVG).
  - man → "tees, denim, leather. cut from that rail."; woman → "slips,
    knits, tailoring. cut from that rail."; non-binary → "the full rail.
    nothing held back." (all from `AUDIENCE_CAPTIONS`).
  - Void background, full-bleed images, gradient-anchored captions.
  - Tap sets identity and routes to starter-pack.
  - Web and native both work; AA contrast on caption text over image.

### PHASE 3 — Selection state as register flip  [MEDIUM]

Kill the red checkmark. Selection becomes a register flip.

- **File:** `components/StarterPack/StarterPackExplorer.tsx`.
- **Remove:** `styles.selectedMark` / `styles.selectedCheck` usage (the
  red badge) in both the web `<a>` and native `Pressable` variant tiles
  (~lines 540–565 region).
- **Add:** selected tile → void background, paper text + paper hairline
  border; unselected → paper background, ink text, smoke hairline.
  ~180ms ease-out transition on background-color + color only.
- **Acceptance:** no red badge anywhere; a marked tile reads as an
  ink-inked page at a glance; `accessibilityState={{ checked }}` still
  set; AA contrast in both states; web + native parity.

### PHASE 5 — Category grid as editorial single-hero  [MEDIUM]

Replace the 3-thumbnail preview row with one decisive image per category.

- **File:** `components/StarterPack/StarterPackExplorer.tsx`.
- **Change:** the category-grid `previewRow` (3× `categoryThumb`) →
  one large hero image per category. Drop the card outline/chrome; let the
  image bleed to paper, label + "n marked · N options" below.
- **Pick the hero:** strongest photographed variant per category via the
  existing `pickPhotoFirstVariants(category.variants, audienceIdentity, 1)`.
- **Acceptance:** one image per category cell, no card borders, meta line
  reads "n marked · N options" (keep the "options" wording), audience
  filter still applied.

### Quick fix — re-upload one image  [TRIVIAL]

`men/black-leather-jacket-men.png` regenerated cleanly but the upload
network'd out. Local PNG is good. One command from `~/the-edit`:
```
npm run basics -- --gender men --slug black-leather-jacket-men
```

---

## Track A — Later (personalization, separate phase, COMPLEX)

Not for this batch. Documented so the shape is known. These were scoped
in chat:
1. **The rail (sidebar)** — vertical identity strip: audience, foundation
   count, top tones (from observed behavior), today's weather/calendar
   context, a reroll button. Sanctuary register.
2. **Daily look ritual** — one outfit/day, `wear` / `next` buttons (NOT
   thumbs up/down — that's Tinder grammar). `wear` is the strong positive
   signal.
3. **Gmail receipt signals (opt-in)** — parse shopping receipts + travel
   confirmations only. Filter-scoped, never full-inbox. The magic moment:
   "saw the Mr Porter order, added the linen shirt to your rail."

---

## Decisions needed from Sid (brand calls, not Fable calls)

1. **"What you already own" screen** — adopt Codex's editorial-list
   redesign (line-icons + color swatches + per-category counts) or stay
   with the photo-forward grid direction? Codex's version is elegant but
   drifts away from the "photo-forward, no chrome" direction Sid asked
   for. Decide before Phase 5 ships, since they touch the same screen.
2. **Daily ritual vs feed** — is personalization a once-a-day ritual or a
   scrollable feed? Changes the whole personalization model. Sid leaning
   ritual.

---

## Known gaps (flagged, not blocking)

- **The Vanishing transition is not built.** DESIGN.md §11 specifies it
  (1.3s, Skia particles) but no component implements it. Phase 4 should
  leave room for it (column scale + fade) but building the real Skia
  effect is its own COMPLEX phase. Recommend a dedicated pass after the
  onboarding screens are visually right.

---

## Track B — Learning docs (writing, model-agnostic)

Folder: `learning/the-edit-architecture/`. Status:
- All 20 principle glossary entries: conversational tagline + analogy ✅
- Part VIII Market & Beyond, Day 1 (entries 22–26: reasoning models, MCP,
  computer use, multi-agent, voice/realtime) ✅
- **Day 2 (next):** entries 27–30 — reranking, speculative decoding,
  constitutional AI / RLHF, open vs closed weights.
- **Then:** Entry 21 (Trend Selection — Research + Rank deep dive);
  Appendix D (what's actually in DESIGN.md); `prompts.md` (PRIVATE,
  gate-kept — all stage prompts with annotations); `index.html` private
  banner + prompts link; `principles.md` analogy openers.

Sid's pace: 5 concepts/day, day 1 of 15. Say "Day N" to continue.

---

## Suggested order

1. **Fable:** Quick fix (jacket re-upload) → Phase 4 → Phase 3 → Phase 5.
   Each is its own commit. Phase 4 first because it's the screen Sid
   reacted to and it unlocks the "wow" of the redesign.
2. **In parallel (Opus or Fable between builds):** Track B Day 2.
3. **After onboarding screens land:** decide the two brand questions,
   then either the Vanishing transition or start personalization Phase 1
   (the rail).
