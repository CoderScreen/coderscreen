# CoderScreen Engineering Blog — Deep-Dive Style Guide

A prescriptive checklist for writing engineering deep-dives, synthesized from a reference corpus of OpenAI, turbopuffer, Stripe, and Replit posts. Follow it like a spec.

## 1. The essence

Write result-first, number-dense engineering deep-dives that lead with the wall you hit, teach the naive baseline before revealing the "earned-complexity" solution, and quantify every claim with units and context. Voice is first-person-plural "we" (with an "I"-voiced human intro), honest about tradeoffs and failure modes, scaffolded so a non-specialist can follow, and closed with a takeaway that generalizes beyond the feature. Prefer monospace ASCII diagrams for structure and block-bar charts for magnitude; reserve rendered figures for real screenshots and continuous curves. No "Fig. N" numbering, ever.

## 2. Titles — formulas, examples, rules

Pick one formula and make it concrete:

- **Capability + quantified benefit** — "FTS v2: up to 20x faster full-text search" (turbopuffer)
- **How we built it: X** — "How we built it: Stripe Radar" (Stripe house format; colon does the work)
- **Scale-flex with a hard number** — "Scaling PostgreSQL to power 800 million ChatGPT users" (OpenAI)
- **Decision-narrative / conviction** — "Betting on CodeMirror" (Replit)
- **Contrarian / curiosity hook** — "Why BM25 queries with more terms can be faster" (turbopuffer)

**Rules:** be specific over abstract; never generic ("Introducing X"). Put a real number in the title if you have one. Use a colon to pair a system/codename with a plain-English gloss. "X vs Y" signals a tradeoff you'll walk through.

## 3. Openings — lead with the wall you hit

State the result or the problem in sentence one. No throat-clearing. Patterns to copy:

- **Punchline number, then promise the mechanism:** "We reduced latency from 220ms → 47ms" — payoff first.
- **The wall / surprising premise:** name the hard problem plainly ("Online payment fraud is a hard problem to solve"), then name your system as the answer.
- **Scale-first stat hook:** open on a jarring number before naming the system.
- **Human/origin-story lead (big posts only):** one engineer's "I"-voiced scene, then shift to "we."

Close the intro with an explicit roadmap sentence ("In this post, we'll…"). A signature move: follow the opening paragraph immediately with a benchmark chart that proves the claim before you explain it.

## 4. Structure & skeleton

**Skeleton:** Hook + result → (proof chart) → Background/Context (teach the naive baseline) → why naive fails → the design/solution → results (charts + tables) → Conclusion with generalizable takeaway → CTA footer.

**Header style:** `##` for sections, `###` for sub-steps. Make headers argue or narrate, not just label:
- Argument: "Vector search + filters != filtered vector search"
- Journey/step: "Step 1: queue.json" → "Step 2: …" → "Ship it"
- Challenge:/Solution: pairs for the hard middle (OpenAI pattern) — great for enumerating optimizations.

**TL;DR:** no labeled block; the result-first opening *is* the TL;DR. Longer posts add a `## Conclusion` with a bulleted takeaways list.

**Length:** short announcement ~600–800 words; medium deep-dive ~1,500–2,500; flagship ~3,000–5,000. Target the medium band unless the story demands more.

## 5. Voice & sentence style

- **Person:** default "we"; "I" for the human intro and first-person experiments; "let's" to walk the reader through reasoning; "you" for explanatory asides.
- **Tense:** present for how the system works today, past for the build narrative, future for roadmap.
- **Honesty:** call your v1 simplistic, name the honest downsides ("the occasional cold query ~500ms"), and frame complexity as *earned*. This is a signature trait — do not skip it.
- **Jargon:** scaffold it. Teach the naive baseline first; gloss every acronym on first use, then abbreviate; use analogies to domesticate hard concepts.
- **Rhythm:** crisp declaratives varied with short punchy fragments for emphasis ("That's too slow."). Rhetorical questions set up the next section. Dry, understated humor is welcome; never forced.

## 6. Numbers & evidence

- **Quantify everything** — numbers substitute for adjectives. Carry units, percentiles (`p90`, `p99`), and named datasets/scale.
- **Before/after deltas** are the strongest device: "50 ms → 5 ms," "reduced train time by over 85%."
- **Napkin math:** compute an expected number from first principles, compare to measured reality, and make the gap the story.
- **Tables** for precise multi-variable data; **every benchmark table needs an explicit delta/speedup column** so readers don't compute the improvement. Keep comparison tables to ≤5 columns, label column first.
- **Caveat honestly:** asterisks and editor's notes ("these numbers are meant to be directional") build trust.
- Name customer/impact proof points specifically.

## 7. Code snippets

- **When:** only when the code is load-bearing evidence for an argument — not as documentation. Deep engineering posts; skip in pure announcements.
- **Length:** short. Type aliases and ~15-line "simplified skeletons," not full implementations. Label them "simplified."
- **Annotation:** almost always. Inline comments explain intent; prose immediately before/after walks through what the snippet demonstrates.
- **Before/after pairs** work well (untyped call with `# ???` → corrected version). Show API/JSON examples in fenced blocks; put resource names in `Capitalized` backticks.

## 8. Images & visuals

Two schools: turbopuffer = *visuals-as-text* (emulate this); Stripe = *visuals-as-rendered-art* (for screenshots/curves). Rules:

1. **No figure numbers, no "Fig."** Introduce with the sentence before; interpret in the sentence after.
2. **Prefer monospace ASCII / box-drawing diagrams** (`╔═║┏━┓`) for architecture, data structures, and flows. They render everywhere and diff in git.
3. **Put the title + units *inside* the block** as the first line (e.g. `editor sync latency (p90, 50 concurrent clients)`) so it's self-describing without a caption.
4. **Show magnitude with block-bar charts** (`░`/`▓`/`█`) and append the exact number to each bar (`before ░░░░░ 220 ms / after ▓ 47 ms`); one fill for baseline, another for new.
5. **Add an inline legend** whenever glyphs carry meaning (`Q: query · +: match · -: no match`).
6. **Ship a mobile-narrow twin** of any diagram wider than ~40 chars (a stacked vertical version right after).
7. **Diagrams schematic; precise curves rendered.** Use ASCII for structure/relationships; use a real or interactive plot for continuous data (latency-vs-QPS, recall curves), especially log-scale.
8. **Real screenshots get a standalone descriptive caption** (sentence case, no "Fig.", Stripe-style) and redact sensitive data with a note ("some details blocked for privacy").
9. **Density:** one visual every ~2–4 paragraphs (~4–10 total). Each must earn its place by illustrating the surrounding claim.
10. **Fall back to inline metrics, not empty space** — state the number inline with units if a claim doesn't merit a chart.

## 9. Closings

- A `## Conclusion` (or "Ship it" / "Looking ahead") that recaps the mechanism and pulls out a **durable takeaway that generalizes beyond the feature** ("production profiles trump theory and abstraction").
- Optional forward-looking teaser: what's next, what's still unfinished (admitting this builds trust).
- **CTA placement:** keep the body free of hard sales; let the engineering persuade. Put a light, consistent CTA in a boilerplate footer — a warm invitation (try it / read the docs / we're hiring), not an aggressive pitch. End on a sincere one-liner ("Thanks for reading through this deep dive.").

## 10. Do / Don't checklist

**Do**
- Lead with the result or the wall you hit
- Quantify every claim with units + context
- Teach the naive baseline before the real solution
- Name your v1's flaws and your design's honest downsides
- Give every benchmark table a delta/speedup column
- Use ASCII diagrams + block-bar charts; ship mobile twins
- Close with a takeaway that generalizes

**Don't**
- Open with throat-clearing or a generic "Introducing X"
- Leave a claim unquantified or a number without units
- Use "Fig. N" numbering or academic captions
- Dump full code implementations (use simplified skeletons)
- Force a weak visual — fall back to an inline metric
- Bury a head-to-head comparison in prose (tabulate it)
- End on an aggressive sales CTA in the body

---

## 11. Applied plan — "How we built a multiplayer code editor with Cloudflare, Yjs, and CodeMirror"

**Framing:** Replit's decision-narrative voice + OpenAI's Challenge:/Solution: rigor. Title candidates: "How we built a multiplayer code editor with Cloudflare, Yjs, and CodeMirror" or the conviction variant "Betting on CRDTs: our multiplayer editor stack." Open on the wall — concurrent edits corrupting a shared doc, or the latency floor you had to beat — then a one-line roadmap.

### Recommended section outline

1. **The wall** — what broke when two people typed at once; the payoff number up front (edit-to-render latency, concurrent cursors).
2. **Background: the CodeMirror mental model** — functional core / imperative shell, transactions dispatching immutable state, document as a tree. Teach this before layering collaboration.
3. **Why CRDTs (Yjs) over OT** — scored head-to-head rubric (Yjs vs OT/automerge) with an honesty disclaimer.
4. **Architecture: clients ⇄ Cloudflare edge ⇄ Durable Object room ⇄ storage** — the system diagram + how a keystroke flows through it.
5. **Challenge:/Solution: the hard middle** — syncing concurrent edits, presence/awareness, persistence & reconnect, wire-format size. One Challenge:/Solution: pair each.
6. **Results** — latency and scaling benchmarks (tables + block-bar charts).
7. **Conclusion** — generalizable takeaway + light "try it / we're hiring" footer.

### Figure list

1. **System architecture (ASCII box-drawing + mobile twin)** — browser clients ⇄ WebSocket/Cloudflare edge ⇄ Durable Object room ⇄ object storage.
   Caption/in-block title: `multiplayer editor architecture — client ──WS──▶ [Durable Object room] ──▶ storage`
2. **CRDT sync sequence diagram (ASCII, with glyph legend)** — two clients, concurrent insert at same position, local optimistic apply, broadcast, server ordering, convergence.
   Caption: `concurrent inserts from A and B converging to one document (legend: ▸ local edit · ⇄ broadcast · ✓ converged)`
3. **Document-model data structure (ASCII)** — the Yjs sequence / CodeMirror doc tree with node boxes and pointers.
   Caption: `document model — Yjs shared type mapped onto the CodeMirror tree`
4. **Conflict resolution before/after (ASCII two-panel)** — left: naive last-write-wins loses an edit; right: CRDT merge preserves both.
   Caption: `last-write-wins (left) drops an edit; CRDT merge (right) keeps both`
5. **Latency block-bar chart (+ mobile twin)** — local echo vs round-trip vs cold reconnect, `▓`/`░` bars with ms values.
   Caption/in-block title: `edit-to-render latency (100 concurrent cursors) — local ▓ 4 ms · round-trip ░░ 47 ms · cold reconnect ░░░░ 220 ms`
6. **Scaling table with a delta column** — concurrent users per room vs p50/p99 sync latency and ops/sec.
   Caption: `sync latency vs concurrent editors per room (dataset: N-key/s synthetic load), with p99 delta column`
7. **Presence/awareness screenshot (rendered)** — real UI with multiple cursors, selections, avatars.
   Caption: `Live presence: three collaborators editing the same file, cursors and selections colored per user (account details redacted for privacy)`
8. **(Optional) Wire-format size table** — payload bytes per keystroke/op before vs after batching/compression, with a `-Nx` reduction column.
   Caption: `per-op wire size before vs after update batching, with reduction multiplier`

Prioritize figures 1–5 (pure ASCII, they carry the systems story); add 6–8 for the benchmarks-and-product section.
