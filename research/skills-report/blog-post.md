# Knowing AI Doesn't Pay at YC Startups — Building the Infrastructure Under It Does (I Analyzed 2,652 Salaries)

**Working title.** Alternatives:
- *The Highest-Paying Engineering Skills at YC Startups Are Infra and ML Systems — Not React, and Not "Using AI."*
- *I Analyzed 2,652 YC Salaries by Skill. Calling an LLM API Pays Nothing; Building the Systems Under It Pays 12% More.*

> **Note (2026-07):** rebuilt on the full LLM skill extraction (2,601 eng JDs, 28k skills). The earlier naive-keyword "AI-native pays +9%" claim **did not survive** extraction + seniority control — the real premium is for infrastructure/ML-systems depth, not "using AI." Numbers below are the rigorous ones.

**Full section breakdown.** The post climaxes on skill × pay: it walks through how YC startups pay (flat salary, wild equity), then lands on the payoff — **which skills actually move the number** — and the answer is AI. Status tags: `SOLID` = verified · `FIRM` = needs interview classifier + LeetCode check · `EXTRACT` = needs full LLM skill extraction. See `data-extraction-plan.md` for how each `FIRM`/`EXTRACT` tag gets resolved.

The "how I did it" methodology is folded into the intro (no standalone section).

---

## Intro (hook) · `SOLID`

**Purpose:** Foreground the payoff question — *which skills pay more* — then set up the surprising route to the answer.

**Beats:**
- Scraped every open engineering role on YC's Work at a Startup — **2,652 jobs, ~1,400 startups** — to answer one question: which skills actually get you paid more?
- First surprise: the *salary* barely moves. Almost every role sits near **$170K**.
- So the real question becomes: if base is this flat, where do the differences hide — and what makes a startup pay above the line?
- Tease the answer: it's not the framework wars, and — surprisingly — it's *not* "using AI." The engineers who get paid more are the ones building the hard infrastructure and ML systems underneath the AI, not the ones calling an LLM API.
- **Caveats folded in (one italic line):** *snapshot not a trend (all cross-sectional); YC skews early-stage and AI-forward (a leading indicator); equity is a percentage with no valuation — I only talk spread and direction.*

---

## 1. The $170K wall: salary is almost fixed · `SOLID`

**Purpose:** Establish the flat baseline that makes every later premium meaningful.

**Data:** Backend $175K (n=303), ML $175K (174), Full-stack $170K (1,177), Frontend $155K (83), DevOps $155K (45); Engineering Manager outlier $239K (27). IC spread ~$20K. Remote ~$25K lower — hedged aside.

**Hero:** salary-by-role bars, tight $155–175K band, EM breaking out.

---

## 2. The 40× equity spread inside one salary band · `SOLID` · ⭐ PEAK #1

**Purpose:** Show the differentiation moved off salary onto equity.

**Data:** Jobs paying $150–185K (n=407): equity 0.1% (p2) → 2.3% (p98), median 0.6% — a ~**40× spread** at the same cash. Inline: percentage only, no valuation.

**Hero (PULL-QUOTE):** *"Same $150–185K salary, and the equity runs 0.1% to 2.3% — a 40× spread on the same cash."*

---

## 3. The two levers: "founding," and your years of experience · `SOLID`

**Purpose:** Make the equity spread decodable.

**Data:** "Founding" = 2× equity at identical cash ($170K/1.0% vs $170K/0.5%). Seniority *inverts* equity: new-grad $155K/0.8% → 6+ yrs $190K/0.3% (six years = +$35K cash, ~half the equity).

**Hero (PULL-QUOTE):** *"Six years of experience adds ~$35K in cash and roughly halves your equity. Juniors get the lottery ticket; seniors get the paycheck."*

---

## 4. The transparency cliff · `SOLID`

**Purpose:** Explain why equity feels like a black box; bust "bigger = more transparent."

**Data:** Equity disclosed Early 62.3% vs Growth 15.3%; salary 93.2% → 72.3%. Bigger companies disclose *less*.

**Hero:** paired disclosure bars.

---

## 5. How they actually interview — it's not LeetCode · `FIRM`

**Purpose:** The hiring loop mirrors the pay story (real-world, seniority-inverted). Quiet CoderScreen resonance.

**Data (627 described loops):** paid/work trial 26.8% (most common) > take-home 20.9% > system design 11.3% > live 8.5% > LeetCode 5.1% > whiteboard 4.1%; founder in loop 49.9%; paid-trial 39.5% (new-grad) → 9.8% (senior). LeetCode mostly appears as a negation.

**Firming:** interview-format classifier + manual LeetCode-quote check (blocking for the "disavowed" line).

**Hero:** ranked format bars.

---

## 6. Who they'll even consider · `SOLID`

**Purpose:** The hiring-bar beat.

**Data:** New-grad-OK by size 29.9% (1–10) → 17.4% (11–50) → 14.9% (51–200); smaller ~2× more junior-friendly. Sponsorship ~18% "will sponsor" as a supporting beat.

**Hero:** new-grad-OK bars by company size.

---

## 7. What they screen for — the skill stack · `SOLID` (extracted)

**Purpose:** Set the stage for the pay payoff — establish *what* skills are in demand before showing which ones pay.

**Data (2,321 extracted eng JDs; % of jobs, share that lists it as *required*):** Python 48.6% (87% required), TypeScript 40.5% (82%), React 35.7% (81%), AWS 28.7% (74%), PostgreSQL 25.5% (79%), Node.js 18.1%, Kubernetes 16.0%, Next.js 14.3%, GCP 14.0%, Docker 13.8%, Go 11.8%, Terraform 8.1%, PyTorch 6.8%, Rust 6.1%. Note: **the modal skill is required, not preferred** (~80% required across the top of the list) — these are hard gates, not nice-to-haves. AI-tool naming: Cursor 92 ≈ Claude Code 88 companies.

**Hero:** top-skills bar (required vs preferred split).

---

## 8. ★ The skills that actually pay — depth, not "AI" · `SOLID` (extracted, seniority-controlled) · ⭐ CENTERPIECE / TITLE SECTION

**Purpose:** The payoff: *which skills move the number.* The counterintuitive finding — using AI pays nothing; building the systems under it pays. Overall median $170K ($175K within 3+ yrs).

**Pays a premium (and survives the 3+ yrs seniority control):**
- Temporal $185K **+9%** (+12% senior) · Terraform $185K **+9%** (+6%) · Datadog $185K +9% · CUDA $185K +9% · PyTorch $180K +6% (+3%) · Ruby on Rails $180K +6%.
- The pattern: **infrastructure + ML-systems + reliability** — orchestration, IaC, GPUs, observability. Depth, not trendiness.

**"Using AI" carries no real premium:**
- OpenAI API $165K **−3%** · Anthropic API $165K **−3%** · Cursor $175K +3% · Claude Code $175K +3% · TensorFlow $165K −3%.
- Calling an LLM API sits at or below the $170K line.

**Commodity / front-end / glue pays a discount:**
- CSS $140K −18% · Git $139K −18% · React Native $150K −12% · JavaScript $150K −12% · FastAPI $150K −12% · Java $161K −5%.

**The AI-skill cohort, honestly:** jobs requiring ≥1 AI/ML skill pay **$175K vs $165K (+6.1%)** and slightly more equity (0.69% vs 0.55%) — **but within the 3+ yrs band the gap shrinks to +2.9%.** Most of the "AI premium" is that AI roles skew senior, not the skill itself.

**Honest caveats (state inline):** premiums are still partly confounded by role/stage/company/location — the 3+ yrs band controls for seniority but not the rest; a regression (log-salary ~ skill + experience + stage + role + remote) firms the survivors. Equity isn't dollarized. Company-level effects (better-funded infra-heavy startups) may drive some of it.

**Firming:** run the regression to confirm which premiums survive full controls; that becomes the publishable §8 table + a methodology appendix.

**Hero (PULL-QUOTE #1):** *"Knowing how to call an LLM API pays nothing extra at a YC startup. Building the infrastructure and ML systems underneath it pays up to 12% more. React and 'we use Cursor' sit at the baseline."*

---

## 9. Takeaways + soft CTA · `SOLID`

**Checklist:** base ~$170K is fixed — negotiate equity + title; "founding" ≈ 2× equity; seniority trades equity for cash; no equity printed = a stage signal; the skills that actually move pay are **infrastructure + ML-systems depth** (Terraform, Temporal, CUDA, PyTorch, distributed/observability) — not another web framework, and not "we use Cursor"; expect a paid trial + founder, not LeetCode.

**Soft CoderScreen footer (one italic line):** *"This came out of building CoderScreen, where we bet real-world assessment beats puzzles — which, per the data, most of these startups already do."*

---

### Data-status roll-up
- **Publish-ready now:** Intro, §1, §2, §3, §4, §6, §7, §9.
- **Needs firming:** §5 (interview classifier + LeetCode check); §8 (skill-pay premiums are seniority-controlled but want a full regression to confirm survivors + rule out role/stage/company confounds — the title claim, so worth the rigor).

### Shareable pull-quotes
1. §8 — "Knowing how to call an LLM API pays nothing extra at a YC startup. Building the infrastructure underneath it pays up to 12% more." (lead)
2. §2 — "Same salary, 40× different equity."
3. §3 — "Juniors get the lottery ticket; seniors get the paycheck."

### Est. length
~2,600–3,200 words · ~8 charts/tables.
