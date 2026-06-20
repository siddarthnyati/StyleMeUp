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

---

## 2026-06-19 — Camera loop + the combo-engine pivot

**The thesis (read `PRODUCT_STRATEGY.md` §9 + `SYSTEM_DESIGN.md` first).**
The product is the **outfit combo**, not classification or clean images.
Everything serves the combo. Three load-bearing decisions:
- **Gate classification on SLOT, not kind** (top/bottom/footwear/outerwear/
  accessory). Auto-accept when slot is confident; ask only on slot ambiguity.
  Mislabeling a tee as a knit is fine; it doesn't change the outfit.
- **The combo brain runs on metadata, not pixels** → wrinkled photos don't
  hurt combos, only presentation. Keep the user's real item (authenticity);
  cleanup is an optional presentation step.
- **The ranker is the moat**: editorial taste (DESIGN.md + the-edit trend) ×
  wear-graph × occasion. Solves cold-start; competitors can't clone the
  taste corpus.

**Competitive (Essembl / ENS):** they do **catalog matching** (visual search
→ nearest product image), not cleanup — free tier = catalog match, paid =
generative exact item. Their catalog is affiliate product feeds (Rakuten/
Skimlinks) = legal + revenue. Our stance: catalog matching = "shop similar" +
metadata layer, never the wardrobe image. Full teardown: strategy §8.

**Shipped:**
- Phase A — real expo-camera capture (shutter gated on `onCameraReady`),
  taxonomy expanded 9→16 kinds, captured pieces render real photos, Closet
  "your pieces" gallery. Storage moved MMKV→AsyncStorage (Expo Go).
- Closet correction — tap a captured piece → fix its type (16-kind picker).
- Phase B — `the-edit` `apps/admin/app/api/classify/route.ts`: Gemini Flash
  vision, structured output, public (excluded from Basic Auth). **Built, not
  deployed.**

**In flight (next build):**
1. Upgrade `/api/classify` to return the **combo feature vector** (slot +
   color + formality + pattern + season), derive slot from kind.
2. **Combo engine v0** — constraint generator + editorial ranker, runs
   **client-side** on captured pieces (no backend needed to demo).
3. Then: presentation (fill empty frames from wardrobe-basics; on-demand
   cleanup), then personalization + shop-similar.

**Testing without a prod deploy:** combo engine v0 is fully client-side — no
endpoint. The classifier can be tested against a **local `the-edit` dev
server** (`npm run dev` in `apps/admin`, point `EXPO_PUBLIC_THE_EDIT_API_URL`
at the laptop's LAN IP). No production Vercel push needed for testing.

**Cost research (strategy §7):** background removal is cheap (fal BiRefNet
~$0.004/img, Photoroom ~$0.015, on-device $0) — the naive Gemini-edit-
everything path (~$0.10) is 10–25× too much. Cleanup = fal default + Gemini
Flash opt-in.

**Learning corpus:** `learning/the-edit-architecture/glossary.md` Part IX
(embeddings, vector search/pgvector, FashionCLIP/catalog matching,
recommendation ranking, and the combo-engine explainer with the
accuracy/benchmark reality). `SYSTEM_DESIGN.md` has the app architecture
diagram + decisions.
