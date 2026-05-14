# StyleMeUp Next Steps

Last updated: 2026-05-14

## Current Status

StyleMeUp now has the first real bridge to `the-edit`: Discover can fetch the latest approved Magazine issue from the Vercel admin API and falls back to local Vol. 18 corduroy content if the API is unavailable.

The app now also tracks whether the latest remote Magazine issue has been opened. When a newer published issue is available, Discover shows a `new issue live.` hero badge and the bottom navigation shows a badge dot on Discover until a remote issue detail page is opened.

The product focus is now the Magazine experience inside the app, not pipeline visibility.

## Shipped In This Push

- Added React Query provider at the app root.
- Added `lib/magazineFeed.ts`:
  - reads `EXPO_PUBLIC_THE_EDIT_API_URL`
  - defaults to `https://the-edit-lime.vercel.app`
  - fetches `GET /api/issues/latest`
  - normalizes remote issue content
  - falls back to `lib/magazineIssue.ts`
- Extended `lib/magazineIssue.ts` to support remote image URLs, source summary, history, why-now, trend cards, and curator cards.
- Reworked Discover into a Magazine surface:
  - cinematic latest issue hero
  - trend grid
  - concise writeups
  - `the return.`
  - `why now.`
  - `you have the base.` match loop
- Reworked `/discover/[slug]` detail pages to show image/detail, history, why-now, and match CTA.
- Added persisted `seenMagazineIssueSlug` state so the app can badge a newly published remote Magazine issue without notifying on the local Vol. 18 fallback.
- Updated learning docs additively with 2026 senior PM / AI PM interview practice and new Hiring Manager Mode rounds.

## To-do List

1. [x] Run Expo web and verify `/discover` loads the remote issue from `https://the-edit-lime.vercel.app/api/issues/latest`.
2. [x] Confirm signed remote images render in the Discover hero, trend cards, and `/discover/[slug]`.
3. [x] Confirm the Discover nav badge appears for an unseen remote issue and clears after opening a remote detail page.
4. [x] Temporarily point `EXPO_PUBLIC_THE_EDIT_API_URL` at an invalid URL and confirm local Vol. 18 still renders without a new-issue badge.
5. [x] Confirm no service-role key or secret env var appears in client code.
6. [x] Fix and rerun the foundation receipt path after the selected-items maximum-update-depth crash.
7. [ ] Do one human visual pass on device-sized Expo web before shipping the StyleMeUp changes.

## Next Product Work

1. Improve the closet matching model behind `you have the base.` so it understands captured garment labels and starter taxonomy more robustly.
2. Add a quieter empty state when a trend has no closet overlap: useful, not shaming.
3. Add real remote images after the first published issue exposes signed URLs.
4. Consider a Magazine archive only after the latest-issue loop feels good.
5. Continue first-week polish after Discover remote content is verified.

## Learning Folder

Current additive updates:

- `learning/PM_INTERVIEW_QA.md`: senior PM questions for competitor AI pressure, AI pricing/unit economics, stakeholder alignment, and non-AI product AI strategy.
- `learning/AI_PM_INTERVIEW_QA.md`: AI PM questions for eval design, prompt injection, model rollout risk, and AI in existing products.
- `learning/HIRING_MANAGER_MODE.md`: new answer-free rounds for evals/safety, non-AI products under AI pressure, platform/unit economics, and CEO/VP product taste.
