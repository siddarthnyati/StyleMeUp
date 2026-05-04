# StyleMeUp Next Steps

Last updated: 2026-05-04 02:38 PM ET

## Current status

StyleMeUp has a stable first-week product spine in the current Expo app and a docs-first architecture for the future Magazine Weekly backend. The app repo is the active product surface. Magazine orchestration remains unimplemented and should move into a separate repo rather than growing inside the Expo client.

## Completed since last update

- Started the first visible-browser QA pass for Track A on the live Expo web app.
- Tightened shared app chrome after the first QA sweep:
  - rebuilt the bottom navigation to use full labels with a cleaner active marker instead of single-letter initials
  - let Closet milestone rows and secondary actions wrap instead of clipping on narrow widths
  - let the starter-pack footer wrap cleanly so the progress summary and `continue` CTA can coexist on mobile widths
  - nudged the cover CTA further inboard so it does not feel pinned to the corner
- Verified the updated app with another headless Chrome pass on:
  - cover
  - starter pack
  - Closet
  - Discover
- Identified a remaining viewport framing issue on web:
  - a white band still appears below the cover
  - several screens still show slight left-edge offset / right-edge clipping in headless Chrome
  - this likely lives in the shared web layout or safe-area framing rather than a single screen
- Stabilized the first-week onboarding checkpoint in the app:
  - identity pick
  - starter pack
  - foundation receipt
  - persona pick
  - first signature
  - capture
  - Closet / Discover
- Verified the baseline route and persistence flow in headless Chrome.
- Wrote the Magazine orchestration planning docs:
  - `MAGAZINE_AGENT_SPEC.md`
  - `AI_ORCHESTRATION.md`
- Adopted a documentation discipline:
  - `NEXT_STEPS.md` is the living execution plan
  - `CHANGE_LOG.md` is the historical change record
  - `MODEL_HANDOFF.md` remains the compact handoff/state document

## Current focus

We are running two tracks in parallel.

### Track A — Finish the app checkpoint

Close the current app loop so the first-week experience feels deliberate, reliable, and ready for continued iteration without foundational churn.

Active focus:

- finish the shared web viewport/layout fix before doing deeper copy and motion polish
- continue visible-browser QA for pointer feel, spacing, and route continuity
- polish Discover-to-Closet usefulness, especially `you have the base.` and `build from yours`
- refine first-signature, capture, and Closet copy/motion consistency against `DESIGN.md`
- verify persistence and refresh safety for:
  - `starterSelections`
  - `persona`
  - `firstSignatureSaved`
  - `capturedPieces`
  - `savedLooks`

### Track B — Start the separate Magazine agent repo

Use the current docs as the source contract and build a dedicated backend/orchestration repo for Magazine Weekly.

Active focus:

- define the repo boundary and bootstrap shape
- implement a deterministic TypeScript orchestrator
- model executor contracts for:
  - research
  - rank
  - edit
  - prompt
  - QA
  - approval
  - publish
- use Vercel AI for orchestration/runtime and Supabase for run state, sources, approval state, and manifests
- stop at approval in V1; no autonomous publish

## Next steps

1. Fix the shared web viewport/layout issue that is still causing bottom whitespace on the cover and slight horizontal framing/clipping on some screens.
2. Continue the visible-browser QA pass once the shared layout issue is resolved, then record the remaining UI polish list by screen.
3. Verify persistence and refresh safety for the first-week state keys on web.
4. Close the app checkpoint with a short list of remaining product fixes instead of opening new surfaces.
5. Create the separate Magazine agent repo scaffold:
   - TypeScript project
   - orchestrator entrypoint
   - executor interfaces
   - Supabase run-record shape
   - local draft workflow
6. Define the first portable Magazine issue manifest that the app can consume later without knowing orchestration internals.
7. Keep Discover on local typed issue content until the agent repo can emit a stable manifest and approval-ready draft.

## Blockers and open decisions

- Shared web layout framing is still imperfect in headless Chrome, so the current visible-browser QA pass is not fully closed yet.
- Decide whether `audienceIdentity` should branch starter inventory soon or remain tone-only for now.
- Connect the real `EXPO_PUBLIC_STYLEMEUP_LLM_ENDPOINT` only after the current app checkpoint is stable.
- Add real Vol. 18 assets when they are generated and uploaded; current Discover visuals are still placeholder/editorial silhouettes.
- Confirm the exact bootstrap and deployment shape for the separate Magazine agent repo before wiring app integration.
