# StyleMeUp Model Handoff

Last updated: 2026-05-14

## Product Frame

StyleMeUp is a confidence engine disguised as a wardrobe app. The app has two registers:

- Magazine: black, editorial, sparse, trend/story surfaces.
- Sanctuary: white, private, onboarding/closet utility.

`DESIGN.md` remains the contract. No user-facing copy should mention "AI", "magic", "smart", "intelligent", or the banned §4 wording.

## Current Build State

- Expo Router app with React Query, Zustand, MMKV/localStorage persistence, Reanimated, and strict TypeScript.
- First-week loop remains: cover -> identity -> starter pack -> foundation receipt -> persona -> first signature -> capture -> Closet / Discover.
- Discover now reads the latest approved Magazine issue from the-edit's public Vercel API, with local Vol. 18 fallback and a persisted new-issue badge.

## Magazine Integration

New fetch path:

```text
EXPO_PUBLIC_THE_EDIT_API_URL/api/issues/latest
```

Default root if env is unset:

```text
https://the-edit-lime.vercel.app
```

Important files:

- `app/_layout.tsx`: React Query provider.
- `lib/magazineFeed.ts`: remote fetch, normalization, fallback, surface lookup.
- `lib/magazineIssue.ts`: local Vol. 18 fallback and shared issue types.
- `lib/firstWeek.ts`: persists `seenMagazineIssueSlug` so an unseen remote issue can be badged.
- `components/BottomNavigation/BottomNavigation.tsx`: shows the Discover badge dot for an unseen remote issue.
- `screens/Discover/Discover.tsx`: latest issue hero, grid, history, why-now, match loop.
- `screens/Discover/MagazineDetail.tsx`: remote-aware detail page; opening a remote issue marks it seen.

No Supabase service-role key is used in the Expo client. StyleMeUp only talks to the Vercel public read API.

## Learning Docs

Learning docs were updated additively. Existing dirty work was preserved.

- `learning/PM_INTERVIEW_QA.md`: new senior PM practice around AI competitor pressure, pricing/unit economics, stakeholder alignment, and AI in non-AI products.
- `learning/AI_PM_INTERVIEW_QA.md`: new AI PM practice around eval suites, prompt injection, hallucination rollout risk, and product-native AI.
- `learning/HIRING_MANAGER_MODE.md`: new answer-free rounds for AI safety/evals, non-AI product AI strategy, platform/unit economics, and CEO/VP taste.

## Verification Snapshot

Passing locally:

- `npx tsc --noEmit`
- `npm run lint`
- `git diff --check`
- Live public API returns Vol. 19 `vol-19-structured-shoulder` with signed image URLs.
- Expo web browser smoke test on `http://localhost:8010` confirmed:
  - `/discover` renders the remote Vol. 19 title.
  - `new issue live.` appears before opening a detail page.
  - signed image elements render on the page.
  - opening `/discover/shoulders-forward-womens-power-dressing` marks Vol. 19 seen.
  - the Discover nav badge clears after the remote issue is marked seen.
- Full onboarding browser run confirmed:
  - `/onboarding/foundation-receipt?selected=jacket-black-bomber,jacket-denim,tee-optic` renders `13 more.` instead of crashing.
  - a 16-item foundation renders `16 marked.`
  - first signature uses selected foundation pieces.
  - save -> capture -> Closet completes.
  - Discover loads the remote Vol. 19 issue afterward.
- Fallback smoke test on `http://localhost:8011` with an invalid `EXPO_PUBLIC_THE_EDIT_API_URL` confirmed local Vol. 18 renders and no new-issue badge appears.
- Secret-pattern scan found no service-role key or app secret in client code; only package-lock integrity text matched the broad token regex.

Still to run before handoff is fully closed:

- Do one human visual pass on device-sized Expo web before shipping the StyleMeUp changes.

## Next

Review the running Expo web app at `http://localhost:8010`, then commit the StyleMeUp changes when the visual pass feels right.
