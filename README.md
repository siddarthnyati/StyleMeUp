# StyleMeUp

> **A confidence engine disguised as a wardrobe app.**
>
> *We give people the power to feel like the version of themselves they already are — but better dressed.*

**Status**: pre-MVP · brand name is a working title (see `DESIGN.md` §15)
**Owner**: Sid

---

## What this is

StyleMeUp lives in two emotional registers:

- **Magazine** (`--void` true black) — Discover tab, trend features, look reveals. Cinematic, monumental, "look at this."
- **Sanctuary** (`--paper` true white) — Closet, capture, settings. Hushed, paper, "this is yours."

The contrast between these two rooms is the product. See `DESIGN.md` §1.5.

The defining transition between them is **The Vanishing** — a 1.3s particle-assembly when a user tries on a new piece. See `DESIGN.md` §11.

The defining first-use moment is the **first signature reveal** — Magazine register, Moment Yellow used exactly once per user journey. See `DESIGN.md` §10.

---

## Read these first, in order

1. **`DESIGN.md`** — visual, interaction, emotional, and tonal source of truth. **The document wins over generated code, every time.** v3, canonical.
2. **`AGENTS.md`** — engineering conventions for AI agents (Cursor, Claude Code) working in this repo.
3. **`CLAUDE.md`** — Claude Code's auto-loaded entry point. Points at the above.
4. **`STARTING.md`** — concrete next steps. Read this when you're ready to write code.

---

## File map

```
styleMeUp/
├── README.md                                  ← you are here
├── DESIGN.md                                  ← brand bible (canonical, v3)
├── AGENTS.md                                  ← AI agent conventions
├── CLAUDE.md                                  ← Claude Code entry point
├── STARTING.md                                ← human's next-steps
├── .cursor/
│   └── rules/
│       └── design.mdc                         ← Cursor's auto-loaded rules
├── .claude/
│   └── skills/
│       └── magazine-issue/SKILL.md            ← weekly issue generator
├── issues/
│   ├── vol-18-corduroy.md                     ← worked example, canonical
│   └── index.json                             ← reuse-detection registry
└── (app code goes here once scaffolded)
```

---

## Stack (planned, not yet scaffolded)

- **Mobile**: Expo + React Native + Reanimated 3 + Skia
- **Web (validation prototype)**: Next.js 15 + Tailwind + Framer Motion
- **Backend**: Supabase (Postgres + Auth + Storage)
- **Magazine production**: Nano Banana Pro (frames) + Kling 3.0 (motion) + ffmpeg (extract) + Claude Code (page assembly)

See `DESIGN.md` §14 for the full handoff.

---

## The non-negotiables

- WCAG 2.1 AA minimum, target AAA
- Mobile-first at 375px, every component
- 60fps for The Vanishing on a 2021-era phone
- Total JS bundle under 200KB for the first interactive screen
- The Vogue test on every line of copy: *would Vogue or Burberry publish this sentence?* If no, rewrite.

---

*for the human reading: if any AI agent generates code or copy that contradicts `DESIGN.md`, push back. The document wins.*
