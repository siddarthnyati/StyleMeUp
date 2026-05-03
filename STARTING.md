# STARTING.md

### How to actually get going

This file is for Sid. It's the human's checklist. Read it once, then start at step 1.

**Time budget for everything below: ~3 hours.** If you're spending more, ping Claude (the design partner) — something's wrong.

---

## Step 0 — Push this scaffold to GitHub

You're reading this because Claude generated the starter files. Get them into the repo first.

```bash
# In a terminal, in an empty folder where you want StyleMeUp to live locally
git clone https://github.com/siddarthnyati/StyleMeUp.git
cd StyleMeUp

# Move the generated files into here. (Or download from Claude's chat and drag in.)
# After moving, you should have:
#   ./README.md, ./DESIGN.md, ./AGENTS.md, ./CLAUDE.md, ./STARTING.md
#   ./.cursor/rules/design.mdc
#   ./.claude/skills/magazine-issue/SKILL.md
#   ./issues/vol-18-corduroy.md, ./issues/index.json

git add .
git commit -m "scaffold: brand bible, agent rules, magazine skill, vol 18 issue"
git push
```

---

## Step 1 — Open in Cursor

```bash
cursor .
```

Cursor will detect `.cursor/rules/design.mdc` and auto-attach it to every chat. You'll see "1 rule attached" in the chat sidebar.

**Verify it worked.** Open Cursor's chat and ask:

> What register is the Discover screen?

If Cursor answers "Magazine, true black canvas, monumental uppercase display" — rules are loading correctly. If it gives a generic answer, the rules file isn't attaching. Check that `.cursor/rules/design.mdc` is at the repo root.

---

## Step 2 — Scaffold the Expo project

In Cursor's chat:

> Following AGENTS.md §1 (stack), scaffold a new Expo project at the repo root using the managed workflow. TypeScript strict mode. Expo Router for file-based routing. Add Reanimated 3 and Skia as dependencies. Add Zustand, TanStack Query, MMKV. Set up the directory structure per AGENTS.md §2 — tokens/, components/, screens/, lib/. Don't generate any UI yet — just the empty folders and dependency setup. Show me the diff before applying.

Cursor will produce a plan. Read it. Approve it. Run the install commands when prompted.

**Expected output:** working `npx expo start` that opens a blank app.

---

## Step 3 — Generate the tokens

In Cursor:

> Generate `tokens/colors.ts`, `tokens/type.ts`, `tokens/spacing.ts`, and `tokens/motion.ts` from DESIGN.md §6, §7, §9, and §11 respectively. Each file should export a typed object. Add JSDoc comments citing the DESIGN.md section for every value. Use the free fallback fonts (Fraunces + Inter) — we'll upgrade to Migra + Söhne post-launch per DESIGN.md §7.

Cursor will produce four files. Spot-check that:
- `colors.ts` has `void`, `paper`, `ink`, `bone`, `signal`, `power`, `moment`, plus the smoke ramp
- `type.ts` has `monumental`, `displayXl/Lg/Md`, `headlineLg/Md`, `bodyLg/Md`, `label`, `micro`
- `spacing.ts` has 1 through 10 mapped to 4/8/12/16/24/32/48/64/96/128
- `motion.ts` has `defaultEase`, the four-phase Vanishing timings, and page/micro durations

Commit.

---

## Step 4 — Build screen 01 (cover)

In Cursor:

> Build `screens/Onboarding/Cover.tsx` per DESIGN.md §10 first-launch step 1 and §12 cold-start. Magazine register. Full-bleed background — for V1 use a placeholder solid `--void` with a centered Migra Italic word "this week." in lowercase at `--display-xl`. Single CTA at bottom: `Begin.` Primary Magazine button per DESIGN.md §10. The actual autoplay video will swap in once we have vol-18-corduroy assets — leave a clearly-marked TODO comment with the path `assets/magazine-issues/vol-18/cover-motion.mp4`. Mobile-first 375px. State the register in the file header per AGENTS.md §4. Use tokens/ for every value.

Run on your phone via Expo Go. It should look like the cover wireframe from earlier in our chat — a black canvas, italic "this week.", "Begin." button at the bottom.

**This is the moment you'll feel whether the brand actually carries to code.** If something feels off, paste a screenshot back to Claude (me) — I'll diagnose.

---

## Step 5 — Run the corduroy issue prompts

In a parallel session, take `issues/vol-18-corduroy.md` and start producing actual assets:

1. Open Nano Banana Pro. Run the **Frame 1** prompt → save `assets/magazine-issues/vol-18/cover-start.webp`
2. Run **Frame 2** → save `cover-end.webp`
3. Open Kling 3.0. Upload Frame 1 as start, Frame 2 as end. Run the **Motion** prompt with multi-shot ON, 9:16, 1080p, 10s → save `cover-motion.mp4`
4. Extract scroll frames:
   ```bash
   ffmpeg -i cover-motion.mp4 -vf fps=24 frames/%03d.webp
   ```
5. Run the 4 trend card prompts → save `trend-1-wide-wale.webp` through `trend-4-cap.webp`
6. Run the 3 curator prompts → save `curator-1-rougemont.webp` etc.
7. Compress all WebPs to <200KB:
   ```bash
   for f in *.png; do cwebp -q 80 "$f" -o "${f%.png}.webp"; done
   ```

Total time: ~30-45 minutes of clicking. Total cost: ~$3 amortized across subscriptions.

---

## Step 6 — Visual QA on a real phone

The Vanishing must hit 60fps on a 2021-era phone. Don't validate on the simulator — simulators lie about performance. Use Expo Go on your actual device.

If you don't yet have anything to test The Vanishing on, that's fine — Step 4 just gives you the cover. The Vanishing is a later screen.

---

## Step 7 — When you hit a wall

Three modes for getting unstuck:

1. **Quick fix** — paste the error or screenshot to Claude (me, the design partner). I'll diagnose.
2. **Architecture decision** — bring it to Claude before asking Cursor. Cursor implements; Claude architects.
3. **Brand decision** — bring it to yourself. DESIGN.md §15 has the open questions. When one's about to ship, surface it.

**The pattern that works:** Cursor for code, Claude for design and architecture, you as the bridge.

---

## What to do next, after Step 4 ships

In rough order:

1. Onboarding screen 02 — auth (Sign in with Apple + Google + email per the wireframe)
2. Onboarding screen 03 — starter pack (the 6-tile flow per DESIGN.md §10)
3. Onboarding screen 04 — persona pick
4. Onboarding screen 05 — first signature reveal (Moment Yellow earns its single use here)
5. Closet (Sanctuary) with empty state per DESIGN.md §12
6. Capture (3-state per §10) — needs camera permissions wired
7. Discover (Magazine) with the corduroy issue rendered for real
8. The Vanishing — Skia particle implementation, the brand's signature

Don't skip steps. Each one teaches you the codebase before adding more surface area.

---

## Honesty checklist

Before each commit, ask yourself:

- [ ] Does it pass the Vogue test on every line of copy?
- [ ] Did Cursor cite DESIGN.md sections, or just generate?
- [ ] Did I run it on a real phone?
- [ ] Would I be embarrassed to show this to a magazine editor?

If any answer is "no" — pause. The brand is fragile. Cheap-feeling UI is a trust collapse (DESIGN.md §2, "they will pay").

---

*v1 · for the human · last updated: 2026-05-02*
