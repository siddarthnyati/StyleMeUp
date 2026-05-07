# PM Interview — Q & A with examples from styleMeUp + `the-edit`

A living doc covering generic PM interview territory: taste, design, analytics, estimation, strategy, stakeholders. Every answer pulls a real example from the work, including which of the 106 Growth.Design psychology principles applied (when relevant).

After each major iteration, extend an existing answer or add a new question. The goal: by the time you're in the interview, every answer here triggers a story you actually built.

**Difficulty key:**
- 🟢 **EASY** — phone screen, behavioral basics
- 🟡 **MEDIUM** — typical PM round
- 🟠 **HARD** — director / staff PM, frameworks + tradeoffs
- 🔴 **PRO** — hiring manager, ambiguous strategy

---

## TASTE

### 🟢 Q1. How do you make an app sticky without dark patterns?

Stickiness without manipulation comes from **emotional utility**, not engagement loops.

Three mechanisms that work:
1. **Daily ritual moment** — one calm, non-pushy reason to open the app at the same time. Not a notification-triggered visit.
2. **Sunk cost via investment** — the user puts work in (uploads, preferences), and that work compounds value over time.
3. **Memory** — the product remembers what they did and uses that to make the next visit better.

**Example from styleMeUp:** the first-week loop — mark what you own → receive a foundation receipt → first signature → capture one piece → tomorrow's dressing room. Each step is one quiet investment. The Closet header evolves as you progress (`the first foundation.` → `one piece is real now.` → `your closet has begun.`). No streaks, no badges, no notifications.

**Psychology principle (Growth.Design audit):** Endowment effect + Investment loops + Peak-end rule. The first-signature reveal is the peak; the daily dressing room is the end.

**What I avoided:** streaks, notifications by default, social feed, gamified badges. Listed in `DESIGN.md §4` (Anti-Pattern Library) as hard bans.

---

### 🟡 Q2. What's a product decision you made that 90% of PMs would disagree with?

Banning notifications by default in a daily-use app.

Most PMs treat notifications as the lever for retention. Open rate falls → push more notifications. I bet that the inverse works for our audience: stillness as a feature signals taste, and the user who picks "Quiet Mode" is the one who'll pay $20/mo because we're not nagging them.

**Example from styleMeUp:** in `DESIGN.md §4`, we banned: streak language, "powered by AI" badges, social feed pressure, confetti, fake urgency, push-by-default. The product is built around one calm daily reveal — not a notification that demands attention.

**The downside:** 30-day retention will look worse than competitors who push 3 notifications a day. **The upside:** the users who DO retain are the ones with high LTV and low CS overhead. That's the trade I'd make.

**Psychology principle:** anti-engagement. Choice architecture says less choice = more decisive use.

---

### 🟠 Q3. How do you decide what NOT to build?

Three filters in order:

1. **Does it violate the product belief?** styleMeUp's belief: a wardrobe app is a confidence engine, not a styling chatbot. So: skip "AI styling chat" even though every competitor has it.
2. **Does it require a new user behavior?** New behaviors are expensive. If the feature works only when users do something they don't already do, the conversion math is brutal.
3. **Would it survive a "first-week churn" eval?** If a new user encounters this in their first 7 days, does it help or hinder? If hinder → build later or never.

**Example from styleMeUp:** we explicitly didn't build a social feed even though most fashion apps have one. Reason: contradicts the "private confidence" belief. We didn't build push notifications because they'd break the calm. We didn't build a styling chatbot because it would make us look like every other AI fashion app.

**Pro tip:** build a public "things we'll never build" list and put it in your design doc. It's a forcing function for taste.

---

## DESIGN

### 🟢 Q4. How do you collaborate with designers?

Three principles:

1. **Bring problems, not solutions.** "Users churn after onboarding" → designer can solve. "Add a tutorial overlay on screen 3" → you've already pre-decided.
2. **Write the brand voice down.** Designers can't make consistent choices if there's no shared sense of what "right" feels like.
3. **Stay in the same Figma file.** Comments instead of separate PRD docs that get out of sync.

**Example from styleMeUp:** I wrote `DESIGN.md` (~700 lines) before any screen was designed. It defines the two registers (Magazine = void black + monumental; Sanctuary = paper white + lowercase italic), brand voice with side-by-side examples, color tokens, and the explicit anti-pattern library. Every design decision references back to it. That doc is the contract — designer and engineer can disagree on a screen and the doc breaks the tie.

**Pro tip:** the design doc isn't decorative. If your team can't quote from it, you don't have one.

---

### 🟡 Q5. Critique this design pattern: notification badges.

Notification badges (the red dot with a number) are a pattern the industry has converged on for the wrong reason.

**What they're meant to do:** signal importance, drive return visits.

**What they actually do:** train users that the app is a slot machine. Every red dot is a small dopamine spike disconnected from value. Users learn to dismiss without checking, which destroys the signal.

**When they work:** when the count IS the value (unread emails, message from a specific person). Otherwise, they're a UX cargo-cult.

**Example from styleMeUp:** explicitly banned in `DESIGN.md §4`. The Magazine surface uses a single calm "RETURNING." headline instead of a badge. The user gets the signal through editorial register, not a number.

**Pro tip:** measure post-badge behavior. If 80% of badge-driven opens dismiss without action, you're training negative habits.

---

### 🟠 Q6. When do you ship something that doesn't feel done?

Three conditions where I'd ship "not done":

1. **The first 5 users will tell us more than another week of polish.** Real signal beats theoretical refinement.
2. **The thing not-done is reversible.** Bad copy can be edited. Bad architecture compounds.
3. **The MVP boundary is clear and communicated.** "We're shipping the read path now; write path next sprint" is fine. "We're shipping a half-built thing and hoping no one notices" is not.

**Example from `the-edit`:** V1 publishes manifests to Supabase but the styleMeUp app doesn't read from them yet — it still uses local typed `vol-18-corduroy.md` content. That's "not done" by V2 standard, but the pipeline produces real output and the app integration is V2's first task. We named it as a known gap in `NEXT_STEPS.md` rather than blocking on it.

**Pro tip:** the question is rarely "is it ready?" It's "what does shipping unblock that waiting doesn't?" If the answer is "user feedback," ship.

---

## ANALYTICS

### 🟢 Q7. What metric matters most for a magazine app?

For styleMeUp specifically: **Day 8 return** for users who saved one look in week 1.

Why: the first-week experience is engineered around a single emotional loop (own → signature → capture → tomorrow's look). Day 8 return measures whether that loop landed. If a user returns in week 2 after a successful first week, they're 5-10× more likely to retain at month 1.

**Why not DAU?** DAU rewards push notifications, not value. We banned default push notifications, so optimizing DAU contradicts the brand.

**Why not 30-day retention?** Too lagging. By the time you measure, you've already shipped 4 changes that you can't attribute correctly.

**Example from `the-edit`:** for the Magazine pipeline specifically, the parallel metric is `% of generated issues that pass QA on first try`. Currently low (revise verdict on the last 2 runs). Tracking this lets us catch quality regressions in the prompt executor without waiting for user behavior.

**Pro tip:** every metric is a target you'll optimize for. Pick the one that aligns with the brand belief, not the one that looks good in a board deck.

---

### 🟡 Q8. Walk me through how you'd measure success for a recommendation system.

Three layers, in order:

1. **Output quality** (offline) — does the recommendation match a held-out reference set? Precision at K, NDCG.
2. **User signal** (online) — click-through rate, save rate, dismiss rate.
3. **Behavior change** (long-term) — does engagement compound week-over-week? Are users returning specifically for recommendations?

**The trap:** optimizing for CTR alone leads to clickbait. You need at least one "depth" metric (time spent, completion rate) and one "value" metric (saved, purchased).

**Example from styleMeUp:** the Magazine's "you have the base" matching is a recommendation. Success metric: % of users who tap "build from yours" after seeing the match. Quality metric: did they actually save the resulting outfit? Long-term: did Magazine-driven outfits get worn (if we add wear-tracking)?

**Psychology principle:** picture superiority + endowment effect. Showing the user their owned pieces in a Magazine context closes the loop.

**Pro tip:** before the rec system, write down what success means. After launch, read it again. Most rec systems get measured by "engagement uplift" which becomes "we made it more addictive" without ever asking if quality went up.

---

### 🟠 Q9. What's a metric that looks good but is actually a lie?

**Session length** in a content app.

Looks good: "Users spent 18 min/day in our app — engagement is up 40%!"

What it actually means:
- Users couldn't find what they wanted (high search depth = bad UX)
- Algorithm pushed addictive content (you're optimizing for harm)
- Users got lost in navigation (broken IA)
- The app loaded slowly (counted as "session time")

**Better alternatives:** time-to-first-value, task completion rate, return rate.

**Example from styleMeUp:** for the daily Dressing Room, session length is irrelevant. The right metric is "did the user save today's look or change the mood?" — that measures whether the recommendation worked. A 20-minute session that ends in `not today` is failure; a 90-second session that ends in `wear this` is success.

**Pro tip:** when you see a metric in someone's deck, ask "what would degrade as this number rises?" If the answer is "user trust" or "long-term retention," you've found a vanity metric.

---

## ESTIMATION

### 🟡 Q10. Estimate the market size for fashion AI in the US.

Top-down framing:

- US adult population: ~260M
- Adults who buy clothing online regularly: ~150M (NIST surveys)
- Adults frustrated enough with current shopping/styling to try a new app: ~25M (heuristic — early adopter share)
- Of those, willing to pay $5-20/mo for a styling tool: ~10% = 2.5M
- Average revenue per paying user (ARPU): $12/mo × 12 = $144/year
- **Total addressable market (TAM): ~$360M/year**

Sanity check bottom-up:
- StitchFix peak revenue ~$2B (different model — physical box).
- Stylebook (closet app) probably ~$5-10M revenue.
- Fashion AI tools with subscription models likely $50-200M aggregate today.
- TAM of $360M with current low penetration → big upside.

**Competitive reality check:** the constraint isn't market size, it's product-market fit. Most fashion AI today is a feature inside another product (Pinterest's lens, Amazon's recommendations) rather than a standalone subscription. The opportunity is to be the standalone that's worth opening daily.

**Pro tip:** market sizing in interviews is about showing the framework, not nailing the number. Show top-down + bottom-up + a "what would have to be true" sentence.

---

### 🟠 Q11. How long would this feature take? (Use our magazine pipeline as the example)

Frame it as "to ship to one real user" — that includes integration, testing, edge cases, deploy.

**`the-edit` Magazine pipeline V1 actuals:**
- Repo scaffold + types: 2 hours
- Six executor stubs: 3 hours
- Supabase tables + migrations: 1 hour
- Real run debugging (auth, env, rate limits, model name fix): 3 hours
- Image generation integration: 2 hours
- Variant picker CLI: 1.5 hours
- Cost tracking + caps: 1.5 hours
- Caching: 1 hour
- Search archive: 1.5 hours
- Acid test + fix iterations: 2 hours
- **Total: ~18 hours of focused build over a few days**

**The lesson:** my initial estimate would have been "8 hours" because that's the happy-path code. Real build time is 2-3× that because of debugging + integration + the things you discover only when running real data.

**Estimation rule:** take your gut estimate, double it, then add 30% for integration + 20% for unknown-unknowns. That's the number to communicate.

**Pro tip:** the senior PM trick is breaking work into "to first real user" + "to scale" + "to robust." Three different estimates. Communicate the first; track to all three.

---

### 🔴 Q12. What's the cost of running this product at 100K users?

For styleMeUp at 100K MAU:

**Variable cost per user:**
- Magazine reads (pulled from Supabase): ~$0.001/user/week (storage + bandwidth)
- First-signature LLM calls: ~$0.01/user (one-time, cached system prompt)
- Capture upload (if image processing): ~$0.05/user (one-time)
- Daily Dressing Room recommendation: ~$0.001/user/day = $0.03/month

**Per-user monthly run cost:** ~$0.10

**Fixed costs:**
- Supabase Pro: $25/mo
- Vercel Pro: $20/mo
- Anthropic + Gemini API spend on Magazine pipeline: ~$5/mo (1 issue/week × $1.20)
- Domain, monitoring, misc: ~$50/mo
- **Total fixed: ~$100/mo**

**At 100K MAU: $100 fixed + (100K × $0.10) = $10,100/mo**
- ARPU needed to break even: ~$0.10/MAU
- ARPU needed for 50% margin: ~$0.20/MAU
- ARPU possible from 5% paid conversion at $15/mo: $0.75/MAU

**Conclusion:** at 100K users with 5% conversion at $15/mo, gross margin is ~85%. Healthy. The unit economics work; the bottleneck is acquisition cost.

**Pro tip:** the question isn't "what's the cost" — it's "what's the cost per dollar of revenue." Always frame in CM% or LTV/CAC, never in absolute dollars.

---

## STRATEGY

### 🟡 Q13. Our competitor just launched our killer feature. What do you do?

Three-step response:

1. **Don't react in 48 hours.** The temptation is to ship a "me too" version. Resist. The competitor's launch doesn't change your roadmap — it changes the urgency of one item, maybe.
2. **Audit what they actually shipped vs marketing.** Most competitor launches are 30% real, 70% press release. Try the feature. Test it.
3. **Ask: does this change our positioning or just our table stakes?**
   - **Table stakes:** ship a credible version when it's natural in roadmap. Don't differentiate; don't lag.
   - **Positioning shift:** rethink your wedge. They've chosen to compete on this axis — go win a different one.

**Example from styleMeUp:** if a competitor launches a "weekly fashion magazine generated by AI" — that's our `the-edit` pipeline. We don't panic. We ship faster, but we also lean harder into what they can't easily copy: the brand voice, the §4 anti-pattern library, the diverse-by-default model rotation. Differentiation is in the constraints, not the feature.

**Pro tip:** competitors copying your feature is the highest compliment. Move on to the next one.

---

### 🟠 Q14. We have $1M and 6 months. Where do you spend it?

Default allocation for an early-stage consumer product:

- **40% engineering** ($400K) — 2 senior engineers for 6 months. They build the product.
- **20% design** ($200K) — 1 senior designer + brand lead. They make it beautiful and consistent.
- **20% acquisition** ($200K) — but only after PMF. Otherwise → save it.
- **10% infra & tools** ($100K) — Supabase, Vercel, Anthropic, monitoring, design tools.
- **10% reserve** ($100K) — runway extension if anything slips.

**The actual answer depends on what's bottlenecking growth:**
- No PMF yet → all engineering + design, zero marketing.
- PMF + low awareness → marketing dominates.
- PMF + saturating channels → product depth.

**Example from styleMeUp:** at this stage (V1 of pipeline, V1 of app), I'd put 90% into product. Marketing is wasted on a product that won't retain. Once we have one working acquisition channel and clear retention proof, then shift dollars.

**Pro tip:** "where do you spend it" is a values question more than a math question. Show that you'd rather waste runway than ship marketing-led product.

---

### 🔴 Q15. The CEO wants you to add a feature you think hurts the product. How do you push back?

Frame it as data, not opinion.

1. **Acknowledge the goal.** "You want X — I think the underlying intent is Y. Did I get that right?"
2. **Show the cost.** Engineering hours, opportunity cost vs other roadmap items, projected user impact.
3. **Show the alternative.** "The same outcome could be achieved by Z, which doesn't compromise [the principle]."
4. **Ask for a trial.** "Can we A/B test it? If it improves [metric], we keep it. If not, we revert."
5. **If they still say yes after all that — build it.** Not your call to override.

**Example from styleMeUp:** if a hypothetical CEO insisted on push notifications by default, my pushback would be: "Default-on push will lift week-1 DAU 20% but cut month-3 retention by ~30% based on similar fashion apps. Our brand belief is 'quiet utility'; default-push contradicts it. Alternative: opt-in push with a single high-quality weekly notification. Test the alternative first; if metrics aren't there, we can revisit."

**Pro tip:** the framing "I disagree, here's why, and here's what I'd do instead" beats "I disagree" every time. Senior PM = solution-bringing, not objection-bringing.

---

## STAKEHOLDER MGMT

### 🟢 Q16. Eng says 6 months. CEO wants 6 weeks. Now what?

Negotiate scope, not timeline.

**Step 1.** Get specific. "What is the 6-week version vs the 6-month version?" Force a granular trade-off.

**Step 2.** Identify the value-bearing core. What's the 20% of scope that delivers 80% of the value?

**Step 3.** Ship the core in 6 weeks; communicate clearly that it's a pilot. Plan iteration on the full vision over the remaining 4.5 months.

**Step 4.** If the core can't ship in 6 weeks, name it. "We can't honestly do this in 6 weeks. Here's why." Give the CEO a real choice.

**Example from `the-edit`:** the V1 timeline was "ship a full Magazine pipeline." If asked to halve it, I'd ship just `draft → publish` with manual prompt suite and human-generated images, deferring the imagine + pick steps. Real value goes out; automation comes later.

**Pro tip:** never agree to a deadline you don't believe in. The cost of saying yes and missing is higher than the cost of saying no and counter-proposing.

---

### 🟡 Q17. Marketing wants a quick win. The right thing is a long bet. Decide.

If they're meaningfully in conflict, the long bet wins — but you owe marketing a concession.

**Concession options:**
1. **Run the quick win as a temporary growth experiment** — explicitly time-boxed, with clear success criteria.
2. **Reorder roadmap items so marketing has SOMETHING new each quarter** — even if the big bet is the focus.
3. **Co-own the long bet with marketing** — let them shape the launch story so they have skin in the game.

**Example from styleMeUp:** if marketing wanted "viral feature" we'd say no — defies the brand belief. Counter-offer: a quiet PR moment around a Magazine issue, an editorial partnership with a fashion outlet, or a referral program tied to the daily ritual. Real growth, not viral mechanics.

**Pro tip:** marketing isn't your enemy. They're a stakeholder with their own KPIs. If you keep saying no without offering an alternative, you'll lose the next political battle even when you're right.

---

### 🟠 Q18. Legal flagged a feature. How do you de-risk it without killing it?

Legal almost never says "absolutely don't ship this." They say "here's the risk." Your job is to lower the risk to acceptable.

**Process:**
1. **Get specific on the risk.** Privacy? IP? Regulatory? Liability? Different mitigations apply.
2. **Find the smallest scope change that meets legal's bar.** "Only show this to users 18+." "Add a disclaimer." "Don't store the input."
3. **Document the call.** Email or memo: "We discussed X risk, agreed on Y mitigation, deciding to ship Z." Legal owns the call as much as you do.
4. **Re-engage if scope changes.** Legal-approved features can drift.

**Example from styleMeUp:** the diverse-model image generation in `the-edit`. Legal could flag "what if Gemini generates a recognizable real person?" Mitigation: prompt explicitly says "no real-person likeness, no celebrity reference." Add to QA executor's check list. Document. Ship.

**Pro tip:** legal that says "no" to a clear-cut shipping question is doing their job poorly. Reframe their objection as a constraint, not a veto.

---

## A few questions specific to building styleMeUp + `the-edit`

### Q19. Why two repos instead of one?

Three reasons:

1. **Different runtimes.** styleMeUp is React Native (Expo); `the-edit` is Node TypeScript with server-side LLM calls. Bundling them mixes concerns.
2. **Different security model.** the-edit has provider keys (Anthropic, Gemini, Supabase service role). The Expo app has none of that.
3. **Different deploy cadence.** Magazine pipeline runs weekly; the app deploys on user-facing changes. Coupling them slows both.

The contract between them is the `magazine_issue_manifests` table in Supabase. App reads from it; pipeline writes to it. Clean interface.

**Pro tip:** the right repo boundary is "different runtime / different security / different deploy" — not "different feature."

---

### Q20. Walk me through the cost evolution of your AI pipeline.

Five distinct cost regimes I've been through with `the-edit`:

| Stage | Per-run cost | What changed |
|---|---|---|
| First broken run | $0 | Auth failures, no real cost |
| First uncapped run | $0.97 | Web search ran 23 queries, 292 sources, 231K input tokens |
| After max_uses cap | $0.48 | 5 queries, 47 sources, structuring inside rate limit |
| After image generation added | $1.57 | +$1.10 for 28 Gemini images |
| After caching + per-slot routing | ~$1.20 | Cache reads cut QA cost 80%; smaller model on cards |
| Steady state with archive hits | ~$1.05 | Skip web search entirely on repeat trends |

The lessons: the first run is always more expensive than you expect. Caps are mandatory. Caching is worth the complexity. Cross-script cap state matters (one of our P0 bugs was per-script tracking missing the draft's spend).

**Pro tip:** track cost per "completed user task," not per call. A failed run that cost $0.30 is more expensive than a successful one at $1.20.

---

## How to use this doc

- For each question, give yourself 60-90 seconds to think aloud, then read the answer.
- Notice which examples come naturally vs which feel forced. Keep building until they all feel natural.
- After every major build iteration, extend at least one answer with the new example. The longer you build, the more lived stories you have.

## Topics still to add (after next iteration)

- Pricing strategy (free vs freemium vs paid)
- Internationalization decisions
- B2B vs B2C product instincts
- How to interview your own users
- Building a moat without locking users in
- When to deprecate a feature
- Onboarding flow optimization
- Working with founders vs hired execs
- Influence without authority across functions
