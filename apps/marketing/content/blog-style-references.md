# Engineering Blog — Style References

A curated list of engineering blog posts whose style we want to emulate for CoderScreen's
technical deep-dives (e.g. the multiplayer editor / Cloudflare / Yjs posts). Use this as the
voice-and-structure reference when drafting.

## The common style DNA (what all of these share)

1. **A concrete, specific title — usually with a number or a system name.** "Scaling PostgreSQL
   to power 800 million ChatGPT users", "ANN v3: 200ms p99 query latency over 100 billion vectors",
   "Migrating millions of lines of code to TypeScript". Never generic ("Our tech stack").
2. **Real numbers, not adjectives.** p99 latencies, QPS, row counts, bundle sizes, uptime nines.
   Credibility comes from measurements, not marketing words.
3. **Lead with the problem and the constraint.** They open with the wall they hit ("Cracks in our
   initial design", "SEVs caused by Postgres overload") before any solution.
4. **Honest about tradeoffs and failure modes.** They say what they hate, what broke, what they'd
   do differently. turbopuffer and Stripe both name the ugly parts explicitly.
5. **Architecture over gloss.** Diagrams, data models, code snippets, the actual protocol — enough
   for an engineer to rebuild it, not a product pitch.
6. **Story structure, single author voice.** "How we built it" narrative arc, written by a named
   engineer, first-person plural. Product mention (if any) is incidental, at the end.
7. **A "what we learned" / takeaways close.** Distilled lessons a reader can carry to their own system.

---

## OpenAI — one flagship systems post

- **[Scaling PostgreSQL to power 800 million ChatGPT users](https://openai.com/index/scaling-postgresql/)**
  — Jan 22, 2026, by Bohan Zhang.
  *Steal:* the number-in-the-title formula; the "Cracks in our initial design" → challenge/solution
  section pattern (each subsection is literally `Challenge:` / `Solution:`); brutal honesty about
  MVCC write amplification; linking out to a deeper technical piece for credibility ("The Part of
  PostgreSQL We Hate the Most"). This is the gold standard for "one authoritative deep-dive."

## turbopuffer — the whole blog (deep systems, benchmark-driven)

The tightest match for our engineering-post voice: dense, numbers-forward, systems-y, honest.

- **[Training SID-1 to beat GPT-5 at search with 1k+ QPS RL](https://turbopuffer.com/blog/reinforcement-learning-sid-ai)** — May 20, 2026
- **[Mixing numeric attributes into text search for better first-stage relevance](https://turbopuffer.com/blog/rank-by-attribute)** — Apr 27, 2026
- **[Rust zero-cost abstractions vs. SIMD](https://turbopuffer.com/blog/zero-cost)** — Feb 18, 2026
- **[How to build a distributed queue in a single JSON file on object storage](https://turbopuffer.com/blog/object-storage-queue)** — Feb 12, 2026
- **[ANN v3: 200ms p99 query latency over 100 billion vectors](https://turbopuffer.com/blog/ann-v3)** — Jan 21, 2026
- **[Designing inverted indexes in a KV-store on object storage](https://turbopuffer.com/blog/fts-v2-postings)** — Jan 14, 2026
- **[Why BM25 queries with more terms can be faster (and other scaling surprises)](https://turbopuffer.com/blog/bm25-latency-musings)** — Jan 7, 2026
- **[Vectorized MAXSCORE over WAND, especially for long LLM-generated queries](https://turbopuffer.com/blog/fts-v2-maxscore)** — Dec 9, 2025
- **[FTS v2: up to 20x faster full-text search](https://turbopuffer.com/blog/fts-v2)** — Dec 4, 2025
- **[Native filtering for high-recall vector search](https://turbopuffer.com/blog/native-filtering)** — Jan 21, 2025
- **[Continuous recall measurement](https://turbopuffer.com/blog/continuous-recall)** — Sep 4, 2024
- **[turbopuffer: fast search on object storage](https://turbopuffer.com/blog/turbopuffer)** — Jul 8, 2024

*Steal:* titles that are a claim + a number ("up to 20x faster", "200ms p99 over 100 billion");
counterintuitive framings ("Why BM25 queries with more terms can be *faster*"); willingness to go
all the way down to SIMD/data-layout detail; "scaling surprises" as a hook.

## Stripe — Engineering blog (the "How we built it" series)

Polished, narrative, "How we built it" arc — closest to how our posts should read for a mixed
eng + eng-leader audience.

- **[Can AI agents build real Stripe integrations? We built a benchmark to find out](https://stripe.com/blog/can-ai-agents-build-real-stripe-integrations)** — Mar 2, 2026 (Carol Liang, Kevin Ho)
- **[How we built it: Real-time analytics for Stripe Billing](https://stripe.com/blog/how-we-built-it-real-time-analytics-for-stripe-billing)** — Sep 16, 2025 (Reed Trevelyan)
- **[How we built it: Jurisdiction resolution for Stripe Tax](https://stripe.com/blog/how-we-built-it-jurisdiction-resolution-for-stripe-tax)** — Jul 10, 2025 (Erich Rentz, Danko Komlen)
- **[How Stripe's document databases supported 99.999% uptime with zero-downtime data migrations](https://stripe.com/blog/how-stripes-document-databases-supported-99.999-uptime-with-zero-downtime-data-migrations)** — Jun 6, 2024
- **[Test clocks: How we made it easier to test Stripe Billing integrations](https://stripe.com/blog/test-clocks-how-we-made-it-easier-to-test-stripe-billing-integrations)** — May 9, 2024
- **[Shepherd: How Stripe adapted Chronon to scale ML feature development](https://stripe.com/blog/shepherd-how-stripe-adapted-chronon-to-scale-ml-feature-development)** — Apr 15, 2024
- **[Ledger: Stripe's system for tracking and validating money movement](https://stripe.com/blog/ledger-stripe-system-for-tracking-and-validating-money-movement)** — Feb 16, 2024
- **[Simplifying payment methods code in our new API version](https://stripe.com/blog/dynamic-payment-methods)** — Aug 17, 2023
- **[How we built it: Stripe Radar](https://stripe.com/blog/how-we-built-it-stripe-radar)** — Mar 29, 2023
- **[How Stripe builds interactive docs with Markdoc](https://stripe.com/blog/markdoc)** — Sep 13, 2022
- **[Migrating millions of lines of code to TypeScript](https://stripe.com/blog/migrating-to-typescript)** — May 20, 2022
- **[Fast builds, secure builds. Choose two.](https://stripe.com/blog/fast-secure-builds-choose-two)** — May 4, 2022
- **[Sorbet: Stripe's type checker for Ruby](https://stripe.com/blog/sorbet-stripes-type-checker-for-ruby)** — Mar 28, 2022
- **[Stripe's payments APIs: The first 10 years](https://stripe.com/blog/payment-api-design)** — Dec 15, 2020
- **[To design and develop an interactive globe](https://stripe.com/blog/globe)** — Sep 1, 2020
- **[Similarity clustering to catch fraud rings](https://stripe.com/blog/similarity-clustering)** — Feb 20, 2020
- **[Introducing the Stripe CLI](https://stripe.com/blog/stripe-cli)** — Nov 5, 2019
- **[Designing accessible color systems](https://stripe.com/blog/accessible-color-systems)** — Oct 15, 2019

*Steal:* the "How we built it: [system]" title template; naming your systems ("Ledger", "Shepherd",
"Test clocks") so the post is memorable and citable; a named engineer as author; the interactive-globe
and color-systems posts show even frontend/design work gets the deep-dive treatment.

## Replit — CodeMirror trilogy (directly on-topic for us)

Most relevant references — same editor stack (CodeMirror 6), same "why we chose it / what was hard"
angle we're writing about. Study these closely for our editor posts.

- **[Betting on CodeMirror](https://replit.com/blog/codemirror)** — Mar 9, 2022, by Sergei Chestakov.
  Why they migrated Monaco → CodeMirror 6: mobile support, clunky API, customization, bundle size.
  Ends on open-source contributions. *Steal:* the "betting on [choice]" decision-narrative framing.
- **[Ace, CodeMirror, and Monaco: A Comparison of the Code Editors You Use in the Browser](https://replit.com/blog/code-editors)** — Dec 13, 2021, by Faris Masad.
  Head-to-head comparison scored across stability/performance/mobile/extensibility, with candid
  reflections. *Steal:* the scored, multi-dimension comparison table + honest implementation notes.
- **[A New Code Editor for Mobile — CodeMirror 6](https://replit.com/blog/codemirror-mobile)** — Sep 20, 2021, by Faris Masad.
  Touchscreen-optimized editing as the foundation of a mobile strategy. *Steal:* framing a technical
  choice around a concrete user constraint (people coding without a computer).

---

## How to apply this to a CoderScreen post

- Title = concrete claim or system name, ideally with a number. Not "How we built multiplayer editing"
  but "Keeping two editors in sync when the Wi-Fi drops: our Yjs + Durable Objects architecture."
- Open with the wall we hit, not the product.
- Show the data model, the protocol, real code. Put in **measured** numbers (cold-start ms, sync
  latency, snapshot size) — don't fabricate them.
- Have a "what was actually hard" and a "what we'd do differently / takeaways" section.
- Named author, first person. Product link at the very bottom.
</content>
