# the-edit · architecture & interview prep

Four artifacts. Same content, four modes — shallow to deep.

## What's in here

**`index.html`** — interactive architecture diagram. Open in any browser
(`open index.html` from this directory). Click stages or principles to
explore. Best for **screen-sharing** during an interview, or pulling up
on a second monitor while you talk.

**`drill-cards.md`** — twelve cards, each with a 30-second answer, a
2-minute answer, the follow-up they'll probably ask, and the war
story that makes the answer real. Best for **live-answer drilling**.
Read aloud. Time yourself.

**`principles.md`** — the deep-dive, ~7,400 words. Twelve AI principles
explained mechanism-first, with code citations from `the-edit` and the
follow-up questions a sharp hiring manager will ask. Best for
**studying** in the days before an interview. Read once start-to-finish;
reference by section after that.

**`glossary.md`** — the gospel, ~22,000 words. Twenty entries across
six themed parts (Foundations, Cost & Efficiency, Reliability, Quality
& Truth, Structure & Control, Multimodal). Each entry follows a rigid
template: tagline → first principles → mechanism in depth → what it's
NOT → in-the-edit usage → six-turn hiring manager dialogue → references.
Best for **building understanding all the way down** — beyond what an
interview needs, because once you actually know the thing, the
interview falls out for free. Designed to grow: 10 extension slots
are already claimed at the bottom for future entries.

## How they fit together

| Mode | Use this | Time |
|---|---|---|
| Live-answer drilling | `drill-cards.md` | 30 min |
| Pre-interview study | `principles.md` | 2 hr |
| Deep learning (gospel) | `glossary.md` | 1 day, then ongoing |
| Showing the system on screen-share | `index.html` | live |

The progression: glossary builds the understanding, principles
operationalizes it, drill cards make it conversational, the diagram
shows it visually.

## How to use them for the next interview

**Week before (if you have it):**
1. Read `glossary.md` in chunks — Parts I and IV first (foundations
   and quality/truth — these have the highest interview frequency).
   Don't speed-read. Read each entry's 6-turn dialogue aloud as both
   sides.

**Day before:**
1. Read `principles.md` straight through. Don't skim. The prompt-caching
   section (Principle 1) is the long worked example — it shows the
   pattern every other answer follows.
2. Open `drill-cards.md`. Cover the answers with your hand. Read each
   30-second prompt out loud. If you can't deliver the answer without
   peeking, drill it three more times.

**Day of:**
1. Open `index.html` on a second monitor or tab. If the interviewer asks
   you to walk through your system, share that screen and click through.
2. Have `drill-cards.md` open in a third tab for cold-question recovery.
   The 30-second answers are short on purpose — they fit in the
   conversational beat.

**During the interview:**
- The 30-second answer is the bar. If you can't say it cold, fall back
  to the diagram and let the screen do half the work.
- When they push for depth (they will), reach for the 2-minute answer.
- When they ask the follow-up (they will), the follow-up card has it.

## Cross-references to your existing learning docs

- `../AI_PM_INTERVIEW_QA.md` — the canonical Q&A doc. 27 questions,
  surface-to-deep. Use this for breadth.
- `../PM_INTERVIEW_QA.md` — pure PM (no AI). Use for product / strategy
  questions that come up in the same loop.

The three docs together form a layered system:
- **AI_PM_INTERVIEW_QA.md** → breadth (every topic, one Q each)
- **principles.md** → depth (twelve topics, mechanism-level)
- **drill-cards.md** → fluency (twelve topics, conversational)

If you only have time for one before an interview, read
`drill-cards.md`. Fluency beats depth in a 45-minute loop.

## What's in the diagram

Eight pipeline stages (research → rank → edit → prompt → qa → imagine →
pick → publish), each with:
- One-sentence description
- Cost
- Which files implement it (in `the-edit` repo)
- Which AI principles it applies
- Proof it worked
- What silently breaks it

Twelve AI principles in the side rail. Click any principle to see:
- Which stages use it (highlighted in the pipeline above)
- The mechanism in one paragraph
- A jump-link back to the deep-dive in `principles.md`

Keyboard: `Esc` to clear the current selection.

## Stack

Pure HTML + CSS + vanilla JS. No build, no dependencies, no fonts
loaded from anywhere you don't trust (just Google Fonts for Playfair
Display + Inter — feel free to swap to system fonts for offline use).
Single file, ~700 lines including the data. Edit in any text editor.

## Updating the artifact

If `the-edit` adds a stage, update `STAGES` in the `<script>` block of
`index.html` and add a section to `principles.md`. If a principle
changes implementation, update both the principle card in
`index.html` (the `PRINCIPLES` object) and the matching section in
`principles.md`. The diagram and the deep-dive should stay in lockstep.

If you want to host this somewhere shareable (vs. opening a local file),
the simplest paths:
1. Drop `index.html` into a Vercel project as `public/the-edit/index.html`
2. Use GitHub Pages on the `styleMeUp/learning` folder
3. Email the folder to recruiters — it's three files, no build

---

Built 2026-05-17. Last validated against `the-edit` commit `fcb9ad6`.
