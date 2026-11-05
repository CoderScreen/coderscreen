# Data Extraction Plan — remaining work to finish `blog-post.md`

What's left to turn the naive-preview numbers into publishable ones. Ordered by priority; the title section (§8 skills-that-pay) is the top gate.

## Where we are

| Done | Detail |
|---|---|
| ✅ Scrape | 2,652 eng JDs (5,281 total) across ~1,400 YC cos + full raw archive (`raw_docs`, gzipped HTML) |
| ✅ Pay/hiring analysis | `findings.ts` — salary, equity, transparency, interview formats, new-grad-by-size (all cross-sectional, verified) |
| ✅ Skill×pay preview | `skill-pay.ts` — naive keyword; AI-native +9%, top/bottom skills, seniority-partial-control |
| ✅ Skill extraction TEST | `extract-skills.ts` on 20 jobs, gpt-4.1, 2.5% evidence-fail |

Post sections by data status: **SOLID** (intro, §1–4, §6, §9) · **FIRM** (§5) · **EXTRACT** (§7, §8).

---

## The remaining passes

### P0 — Full skill extraction  ·  unblocks §7 + §8 (the title)  ·  **do first**
- **What:** run `extract-skills.ts` over the remaining **2,632** eng JDs → `job_skills` (canonical_skill, category, required/preferred, evidence-guarded).
- **Command:** `OPENAI_API_KEY=sk-... bun run src/extract-skills.ts --limit=3000 --model=gpt-4.1`
- **Cost/time:** ~$17 sync (~$8 if we build a Batch-API variant) · ~20–35 min · resumable (skips done job_ids).
- **Decision:** sync is fine at this volume; only build the Batch-API variant if/when we add enterprise sources (10k+). Use **gpt-4.1** (not mini) since this pass carries the title claim.
- **Check:** `bun run src/stats.ts`; spot-review `data/extraction-sample.md` (first 40).

### P0.1 — Per-JD AI signal  ·  makes §8's "AI-native +9%" defensible
- **What:** a JD-level classification: `ai_in_workflow` (native/expected/optional/none) vs `ai_in_product` (core/feature/none) + `ai_expectation` (required/preferred/none) + `salience 0–3`. Replaces the naive "AI-native framing" regex cohort.
- **How:** **recommended — extend the P0 extraction schema** to emit a top-level `ai_signal` object alongside `skills[]` (one pass, ≈ no extra cost). Fallback: a separate small pass.
- **Powers:** §7b (AI skill set) and §8 (the AI-native pay premium, cleanly).

### P1 — Skill normalization / controlled vocabulary  ·  depends on P0
- **What:** `normalize-skills.ts` — map `canonical_skill` → a controlled vocab (O*NET Hot Technologies + ESCO, both CC BY 4.0) + a hand-curated alias table for fast-moving AI/JS tooling; dedupe variants; tag an **AI-skill family** (coding-agent / eval / RAG / LLM-ops / fine-tuning / vector-db / prompt-eng).
- **Why:** clean per-skill counts (§7) and the AI sub-taxonomy (§8). Publish the alias table (methodology credibility).
- **Cost:** deterministic code, no API.

### P0.2 — Rigorous skill × pay analysis  ·  the §8 deliverable  ·  depends on P0 + P1
- **What:** recompute per-**required**-skill median salary + equity, premium vs baseline, **controlled for seniority (and stage)**. Two acceptable methods:
  1. *Matched bands* (simplest): report each skill's premium **within a fixed experience bucket** (e.g. 3+ yrs), which we already prototyped in `skill-pay.ts`.
  2. *Regression* (appendix): `log(salary) ~ skill dummies + experience + stage + industry` → isolate the skill coefficient.
- **Output:** the ranked "skills that pay" table + AI-native premium (controlled) + equity-premium — publishable §8 numbers. Recommend method 1 in the body, method 2 in a methodology appendix.

### P2 — Interview-process classifier  ·  unblocks §5
- **What:** LLM-classify the **627** `interview_process` texts into canonical stages (take-home / paid-trial / live-coding / system-design / pairing / founder-round / LeetCode), each with an evidence quote. Kills keyword false positives ("free trial" of a product, "algorithm" as a domain term).
- **Plus (blocking):** **manual LeetCode-negation check** — hand-verify all ~32 LeetCode quotes before the "mostly disavowed" line ships; else downgrade to "LeetCode is the rarest named format."
- **Cost:** ~$1–3 (short texts) · minutes. New script `classify-interviews.ts` (mirrors `extract-skills.ts`).

### P3 — Validation / methodology credibility  ·  do before publishing
- **What:** hand-label a **~120-JD gold set** for skill extraction → publish precision / recall / F1. Verify the LeetCode quotes (P2). Optionally validate ~50 AI-signal labels.
- **Why:** the published accuracy number is what makes the whole thing survive HN/Reddit scrutiny.
- **Cost:** your time (labeling), no API.

### P4 — Chart / table generation  ·  final
- **What:** produce the ~8 hero visuals from the finalized analyses: salary-by-role bars, equity distribution strip, 2×2 levers, disclosure bars, interview-format bars, new-grad-by-size, top-skills (required/preferred), **skills-that-pay ranked (the hero)**.
- **How:** a small analysis script/notebook (DuckDB/pandas + matplotlib, or a JS chart export) → PNG/SVG for the MDX post at `apps/marketing/content/blog/`.

---

## Dependency graph

```
scrape ✓ ─┬─> P0 skill extraction ─┬─> P1 normalize ─> P0.2 skill×pay ─> §7/§8 prose
          │   (+ P0.1 ai_signal)   │
          │                        └────────────────────────────────────> §7 stack
interview_process ✓ ─> P2 classifier + manual LeetCode check ───────────> §5 prose
all analyses ─> P3 validation ─> methodology / accuracy number
finalized numbers ─> P4 charts ─> MDX post
```

## Cost & time summary

| Pass | API cost | Wall time | Blocking for |
|---|---|---|---|
| P0 skill extraction | ~$8–17 | 20–35 min | §7, §8 |
| P0.1 ai_signal | ~$0 (folded into P0) | — | §8 |
| P1 normalize | $0 | ~1 hr code | §7, §8 |
| P0.2 skill×pay | $0 | ~1 hr code | §8 |
| P2 interview classifier | ~$1–3 | minutes + your review | §5 |
| P3 validation | $0 | your labeling time | methodology |
| P4 charts | $0 | ~2 hr code | all visuals |
| **Total API** | **~$10–20** | | |

## Decisions to make
1. **Fold `ai_signal` into the skill-extraction pass** (recommended, one run) vs a separate pass.
2. **Model:** gpt-4.1 for the title-bearing extraction (recommended) vs gpt-4.1-mini to save ~$14.
3. **Seniority control for §8:** matched-band in the body + regression in an appendix (recommended).
4. **Sync vs Batch API:** sync now; Batch only if we scale beyond YC.

## Immediate next action
Run **P0** (needs your `OPENAI_API_KEY`). If you want P0.1 folded in, say so first and I'll extend the extraction schema before you run it — that saves a second pass.
