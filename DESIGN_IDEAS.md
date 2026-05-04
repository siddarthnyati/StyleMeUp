# StyleMeUp Design Philosophy And Ideas

Status: living product/design notes.
Last updated: 2026-05-04

## Source Context

This document does not replace `DESIGN.md` or `AGENTS.md`. It is a working design memory for future models.

`DESIGN.md` is the product contract. Every experience should trace back to it:

- The mandate: StyleMeUp is a confidence engine, not a closet database.
- The user should feel more like themselves, not less.
- The blank screen is the enemy.
- Luxury means emotional precision, restraint, speed, privacy, and taste.
- The two-register system is architectural: Magazine and Sanctuary never mix inside one screen.

`AGENTS.md` is the implementation contract. Important working rules:

- Use the Expo managed stack, Expo Router, TypeScript strict mode, Zustand, React Query, MMKV, Reanimated, and Skia.
- Keep styling in tokens; do not hard-code colors, spacing, type, or timings inside components.
- Every screen declares `@register`.
- Do not invent new top-level directories without asking.
- Preserve the Vogue test for all copy.
- No new dependencies without explicit approval.

## Register Memory

Magazine is seduction. It uses true black, cinematic composition, monumental type, sparse copy, and ceremonial peaks. Use it for Discover, trend features, look reveals, and the first-signature moment.

Sanctuary is belonging. It uses true white, lowercase italic headlines, quiet borders, private copy, and practical next actions. Use it for onboarding, Closet, Capture, Looks, settings, receipts, and confirmations.

If a flow needs both feelings, split it into separate screens. Do not mix Magazine and Sanctuary on the same screen.

## Core Philosophy

StyleMeUp should feel private, editorial, and inevitable. The product is not a closet database; it is a daily confidence engine. The luxury is not visual noise or price signaling. The luxury is the feeling that the app understands the user with very little effort.

The first-week experience should prove value before asking for work:

1. assume the user owns a few foundation pieces
2. let them correct or mark those pieces quickly
3. give them a first signature
4. ask for one real captured item only after trust is earned
5. bring them back tomorrow with one useful look

## Interaction Principles

- Progressive disclosure: show departments first, then the item grid after a deliberate category tap.
- One primary action per screen.
- No empty screens. Every wait is editorial.
- No quiz fatigue. Men/women and persona should be one-tap signals, not a long onboarding form.
- Selection should feel like marking ownership, not shopping.
- The user should always know the next best action without reading instructions.

## Growth.Design Psychology Lens

Yes, the Growth.Design psychology audit should be carried forward, but not as a raw 106-item dump inside this file. The useful artifact is an applied product lens: which principles we chose, where they show up, why they help first-week habit formation, and what we rejected for brand or ethics.

Recommended structure:

- Keep `DESIGN_IDEAS.md` focused on applied principles and shortlisted features.
- If we need the full 106-principle audit, create a separate `PSYCHOLOGY_AUDIT.md` with one compact row per principle.
- Never let psychology become manipulation. Sticky means emotionally useful and repeatedly valuable, not addictive, noisy, or coercive.

Applied psychology themes for StyleMeUp:

- Progressive disclosure: department grid first, item grid second.
- Endowed progress: starter selections make the closet feel begun before upload.
- Peak-end rule: first signature is the memorable peak after low-effort inputs.
- Commitment and consistency: marking owned pieces makes the first look feel personal.
- Recognition over recall: users tap visual categories instead of naming garments.
- Cognitive load reduction: one primary action and one recommendation at a time.
- Goal-gradient effect, quietly: foundation → one piece → first look, using check states only.
- Zeigarnik effect, gently: after saving the first look, reveal `add one real piece →`.
- Processing fluency: restrained grids, familiar garment categories, short copy.
- Personal relevance: derive taste notes only from actual selections and saved pieces.
- Labor illusion, editorially: short craft states like `reading the piece...` and `finding the weight...`.
- Fresh start effect: seasonal resets such as `first cold morning.` later in the product.

Features that came from the psychology pass:

- Foundation Receipt: a value receipt after starter selections, before persona.
- First Signature Peak: ceremonial proof that the app can produce taste.
- One Piece Capture Gift: upload is earned by promising one concrete pairing.
- Closet Foundation Path: quiet milestones for foundation, one piece, first look.
- Tomorrow's Dressing Room: exactly one useful recommendation for day two.
- Discover Match Loop: Magazine cards can say `you have the base.` when true.
- Private Taste Notes: observational notes, never personality inference.
- Why This Works: one concise rationale per look.
- One Look, Three Ways: variants for work, going out, and weekend.
- Editorial Labor Moment: visible craft states with a strict time budget.
- Season Reset: a timely resurfacing prompt for weather or season changes.
- User-Set Reminder: optional only after first saved look.
- Closet Rooms: work rail, weekend rail, evening rail.
- Premium Archive Forecast: paid layer framed as archive access, not countdown scarcity.
- Care And Resurrection: revive dormant items with no guilt.

Rejected psychology patterns:

- fake urgency
- streak pressure
- social comparison
- public ranking
- confetti or dopamine fireworks
- manipulative paywall pressure
- personality labeling from weak signals
- noisy onboarding quizzes

## Starter Pack Direction

The starter pack is a Sanctuary surface. It should feel like a quiet wardrobe tray.

Current foundation categories:

- t-shirts
- jeans
- shoes
- accessories
- jackets
- boots

The first grid should be calm and balanced. Six categories give a useful wardrobe spread and a stable visual rhythm. The item grid appears only after a category is chosen so the tap has an obvious outcome.

Implemented revision: audience identity now comes before the category grid. The sequence should feel like a private fitting, not a demographic form:

1. ask whether the user is dressing from a man, woman, or non-binary foundation
2. show the starter foundation grid after that choice
3. let the user enter a category and mark pieces
4. route back to the foundation grid until the required closet base is complete
5. show the receipt only once the base is strong enough for useful recommendations

Minimum foundation direction:

- current V1 gate: require 16 total selected foundation pieces before the receipt
- return the user to the main category grid if they have only marked one category
- show the quiet note `the foundation needs a little more weight.`
- keep the older four-per-core-category idea as a possible stricter V2 recommendation-quality gate

The reason is practical, not gamified: the system needs enough real inputs to combine outfits without feeling thin or repetitive. Do not frame this as a streak, badge, or checklist challenge. Frame it as `the foundation needs a little more weight.`

Current baseline behavior:

- web uses URL-backed category and item selection so clicks behave like normal links
- selected foundation IDs travel from starter pack to receipt to persona to first signature
- selecting too few pieces returns to the department grid instead of advancing
- the first signature uses the selected foundation rather than seeded demo defaults
- visual polish is intentionally V2; the current goal is reliable flow and credible product logic

The visual language should remain austere:

- true white canvas
- thin black or smoke borders
- no stock photos
- abstract garment silhouettes are acceptable for V1 placeholders
- Signal Red only for selected marks

## Personalization Direction

Personalization must be honest. Only reflect:

- starter selections
- identity choice: man, woman, or non-binary
- persona choice
- saved looks
- captured pieces

Do not infer personality. Do not say the app “knows” the user. Taste notes should be observational and private:

- `you keep choosing denim.`
- `dark pieces keep returning.`
- `one real piece is shaping the closet.`

## First Signature Direction

The first signature is the first peak moment. It can use the Magazine register, but the lead-in remains Sanctuary.

After persona pick, the app should prepare the first signature quietly. The UI should never say “AI”. If generation takes time, use editorial craft states:

- `reading the foundation...`
- `finding the weight...`
- `cutting the silhouette...`

The first signature should not appear until the foundation has enough material to make the recommendation credible. If the user tries to continue too early, keep them in Sanctuary and return them to the foundation grid with a quiet missing-state note.

Persona pick must be truly selectable. `work`, `going out`, and `weekend` are one-tap signals that should alter the first signature composition. If generation fails or no LLM endpoint is configured, deterministic fallback is allowed, but it should still reflect the selected persona and starter foundation.

Current fallback direction:

- `work` should prefer structured outerwear, lighter shirts, dark denim, and grounded shoes
- `going out` should prefer black, charcoal, navy, burgundy, and dark footwear when selected
- `weekend` should prefer softer cotton, washed denim, and low easy shoes
- this is a bridge until the real endpoint is connected, not a replacement for the recommendation model

The model endpoint should receive the user-selected foundation and return one strong first recommendation first. Later variants can add casual and office alternates, then daily/weekly looks informed by weather.

## Discover / Magazine Direction

Discover is the Magazine register and should never feel blank. If the real Magazine pipeline is not connected, the screen still needs a credible editorial state using existing issue content from `issues/`, especially `vol-18-corduroy.md`.

Discover cards should have obvious click/tap behavior:

- trend feature opens an editorial detail
- card with owned base can say `you have the base.`
- `build from yours` routes into a Sanctuary builder
- no fake content, no placeholder stock, no empty feed

Current implementation note:

- `issues/index.json` is empty, so V1 Discover uses typed local content derived from `issues/vol-18-corduroy.md`.
- Full assets are not present in `assets/`, so the current visual treatment is editorial silhouettes plus real issue copy.
- The cover, trend cards, and curator cards are clickable and have detail pages.

## Future Ideas

- Branch starter inventory by identity without making the choice feel loaded.
- Add seasonal filters after the first successful look, not during onboarding.
- Let one anchor piece create three variants: work, going out, weekend.
- Build closet rooms later: work rail, weekend rail, evening rail.
- Add care/resurrection moments for dormant items: `unworn, not wrong.`
- Add optional reminders only after first saved look: `today's look is ready.`

## Hard Bans To Preserve

- no emoji
- no “Powered by AI”
- no “magic”, “smart”, “intelligent”, or “amazing”
- no fake urgency
- no streak spam
- no confetti
- no Pinterest/masonry behavior
- no social-feed pressure
- no noisy onboarding
