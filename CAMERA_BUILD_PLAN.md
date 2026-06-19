# Camera + Classification — Weekend Build Plan

Last updated: 2026-05-18 · for Fable to execute phase-by-phase

**Decisions locked (Sid, 2026-05-18):**
- Taxonomy: **expand GarmentKind to ~16 kinds now** (honest women's-wear
  classification from day one).
- Scope: **full loop + polish + cost telemetry** (capture → classify →
  gate → save to Closet, with loading/correction UX and per-classify
  cost tracking).
- Process: **checkpoint each phase.** Build a phase, STOP, get Sid's OK,
  continue. Each phase is its own commit.

**The core idea:** a probabilistic classifier (Gemini Flash vision)
wrapped in a deterministic gate (our code). The model guesses; our code
decides whether to trust the guess. When unsure, we **ask the user**
rather than confidently mislabel — a wrong silent label poisons every
downstream recommendation.

---

## The taxonomy (Phase 0, part of Phase A)

Expand `GarmentKind` in `components/GarmentTile/GarmentTile.tsx:5` from 9
to 16. Keep existing names to avoid churn; add 7.

```
existing (9): tee, oxford, denim, sneaker, boot, jacket, trouser, skirt, cap
add (7):      knit, dress, shorts, coat, heel, flat, bag
```

Meaning, so the model and the silhouettes agree:
- **tee** — casual knit top, short sleeve
- **oxford** — any button-up shirt (incl. silk/linen blouses that button)
- **knit** — sweater, jumper, cardigan, sweatshirt
- **dress** — one-piece
- **denim** — jeans specifically
- **trouser** — non-denim pants (chino, wool, tailored)
- **shorts** — any short bottom
- **skirt** — any skirt
- **jacket** — short outerwear (blazer, bomber, denim/leather jacket)
- **coat** — long outerwear (trench, overcoat, puffer)
- **sneaker** — athletic / court shoe
- **boot** — any boot
- **heel** — heeled shoe
- **flat** — flat shoe (loafer, ballet flat, derby, mule)
- **bag** — any carried bag
- **cap** — headwear (cap, beanie, hat)

Files that must stay in sync with this enum:
1. `components/GarmentTile/GarmentTile.tsx` — the type + `silhouetteStyles`
   map. New kinds get a reasonable silhouette; reuse near-neighbors if
   needed (dress ≈ tall tee, coat ≈ tall jacket, knit ≈ tee, shorts ≈
   short trouser, heel/flat ≈ low sneaker box, bag ≈ rounded square). The
   silhouette only shows for items WITHOUT a photo (starter pack, look
   pieces) — captured items will show the real photo.
2. `lib/firstWeek.ts` — `garmentKindMap` (add the 7 keys).
3. `lib/magazineFeed.ts` — `VALID_KINDS` set (add the 7).
4. The classification schema (Phase B) — its `kind` enum must equal this
   list plus `"unknown"`.

---

## The classification contract (used by Phase B + C)

The endpoint returns this shape. The model fills `classification`; the
endpoint adds `costUsd` + `latencyMs`.

```ts
type Classification = {
  isGarment: boolean;                       // false → reject lane
  kind: GarmentKind | 'unknown';            // constrained to the taxonomy
  alternativeKind: GarmentKind | 'unknown' | null; // 2nd-best guess
  ambiguous: boolean;                       // model's honest "not sure"
  colorName: string;                        // "charcoal", "optic white"
  colorTone: string | null;                 // map to a wardrobe tone if obvious
  material: string;                         // "cotton jersey", "raw denim"
  detail: string;                           // Sanctuary-voice one-liner for the label
  reason: string;                           // why unknown/ambiguous (debug + ask-lane copy)
};

type ClassifyResponse = {
  classification: Classification;
  costUsd: number;
  latencyMs: number;
};
```

**Confidence is NOT a self-reported number.** Do not ask the model for
"confidence: 0.0–1.0" — LLMs are badly calibrated and will say 0.95 while
wrong. Instead the signal is structural: the model returns its top-2
kinds and an explicit `ambiguous` flag. Two plausible candidates, or
`ambiguous: true`, or `kind: "unknown"` → the ask lane fires.

---

## The deterministic gate (Phase C)

`lib/classifyGate.ts` — pure function, no model call, fully testable.

```ts
type Lane =
  | { lane: 'reject'; message: string }
  | { lane: 'ask'; candidates: GarmentKind[]; reason: string }
  | { lane: 'accept'; kind: GarmentKind };

function routeClassification(c: Classification): Lane {
  if (!c.isGarment) {
    return { lane: 'reject', message: 'no garment in frame. reframe?' };
  }
  const ambiguous =
    c.kind === 'unknown' || c.ambiguous || c.alternativeKind != null;
  if (ambiguous) {
    const candidates = [c.kind, c.alternativeKind]
      .filter((k): k is GarmentKind => !!k && k !== 'unknown');
    return { lane: 'ask', candidates, reason: c.reason };
  }
  return { lane: 'accept', kind: c.kind };
}
```

UX per lane (Sanctuary register throughout):
- **reject** — quiet line "no garment in frame. reframe?" + retake button.
  Never guesses.
- **ask** — "is this a {kind} or a {alternativeKind}?" as two tap chips,
  plus a "something else" chip that opens the full 16-kind picker. The
  model narrows; the human decides.
- **accept** — show the result ("black tee. cotton jersey.") with a quiet
  "not right? change it" affordance that opens the picker. Even confident
  results get a one-tap correction — the cost of a wrong silent label is
  too high.

---

## Phases (commit + STOP after each)

### Phase A — Real camera + taxonomy  [Sat AM]
**Goal:** take a real photo, see it, downscale it. No AI yet.
- Expand the taxonomy (Phase 0 above) — do this first so everything
  downstream compiles against the full enum.
- `screens/Capture/Capture.tsx`: replace the simulated states with
  `expo-camera` `CameraView` on native. Capture → preview the real photo.
  Downscale to ~768px longest edge (`expo-image-manipulator`) and keep a
  base64 for the next phase.
- **Web fallback:** on `Platform.OS === 'web'`, camera uses a file picker
  (`<input type="file" accept="image/*">`) instead of CameraView, so the
  pipeline is testable on localhost. Native is the real path.
- Add optional `imageUri` to captured pieces in `firstWeek.ts` and to
  `GarmentTile` (when `imageUri` present, render the photo via
  `expo-image` instead of the silhouette).
- **RISK to clear first:** confirm the camera opens in your run target.
  Expo Go SDK 51+ bundles expo-camera, but verify before building UI on
  it — if it needs a dev build, find out in the first 30 minutes, not
  Saturday night.
- **Acceptance:** on device, open Capture → camera → snap → see your real
  photo in a preview. On web, file-pick → see the image. Typecheck clean.
- **STOP.** Show Sid the real photo flowing through.

### Phase B — Classification endpoint  [Sat PM]
**Goal:** an image goes in, structured JSON comes out. Server-side.
- Add `apps/admin/app/api/classify/route.ts` in the-edit (the
  `GEMINI_API_KEY` is already in that Vercel project).
- POST `{ imageBase64, mimeType }` → call **Gemini Flash vision**
  (`gemini-2.5-flash` — the multimodal TEXT model that accepts images,
  NOT the image-generation model) with a structured-output schema equal
  to `Classification`. System prompt: classify into the 16-kind taxonomy
  ONLY; if nothing fits, return `kind: "unknown"`; set `ambiguous: true`
  when genuinely unsure; never invent a kind outside the list. Voice for
  `detail` follows DESIGN.md §5 (Sanctuary, lowercase, no marketing
  adjectives).
- Return `{ classification, costUsd, latencyMs }`. Compute `costUsd` from
  Flash token pricing (input incl. image tokens + output).
- Public POST like `issues/latest` (no Basic Auth). **FLAG:** add a
  shared-secret header or rate limit before any public launch — a public
  classify endpoint is abusable. Fine for the weekend.
- **Acceptance:** `curl` a real garment photo → correct kind + plausible
  color/material + a cost number. Try a non-garment (a wall) → `isGarment:
  false`. Try something ambiguous (a long cardigan) → `ambiguous: true`
  or a real `alternativeKind`.
- **STOP.** Show Sid three curls: a clear item, a non-garment, an
  ambiguous one.

### Phase C — Wire app + the gate  [Sun AM]
**Goal:** the full loop, with the three lanes live.
- `lib/aiClassify.ts` — client call to the endpoint (use
  `EXPO_PUBLIC_THE_EDIT_API_URL`, same base as the magazine feed).
- `lib/classifyGate.ts` — the pure `routeClassification` function above,
  with a few unit-style assertions in a sibling test or a dev-only
  self-check.
- Capture flow: after photo → "reading the piece…" → call endpoint →
  route through the gate → render the right lane. Accept lane saves a
  captured piece (with `imageUri`, `kind`, `colorName`→tone, `material`,
  `detail`) to the closet. Ask lane lets the user pick. Reject lane
  retakes.
- **Acceptance:** capture a real shirt → it lands in Closet as a photo
  with the right kind. Capture something weird → you get asked, not
  mislabeled. Capture a non-garment → polite reject.
- **STOP.** Show Sid the end-to-end loop on device.

### Phase D — Polish + cost telemetry  [Sun PM]
**Goal:** make it feel like the product, and start measuring.
- "reading the piece…" uses the §11 breathe animation (opacity 0.5→1→0.5,
  2.4s). Haptics per §11: shutter = medium, save = light tick.
- Correction UX: the "not right? change it" picker, smooth.
- `lib/aiTelemetry.ts` — log every classify event `{ at, kind, lane
  (accept/ask/reject), costUsd, latencyMs }` into an MMKV-backed store
  slice, plus a running `classificationSpendUsd`. This both proves cost
  control and seeds the analytics gap flagged in `PRODUCT_STRATEGY.md`
  §4.5.
- **Acceptance:** the loop feels calm and intentional; a debug surface
  (or console) shows per-classify cost and the running total; reduced-
  motion respected.
- **STOP.** Show Sid the polished loop + the cost readout.

---

## After the weekend (feeds Track B)

Once this ships, it becomes a new glossary entry in
`learning/the-edit-architecture/`: **"Vision classification + human-in-
the-loop gating"** — the real-world example of wrapping a probabilistic
core in deterministic guardrails, with the cost-of-a-wrong-silent-label
argument. This is one of the strongest AI PM interview stories in the
whole project; write it up while it's fresh.

## Notes / non-goals for the weekend
- Photos stay **local** (device URI in MMKV). No Supabase upload yet —
  cross-device sync is a later auth+storage phase.
- No retraining, no fine-tuning — prompt + schema + gate only.
- `colorTone` mapping to the exact `wardrobeTones` token is best-effort;
  fall back to storing `colorName` if no clean token match.
