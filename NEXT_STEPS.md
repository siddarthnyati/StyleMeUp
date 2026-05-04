# StyleMeUp Next Steps

Last updated: 2026-05-04 02:03 PM ET

## Current status

StyleMeUp has a stable first-week product spine in the current Expo app and a docs-first architecture for the future Magazine Weekly backend. The app repo is the active product surface. Magazine orchestration remains unimplemented and should move into a separate repo rather than growing inside the Expo client.

## Completed since last update

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

- run visible-browser QA for pointer feel, spacing, and route continuity
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

1. Run a visible-browser pass on the app and record any remaining UX/debugging gaps that block the first-week checkpoint.
2. Close the app checkpoint with a short list of remaining product fixes instead of opening new surfaces.
3. Create the separate Magazine agent repo scaffold:
   - TypeScript project
   - orchestrator entrypoint
   - executor interfaces
   - Supabase run-record shape
   - local draft workflow
4. Define the first portable Magazine issue manifest that the app can consume later without knowing orchestration internals.
5. Keep Discover on local typed issue content until the agent repo can emit a stable manifest and approval-ready draft.

## Blockers and open decisions

- Decide whether `audienceIdentity` should branch starter inventory soon or remain tone-only for now.
- Connect the real `EXPO_PUBLIC_STYLEMEUP_LLM_ENDPOINT` only after the current app checkpoint is stable.
- Add real Vol. 18 assets when they are generated and uploaded; current Discover visuals are still placeholder/editorial silhouettes.
- Confirm the exact bootstrap and deployment shape for the separate Magazine agent repo before wiring app integration.
