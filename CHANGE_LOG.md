# StyleMeUp Change Log

Historical note: entries below 2026-05-04 02:03 PM ET are backfilled from git history and `MODEL_HANDOFF.md`. They capture milestone-level changes and decisions, not every small edit.

## 2026-05-18 (Onboarding redesign Phases 4/3/5 + strategy doc)

- Changed:
  - Rebuilt the first-fit audience picker as a Magazine cover: void canvas, three full-bleed hero columns (man | woman | non-binary) from `wardrobe-basics/firstfit/`, captions sourced from `lib/firstFitHeroes.ts` — fixing the bug where man and woman shared the same caption.
  - Replaced the Signal-red selection checkmark with a register flip: marked variant tiles ink to void with paper type (DESIGN.md §1.5), 180ms web transition.
  - Replaced the 3-thumbnail category preview row with one editorial hero photograph per category, card chrome removed; added `sizing.starterCategoryHeroHeight` token.
  - Wrote `PRODUCT_STRATEGY.md` — user gaps, retention mechanics, feature + technical differentiation, 6-week sequence.
  - Track B: added plain-English openers to all 12 principles in `learning/the-edit-architecture/principles.md` and a 50-term jargon decoder appendix to `glossary.md`.
  - Restored the paused Supabase project (`drip` was INACTIVE — all public image URLs and the Discover API were down) and re-uploaded the regenerated single-view `men/black-leather-jacket-men.png`.
- Why:
  - The onboarding screens were the weakest surface in the product and the redesign assets (hero plates, expanded photo catalog, claude.design layouts) were already paid for and waiting.
  - The strategy doc grounds the next build phases in what the code actually contains.
- Affected:
  - `screens/Onboarding/Identity.tsx`
  - `components/StarterPack/StarterPackExplorer.tsx`
  - `tokens/sizing.ts`
  - `PRODUCT_STRATEGY.md`, `NEXT_STEPS.md`
  - `learning/the-edit-architecture/principles.md`, `learning/the-edit-architecture/glossary.md`
- Verification:
  - `npx tsc --noEmit` clean after each phase; phases committed separately (`49d062a`, `fbcd309`, `03f4334`).
  - Public image URLs verified 200 after project restore (firstfit hero + re-uploaded jacket).
  - Pending: human visual pass on device-sized Expo web (photos render full-bleed; SVG-fallback scale on `categoryHero` may need a nudge).
- Next:
  - Sid decision: Codex editorial-list vs photo-forward for "what you already own."
  - expo-image migration for remote photos; real camera capture; daily look ritual (see `PRODUCT_STRATEGY.md` §5).

## 2026-05-14 (Magazine new issue badge)

- Changed:
  - Added persisted `seenMagazineIssueSlug` state to track whether the latest remote Magazine issue has been opened.
  - Added a Discover bottom-navigation badge dot when the public the-edit API returns an unseen remote issue.
  - Added a `new issue live.` badge on the Discover hero for unseen remote issues.
  - Mark remote issues seen when their detail page is opened, while keeping local Vol. 18 fallback unbadged.
  - Fixed a foundation receipt maximum-update-depth loop caused by repeatedly syncing a freshly parsed `selected=` query array into persisted first-week state.
- Why:
  - The app needed a visible user-facing signal when a new Magazine issue is published from the-edit.
  - The badge should be tied to the public remote issue, not to fallback content or pipeline/admin state.
- Affected:
  - `components/BottomNavigation/BottomNavigation.tsx`
  - `lib/firstWeek.ts`
  - `lib/magazineFeed.ts`
  - `screens/Discover/Discover.tsx`
  - `screens/Discover/MagazineDetail.tsx`
  - `NEXT_STEPS.md`
  - `MODEL_HANDOFF.md`
- Verification:
  - `npx tsc --noEmit`
  - `npm run lint`
  - `git diff --check`
  - Browser smoke test confirmed remote Vol. 19, signed image elements, new-issue badge, mark-seen behavior, and fallback Vol. 18 with no badge under an invalid API root.
  - Full onboarding browser run confirmed partial receipt fallback, 16-item receipt, first signature from selected foundation, capture-to-Closet, and Discover remote issue with no page or console errors.
- Next:
  - do a human visual pass on the running Expo web app at `http://localhost:8010`

## 2026-05-07 (Remote Magazine Discover + learning update)

- Changed:
  - Added React Query at the app root.
  - Added `lib/magazineFeed.ts` to fetch the latest published issue from the-edit's Vercel API and fall back to local Vol. 18 content.
  - Extended `lib/magazineIssue.ts` issue/surface types for remote image URLs, history, why-now, source summary, trend cards, and curator cards.
  - Reworked Discover into a Magazine experience: latest-issue hero, trend grid, concise writeups, `the return.`, `why now.`, and `you have the base.` match loop.
  - Reworked `/discover/[slug]` detail pages to read the remote/fallback issue and show history, why-now, image/detail, and match CTA.
  - Tightened the web app shell so the root/background frame stays black instead of showing the old white band under Magazine screens.
  - Appended current senior PM / AI PM interview practice to the learning docs without overwriting existing dirty work.
- Why:
  - StyleMeUp was still showing a local issue fixture while the-edit had begun publishing real Magazine issues.
  - The user should see editorial trend content and closet-relevant actions, not pipeline runs/costs.
- Affected:
  - `app/_layout.tsx`
  - `lib/magazineFeed.ts`
  - `lib/magazineIssue.ts`
  - `screens/Discover/Discover.tsx`
  - `screens/Discover/MagazineDetail.tsx`
  - `learning/PM_INTERVIEW_QA.md`
  - `learning/AI_PM_INTERVIEW_QA.md`
  - `learning/HIRING_MANAGER_MODE.md`
  - `NEXT_STEPS.md`
  - `MODEL_HANDOFF.md`
- Verification:
  - `npx tsc --noEmit` passes.
- Next:
  - run `npm run lint`
  - run Expo web and visually verify `/discover`
  - simulate API failure and confirm Vol. 18 fallback

## 2026-05-04 02:38 PM ET

- Changed:
  - Started the first visible-browser QA pass on the live Expo web app for the current app checkpoint.
  - Updated the shared bottom navigation so all destinations keep readable labels and use a cleaner active-state marker.
  - Updated Closet progress/actions to wrap more gracefully on narrow mobile widths.
  - Updated the starter-pack footer so the selection summary and `continue` CTA can coexist without clipping on smaller widths.
  - Nudged the cover CTA inward for a calmer first-screen composition.
  - Logged a remaining shared web layout issue after verification:
    - white band below the cover
    - slight left-edge offset / right-edge clipping on some screens in headless Chrome
- Why:
  - The first-week loop was structurally stable, but the UI still had shared chrome problems that made the product feel more prototype-like than intentional.
  - Fixing shared navigation and footer behavior first gives the biggest UX return before spending time on copy and motion polish.
  - The remaining framing issue needs to be tracked explicitly because it affects multiple screens and should be treated as a shared-layout problem, not isolated screen bugs.
- Affected:
  - `components/BottomNavigation/BottomNavigation.tsx`
  - `components/StarterPack/StarterPackExplorer.tsx`
  - `screens/Closet/Closet.tsx`
  - `screens/Onboarding/Cover.tsx`
  - `app/_layout.tsx`
  - `NEXT_STEPS.md`
- Next:
  - resolve the shared web framing issue in the app shell
  - rerun the visible-browser QA pass after the shell fix
  - then move on to persistence checks and screen-level polish

## 2026-05-04 02:03 PM ET

- Changed:
  - Added `NEXT_STEPS.md` as the living execution plan for the repo.
  - Added `CHANGE_LOG.md` as the dated record of changes, decisions, and follow-up implications.
  - Updated `MODEL_HANDOFF.md` so future sessions know the role of `NEXT_STEPS.md`, `CHANGE_LOG.md`, and `MODEL_HANDOFF.md`.
  - Formalized the current roadmap as two parallel tracks: app checkpoint completion and separate Magazine agent repo creation.
- Why:
  - We need a durable operational rhythm that makes it obvious what was implemented, why it was done, what remains next, and where a future model or engineer should look first.
  - We want history and reasoning preserved without turning `MODEL_HANDOFF.md` into an unreadable running diary.
  - The project is now complex enough that planning context, handoff context, and historical reasoning need distinct homes.
- Affected:
  - `NEXT_STEPS.md`
  - `CHANGE_LOG.md`
  - `MODEL_HANDOFF.md`
- Next:
  - Keep `NEXT_STEPS.md` current after every substantial work session.
  - Append to `CHANGE_LOG.md` whenever features, architecture, workflow rules, or priorities change.
  - Refresh `MODEL_HANDOFF.md` at major breakpoints, milestone completions, and model handoffs.

## 2026-05-03 11:02 PM ET

- Changed:
  - Stabilized the onboarding and Discover baseline enough to treat the first-week loop as the active product checkpoint.
  - Locked the current route order:
    - cover
    - identity pick
    - starter pack
    - foundation receipt
    - persona pick
    - first signature
    - capture prompt
    - Closet / Discover
  - Finalized key first-week decisions in code and docs:
    - six starter categories
    - identity pick before starter categories
    - 16-piece gate before foundation receipt
    - persona-aware first-signature fallback using actual selected foundation pieces
    - local typed Discover issue content from `vol-18-corduroy`
- Why:
  - The product needed one stable spine before expanding into backend orchestration or new editorial surfaces.
  - We wanted the first signature to feel grounded in the user’s actual selections instead of mystery defaults.
  - Discover needed to become useful immediately, even before the Magazine pipeline existed.
- Affected:
  - onboarding flow
  - `lib/firstWeek.ts`
  - Discover surfaces and local issue content
  - `MODEL_HANDOFF.md`
- Next:
  - run manual visible-browser QA in addition to headless verification
  - keep Discover on local content until the Magazine backend can emit a real manifest
  - review Magazine orchestration docs before implementing backend workflow code

## 2026-05-03 06:13 PM ET

- Changed:
  - Built the first-week onboarding foundation in the Expo app.
  - Added the core Sanctuary flow:
    - starter pack exploration
    - foundation receipt
    - persona pick
    - first signature reveal
    - capture handoff
    - Closet progression
  - Introduced persisted first-week state with Zustand/MMKV/localStorage portability.
  - Added the first-signature request shape so a real endpoint could later replace deterministic local templates.
- Why:
  - We needed a coherent, testable first-week loop before chasing polish or automation.
  - Persisted state was necessary so the product could survive refreshes and feel trustworthy on web and native.
  - The endpoint contract had to exist early so later LLM integration would not force a product rewrite.
- Affected:
  - app routes for onboarding, capture, closet, and looks
  - `lib/firstWeek.ts`
  - starter pack and outfit composition components
- Next:
  - harden web click reliability and route-param persistence
  - tune persona-to-signature behavior
  - connect Discover back to owned items and saved progress

## 2026-05-03 07:51 AM ET

- Changed:
  - Rendered garment imagery in the basics block and pushed the wardrobe prototype beyond generic scaffolding.
  - Started turning the product from a shell into a wardrobe-specific experience with recognizable garment surfaces.
- Why:
  - The app needed to stop feeling like a blank Expo exercise and start carrying the StyleMeUp product language.
  - Garment representation is central to trust; the UI needs to feel like wardrobe composition, not placeholders in boxes.
- Affected:
  - basics block / garment surface components
  - early wardrobe presentation layer
- Next:
  - build the first-week flow on top of those garment primitives
  - connect visuals to onboarding and closet progression

## 2026-05-03 07:47 AM ET

- Changed:
  - Scaffolded the Expo managed app foundation and wardrobe prototype.
  - Established the working stack:
    - Expo Router
    - TypeScript strict mode
    - Zustand
    - MMKV
    - Reanimated
    - Skia
    - React Query
- Why:
  - The repo needed a concrete app runtime that matched the design and architecture rules already written in the docs.
  - We wanted the implementation stack settled early so later product work would not keep reopening tooling decisions.
- Affected:
  - app scaffold
  - package/dependency setup
  - project folder structure
- Next:
  - begin implementing the first-week onboarding flow
  - bring garment and closet concepts into the UI

## 2026-05-02 08:51 AM ET

- Changed:
  - Created the initial StyleMeUp documentation scaffold:
    - `DESIGN.md`
    - `AGENTS.md`
    - `CLAUDE.md`
    - `STARTING.md`
    - Magazine skill scaffolding
    - `issues/vol-18-corduroy.md`
  - Established the product as a confidence engine with two visual/emotional registers:
    - Magazine
    - Sanctuary
- Why:
  - We needed brand, product, and implementation rules before writing serious code.
  - The editorial issue and skill scaffolding gave Discover a real direction from day one instead of abstract future intent.
- Affected:
  - core docs
  - issue seed content
  - agent/design rules
- Next:
  - scaffold the Expo app against the documented stack
  - use the docs as the implementation contract
