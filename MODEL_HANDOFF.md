# StyleMeUp Model Handoff

Status: living context for Codex, Gemini, Claude, or any other model continuing the work.
Last updated: 2026-05-04 02:38 PM ET

## Product Frame

StyleMeUp is a confidence engine disguised as a wardrobe app. The first-week loop is:

1. mark what you own
2. receive a foundation receipt
3. choose a dressing context
4. receive a first signature
5. capture one real piece
6. return for one useful look

`DESIGN.md` is the contract. `AGENTS.md` defines implementation rules. If they conflict, `DESIGN.md` wins.

## Workflow Docs

- `NEXT_STEPS.md` is the living execution plan. Always check it first for the active queue, recent completions, and blockers.
- `CHANGE_LOG.md` is the dated history of what changed, why it changed, and what follow-up it created.
- `MODEL_HANDOFF.md` stays compact. It is for current state, major decisions, verification status, and complex breakpoint context, not for the full running history.
- Before every push or handoff:
  - confirm the work is reflected in `CHANGE_LOG.md`
  - update `NEXT_STEPS.md` to match the new truth
  - refresh this file if the project state meaningfully changed

## Current Build State

- Expo managed workflow with Expo Router, TypeScript strict mode, Zustand, MMKV, Skia, Reanimated, and React Query.
- First-week state lives in `lib/firstWeek.ts` and persists through Zustand/MMKV/localStorage.
- Starter pack UI lives in `components/StarterPack/StarterPackExplorer.tsx`.
- Onboarding route order is currently cover → identity pick → starter pack → foundation receipt → persona pick → first signature → capture prompt → Closet / Discover.
- A new visible-browser QA pass is in progress. Shared navigation and narrow-width wrapping improved, but a shared web framing issue is still open.

## Major Decisions So Far

- The app uses two registers:
  - Magazine: black `void`, cinematic, monumental uppercase, first-signature peak.
  - Sanctuary: white `paper`, private, lowercase italic headlines, onboarding and closet.
- Magazine Weekly agent orchestration is now specified as docs-first:
  - `MAGAZINE_AGENT_SPEC.md` defines the weekly Discover production workflow.
  - `AI_ORCHESTRATION.md` defines the general orchestrator/executor pattern.
  - Vercel AI is the chosen orchestration layer.
  - Supabase remains the memory, storage, issue archive, and publish-state layer.
  - The orchestrator is deterministic TypeScript, while executors are narrow model calls with structured outputs.
  - Executors do not talk to each other; they pass records through the orchestrator and stop for human approval before publishing.
- Starter pack became a two-level Sanctuary flow:
  - first level: 2x3 foundation grid
  - second level: focused item grid for the selected category
- Starter categories are now `t-shirts`, `jeans`, `shoes`, `accessories`, `jackets`, and `boots`.
- A quiet identity pick now happens before starter categories: `man`, `woman`, `non-binary`. It stores `audienceIdentity` but does not yet branch inventory by identity.
- The starter pack uses URL-backed interaction on web so clicks survive React Native Web pressability quirks.
- URL-backed starter selections are now synced into Zustand when the URL selection changes.
- `begin →` on persona pick now starts a first-signature request before routing to the first signature, and the deterministic fallback uses selected foundation pieces where possible.
- Foundation receipt, persona pick, and first signature now carry `selected` through the URL so web refreshes and link clicks do not lose the user foundation.
- The first-signature fallback ranks selected pieces by persona tone. For example, `going out` prefers black, charcoal, navy, and dark footwear from the actual selected foundation before lighter basics.
- Foundation receipt is gated behind 16 total selected starter pieces for this pass.
- Discover uses typed local content derived from `issues/vol-18-corduroy.md` because `issues/index.json` is empty and no Magazine assets are present yet.

## Current Implementation Notes

- `StarterPackExplorer` exports starter item data, shape renderers, category helpers, and URL parsing helpers.
- Web category and item cards use native `<a>` elements for reliability.
- Native category and item cards use `Pressable`.
- `BottomNavigation` now keeps full labels visible and uses a small active marker instead of single-letter markers.
- `FoundationReceipt` reads `selected` from route params and writes it to first-week state.
- `requestFirstSignature` in `lib/firstWeek.ts` calls `EXPO_PUBLIC_STYLEMEUP_LLM_ENDPOINT` when configured; otherwise it falls back to deterministic local templates.
- The first-signature endpoint receives `audienceIdentity`, `persona`, `starterSelections`, and structured `starterPieces`. It can return a top-level look, `{ look }`, or `{ firstSignature }`.
- Zustand persist is versioned at `2`; migration clears the exact old four-piece demo seed so existing browser sessions do not keep mystery defaults.
- Web first-signature save uses `?saved=1`, then reveals `add one real piece →`.
- Capture keeps the editorial loading sequence on native. On web, the shutter routes directly to `?stage=result` for baseline click reliability; V2 can restore route-backed editorial timing once Expo web effects are stable there.
- Closet consumes `?captured=1` and persists the placeholder captured piece into first-week state.
- No user-facing copy should mention “AI”, “magic”, “smart”, “intelligent”, or any banned §4 wording.

## Recent User Feedback

- Starter category taps were counterintuitive because users had to scroll down to see items.
- The first grid should act like a department grid; tapping `t-shirts` should open the t-shirt grid immediately.
- Four categories fit well visually, but the product needs six for balance and coverage.
- Keep at least `t-shirts`, `jeans`, `shoes`, and `accessories` for men.
- Add onboarding language or controls for men/women.
- Add jackets and another category to make an even six.
- Make sure category item selection is actually clickable and stored in app memory.
- Add an LLM call after the user clicks `begin →`.
- Maintain model handoff docs and design philosophy docs after updates.
- Newer onboarding feedback: `begin →` should first ask audience identity: man, woman, or non-binary / not binary.
- After audience identity is selected, then show the starter foundation category grid.
- Selecting a few t-shirts and tapping `continue →` should not jump straight to the receipt if the closet foundation is incomplete.
- The app should route back to the main foundation grid until the user has enough in each required category.
- Current implemented requirement: 16 total selected starter pieces before the receipt and first-signature path. Earlier discussion explored four per core category, but the implemented plan chose the flexible 16-piece gate for this pass.
- Persona pick is now web-clickable and preserves the selected persona into first signature.
- First signature still uses deterministic fallback when no endpoint is configured, but it now uses selected foundation pieces and persona tone preferences rather than mystery defaults.
- Discover now renders real Vol. 18 corduroy Magazine copy, clickable cover/card links, detail pages, and `you have the base.` match actions when starter selections overlap.

## Verification Snapshot

- Last known good checks after the onboarding, capture, and Discover stabilization pass:
  - `npm run lint` passes with one generated Expo warning in `.expo/types/router.d.ts`.
  - `npx tsc --noEmit` passes.
  - `git diff --check` passes.
- Full headless Chrome CDP verification on `http://localhost:8081` from clean `localStorage`:
  - `/` `Begin.` routes to `/onboarding/identity`.
  - identity renders `man`, `woman`, `non-binary`; `man` routes to starter pack.
  - starter pack renders all six categories: `t-shirts`, `jeans`, `shoes`, `boots`, `jackets`, `accessories`.
  - every category opens a focused item grid and selected item links persist through the URL/store handoff.
  - selecting only t-shirts and tapping `continue →` returns to the main starter grid with `the foundation needs a little more weight.`
  - selecting 16 total pieces opens `your foundation.`
  - `show the first →` routes to persona pick while preserving the selected foundation.
  - `going out` is selectable and `begin →` routes to first signature.
  - first signature uses selected pieces: `black tee`, `raw indigo jean`, `black chelsea`.
  - `SAVE TO CLOSET` reveals `saved.` and `add one real piece →`.
  - capture preface, camera surface, result, and save-to-Closet route all work on web.
  - Closet receives the captured piece state and shows `one piece is real now.`
  - Discover renders Vol. 18 corduroy and the cover opens `/discover/vol-18-corduroy`.
- New partial QA result from the current visible-browser pass:
  - bottom navigation labels are now readable across screens
  - Closet milestone/actions and starter footer wrap more gracefully on narrow widths
  - cover CTA is less corner-cramped
  - remaining issue: headless Chrome still shows bottom whitespace on the cover and slight left-edge offset / right-edge clipping on some screens, which points to a shared web layout/framing bug

## Immediate Next Checks

- `NEXT_STEPS.md` is now the primary queue. Return to it first at the start of each substantial work session.
- Manual browser click testing is still useful in the visible browser for pointer feel and layout, but the baseline route/click flow is verified in headless Chrome.
- Review `MAGAZINE_AGENT_SPEC.md` and `AI_ORCHESTRATION.md` before implementing any Vercel AI or Supabase workflow code.
- Decide whether the identity pick should branch starter inventory or only seed future recommendation tone.
- Connect the real LLM endpoint through `EXPO_PUBLIC_STYLEMEUP_LLM_ENDPOINT`; no key should be committed.
- Add real Vol. 18 assets when generated/uploaded. Current Discover visuals are editorial silhouettes from real issue copy, not final Magazine imagery.



# Growth.Design Psychology Audit For StyleMeUp

## Summary
- Audit all 106 Growth.Design psychology principles against StyleMeUp with the chosen lens: **first-week habit formation**.
- Output will be an **audit + shortlist**, not code: a compact principle-by-principle mapping, then a ranked set of ideas we can debate before implementation.
- Source set: Growth.Design’s four groups: **Information, Meaning, Time, Memory**. Product constraints: `DESIGN.md`, `AGENTS.md`, current onboarding, Discover, Closet, Capture, Looks, and starter-pack flow.

## Audit Method
- For each principle, capture:
  - `principle`
  - `plain meaning`
  - `StyleMeUp application`
  - `best screen/moment`
  - `stickiness mechanism`
  - `brand risk`
  - `priority: keep / maybe / reject`
- Score each idea on:
  - first-week return potential
  - luxury-brand fit
  - implementation effort
  - ethical comfort
- Hard reject anything that violates `DESIGN.md`: fake urgency, cheap gamification, social-feed pressure, streak spam, confetti, “AI” language, noisy onboarding, or manipulative paywall pressure.

## Shortlist Criteria
- Prioritize ideas that help a new user:
  - feel understood before uploading much
  - see value in under 60 seconds
  - return the next day with a clear reason
  - build a private closet identity
  - experience one memorable peak moment
- Expected shortlist size: **10 to 15 ideas**, grouped into:
  - onboarding hooks
  - first closet investment
  - daily return ritual
  - Discover-to-Closet loops
  - premium-worthy moments

## Deliverable Shape
- Start with a brief synthesis of the strongest psychology themes for StyleMeUp.
- Then provide the one-by-one audit grouped by Growth.Design category.
- End with a ranked shortlist:
  - `P0`: should likely build soon
  - `P1`: promising, needs design
  - `P2`: save for later
  - `Rejected`: psychologically valid but off-brand or risky

## Assumptions
- No code changes during this pass.
- We optimize for first-week habit, not paid conversion yet.
- “Sticky” means emotionally useful and repeatedly valuable, not addictive or noisy.
- The starter pack and first-signature flow are the main first-week surfaces unless the audit reveals a stronger target.

Yes. Here’s what we understand so far.

StyleMeUp should be sticky through **quiet personal value**, not cheap retention mechanics. The app is a confidence engine: it should help someone feel better dressed in the first minute, then give them a tasteful reason to return tomorrow.

The first-week psychology should center on a few strong loops: **start with what they already own**, give them a memorable **first signature**, ask for one small investment like capturing a single garment, then turn that into tomorrow’s dressing ritual. The main Growth.Design principles that fit us are progressive disclosure, reciprocity, endowment effect, peak-end rule, fresh start effect, investment loops, picture superiority, decision-fatigue reduction, and curiosity gap.

The things we should avoid are just as important: no streak pressure, no fake urgency, no public social proof, no “everyone is wearing this,” no confetti, no “AI” language, no manipulative paywall framing. Those may be sticky in other apps, but they would make StyleMeUp feel cheap.

Our strongest current shortlist is:

1. **Foundation Receipt**: after starter pack, show what the user already has and what it unlocks.
2. **First Signature Peak**: make the first generated look feel like the emotional proof of the product.
3. **One Piece Capture Gift**: ask for one real garment and instantly style it.
4. **Tomorrow’s Dressing Room**: day-two return with one calm recommendation.
5. **Closet Foundation Path**: basics marked, one item captured, one look saved.
6. **Discover Match Loop**: editorial trends connect back to pieces the user already owns.



So the real insight is: the app becomes stellar if it feels like it is **remembering the user’s taste and reducing their morning uncertainty**, not if it behaves like a habit app.






Yes. I’d think of each shortlisted item as a **feature package**, not a single button. The best ones form a spine: starter pack → first signature → one captured garment → tomorrow’s look.

**1. Foundation Receipt**
After starter pack, show a quiet summary of what the user already has.

Feature ideas:
- **“your foundation.”** A Sanctuary receipt showing selected basics grouped by category.
- **Unlocked outfit count**: “12 looks begin here.” Not gamified, just useful.
- **Missing anchor**: “one dark shoe would sharpen this.” Gentle, not shamey.
- **Foundation palette**: extracted wardrobe colors shown as garment swatches.
- **Continue CTA**: “show me the first one →”

Why it sticks: the user feels ownership before doing work.

**2. First Signature Peak**
Make the first generated outfit feel like the product’s first emotional proof.

Feature ideas:
- **Cinematic first reveal** in Magazine register.
- **One named look**: “thursday.” / “the dark column.” / “off-duty.”
- **Garment overlap composition** instead of a flat list.
- **Why it works** line: “white cotton cuts the denim weight.”
- **Save to closet** as the only action.
- **After-save line**: “tomorrow, one real piece.”

Why it sticks: peak-end rule. They remember the first “oh, this gets me” moment.

**3. One Piece Capture Gift**
Ask for exactly one real garment after the first signature, then reward it instantly.

Feature ideas:
- **“one piece.”** A post-reveal prompt asking for one actual item.
- **Camera result card**: cutout + editorial caption.
- **Instant pairing**: “wear it with the dark denim.”
- **One-piece upgrade**: first signature updates with the captured garment.
- **Save confirmation**: “owned.” or “in your closet.”

Why it sticks: the user invests once and immediately sees the app improve.

**4. Tomorrow’s Dressing Room**
A day-two surface that gives one calm reason to return.

Feature ideas:
- **Morning home card**: “today: one clean line.”
- **One look only**, no carousel.
- **Weather/occasion hook later**, but MVP can use persona pick.
- **“use this” / “not today”** as quiet actions.
- **Return memory**: if they saved yesterday, use that piece tomorrow.

Why it sticks: reduces decision fatigue at the exact morning moment.

**5. Closet Foundation Path**
A first-week path, but not a streak.

Feature ideas:
- **Three quiet milestones**: foundation marked, one piece captured, one look saved.
- **No badges. No confetti.** Just a small “foundation complete.”
- **Closet header evolves**: “cotton, denim, leather. the first foundation.”
- **Next best action** shown in Closet: “capture one piece.”
- **Completion state** unlocks a cleaner Closet view.

Why it sticks: Zeigarnik effect without cheap gamification.

**6. Discover Match Loop**
Every editorial trend should connect back to what the user owns.

Feature ideas:
- **“you have the base.”** Under a trend card when starter items match.
- **Owned-piece bridge**: “start with black denim.”
- **Trend-to-look action**: “build from yours.”
- **Closet-aware Discover cards**: same article, personalized entry point.
- **No shopping-first behavior** until owned options are exhausted.

Why it sticks: Discover stops being content and becomes useful taste direction.

**7. Private Taste Notes**
The app quietly names patterns in the user’s choices.

Feature ideas:
- **Taste note chips**: “dark denim,” “white cotton,” “low-profile shoes.”
- **Evidence-based copy**: “you keep choosing black leather.”
- **Closet insight panel**: “your base is mostly cool, dark, structured.”
- **Never personality claims** like “you’re a minimalist.”
- **Use notes to tune future looks.**

Why it sticks: confirmation bias, but grounded in actual behavior.

**8. Why This Works**
Small explanations that build trust.

Feature ideas:
- **One-line styling rationale** on generated looks.
- **Garment relationship copy**: “soft tee, rigid denim.”
- **No teaching voice.** More editor than tutor.
- **Tap-to-expand later**, but default stays short.
- **Use after save/capture/recommendation.**

Why it sticks: the user learns the product has taste, not randomness.

**9. One Look, Three Ways**
A single owned foundation styled across contexts.

Feature ideas:
- **Work / going out / weekend** variants from persona pick.
- **Same hero garment, three compositions.**
- **One saved as default.**
- **No infinite options.** Three is enough.
- **Great for Closet or Looks tab.**

Why it sticks: usefulness multiplies without asking for more data.

**10. Editorial Labor Moment**
Make waiting feel like craft.

Feature ideas:
- **Capture loading state**: “reading the piece...”
- **Micro-caption progression**: “cotton weight.” → “collar line.” → “color cast.”
- **Max 1.2s, never a spinner.**
- **Reduced-motion fallback: opacity only.**
- **Result feels like a studio contact sheet.**

Why it sticks: the app feels deliberate, not broken.

**11. Season Reset**
A soft fresh-start ritual.

Feature ideas:
- **“first cold morning.”** seasonal closet prompt.
- **Resurface dormant items** without shame.
- **New issue in Discover tied to season.**
- **Closet rail: “now.”**
- **Later: weather/calendar integration.**

Why it sticks: natural return moments already exist in the user’s life.

**12. User-Set Reminder**
Retention without nagging.

Feature ideas:
- **Optional dressing reminder** after the first saved look.
- **User chooses time**, not the app.
- **Copy stays useful**: “today’s look is ready.”
- **No daily streak language.**
- **Only send when there is a real recommendation.**

Why it sticks: self-initiated triggers beat random push spam.

**13. Closet Rooms**
A future organization model.

Feature ideas:
- **Work rail / weekend rail / evening rail.**
- **Rooms are generated from saved looks and persona.**
- **Visual rail layout instead of folders.**
- **Each room has one recommended next piece.**
- **Better for V2 once closet has depth.**

Why it sticks: memory palace, but in wardrobe form.

**14. Premium Archive Forecast**
A paid-worthy editorial layer later.

Feature ideas:
- **“returning soon.”** forecasted trend issues.
- **Owned match score**: “you already have 2 of 3.”
- **Archive resurrection**: old item becomes relevant again.
- **Premium unlock framed as deeper editorial access.**
- **No fake scarcity or countdowns.**

Why it sticks: aspiration plus utility, without cheap paywall tricks.

**15. Care And Resurrection**
Revive things the user forgot they owned.

Feature ideas:
- **“unworn, not wrong.”** dormant item resurfacing.
- **One styling proposal for a neglected piece.**
- **Repair/care note if relevant.**
- **Seasonal revival in Discover.**
- **No sustainability lecture.**

Why it sticks: endowment effect. The app increases value of what they already own.

My instinct: build the first spine as **Foundation Receipt → First Signature Peak → One Piece Capture Gift → Tomorrow’s Dressing Room**. That gives us a real first-week loop instead of isolated nice screens.
# StyleMeUp First-Week Experience Spec

## Summary
Build the first-week product around one emotional loop: **mark what you own → receive a signature → capture one real piece → return tomorrow for one useful look**. The experience must feel private, editorial, and inevitable, never gamified. V1 should prioritize the first six features; the remaining features become later layers once the core loop works.

## Core Interaction Spine
1. **Starter Pack → Foundation Receipt**
   - After `continue →`, do not jump straight to persona pick. Insert a Sanctuary receipt screen.
   - Header: `your foundation.` Subcopy: `cotton, denim, leather. enough to begin.`
   - Show selected categories as quiet rows: `t-shirts 3`, `jeans 2`, `shoes 1`.
   - Primary CTA: `show the first →`.
   - Friction solved: user sees value before giving more input.

2. **Persona Pick → First Signature**
   - Persona remains one-tap: `work`, `going out`, `weekend`.
   - Selection changes the first signature title and outfit composition.
   - No extra questions. No typing.
   - Friction solved: personalization without quiz fatigue.

3. **First Signature Peak**
   - Magazine screen remains the ceremonial peak.
   - Add one line under outfit: `why it works` in tiny editorial copy, e.g. `white cotton cuts the denim weight.`
   - Add one primary action: `SAVE TO CLOSET`.
   - After save, show `saved.` for 1.2s, then reveal a text action: `add one real piece →`.
   - Friction solved: user gets proof first, effort second.

4. **One Piece Capture Gift**
   - Route user into Capture with a preface state: `one piece.` / `start with the one nearest you.`
   - Capture states: viewfinder → `reading the piece...` → result.
   - Result shows cutout, caption, and immediate pairing: `wear it with dark denim.`
   - Primary CTA: `SAVE TO CLOSET`; secondary text action: `not now`.
   - Friction solved: the app earns the upload by promising one concrete return.

5. **Closet Foundation Path**
   - Closet header evolves based on progress:
     - starter only: `the first foundation.`
     - one captured piece: `one piece is real now.`
     - first look saved: `your closet has begun.`
   - Show three quiet milestones: `foundation`, `one piece`, `first look`.
   - Use check states only; no badges, streaks, points, or celebration.
   - Friction solved: the user always knows the next best action.

6. **Tomorrow’s Dressing Room**
   - Add a day-two Sanctuary surface inside Closet or Looks.
   - Header: `today.`
   - Show exactly one recommendation using saved/captured data.
   - Actions: `wear this`, `not today`, `change the mood`.
   - Friction solved: no decision buffet in the morning.

## Feature Requirements By Shortlist
- **Discover Match Loop:** each Magazine card can show `you have the base.` if starter/captured items match; CTA `build from yours` routes to a Sanctuary look builder.
- **Private Taste Notes:** derive notes only from user actions, e.g. `you keep choosing dark denim.` Never infer personality.
- **Why This Works:** every generated look gets one concise rationale; max one sentence, no teaching tone.
- **One Look, Three Ways:** later Looks detail can show `work`, `going out`, `weekend` variants for one anchor piece.
- **Editorial Labor Moment:** replace generic loading with visible craft states: `reading the piece...`, `finding the weight...`, `cutting the silhouette...`; total max 1.2s.
- **Season Reset:** later Discover/Closet prompt: `first cold morning.` with one resurfaced garment.
- **User-Set Reminder:** optional only after first saved look; copy: `today's look is ready.` No streaks.
- **Closet Rooms:** later organize into `work rail`, `weekend rail`, `evening rail`.
- **Premium Archive Forecast:** later paid layer; use editorial archive framing, never countdown scarcity.
- **Care And Resurrection:** later dormant item surface: `unworn, not wrong.` One styling suggestion, no guilt.

## State And Interfaces
- Add first-week state model:
  - `starterSelections`
  - `persona`
  - `foundationReceiptSeen`
  - `firstSignatureSaved`
  - `capturedPieces`
  - `savedLooks`
  - `tasteNotes`
  - `lastDressingRoomDate`
- Store locally with Zustand/MMKV first; keep shape portable for Supabase later.
- Generated copy must come from deterministic local templates for V1.
- All screens must declare `@register`; no screen mixes Magazine and Sanctuary.

## Design Rules
- Sanctuary screens use `--paper`, lowercase italic headlines, quiet copy.
- Magazine screens use `--void`, cinematic composition, and only First Signature may use `--moment`.
- One primary action per screen.
- No emoji, no “AI”, no “magic”, no fake scarcity, no streak language.
- Motion: 250ms micro, 400ms page, 1.3s Vanishing only where garment transformation is the point.
- Empty/loading states must be editorial, never blank.

## Test Plan
- Onboarding path: starter pack → receipt → persona → first signature → save → capture prompt.
- Verify user can skip capture and still land in Closet with a useful next action.
- Verify selecting different personas changes first signature content.
- Verify `continue`, `SAVE TO CLOSET`, and `add one real piece →` route correctly.
- Verify no screen has more than one primary action.
- Verify copy passes bans from `DESIGN.md §4`.
- Verify VoiceOver labels exist for receipt items, look cards, capture result, and progress states.

## Assumptions
- V1 builds P0 spine first: Foundation Receipt, First Signature Peak, One Piece Capture Gift, Closet Foundation Path, Tomorrow’s Dressing Room, Discover Match Loop.
- P1/P2 features are specified enough for design exploration but should not block V1.
- Capture can use placeholder cutout logic until real camera/segmentation is connected.
- Personalization must be honest: only reflect selections, saved looks, or captured pieces.
