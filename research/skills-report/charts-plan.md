# Chart plan — "Knowing AI Doesn't Pay at YC Startups"

> **Now rendered as real SVGs**, not ASCII. `bun run src/charts.ts` generates branded SVGs from the DB (ECharts SSR — Bun-native, no browser/canvas) into `charts/*.svg` + `charts/index.html` to preview. The ASCII mockups below are kept only as a **layout/labeling reference** for each figure. Palette lives in the `C` object in `src/charts.ts` (swap for CoderScreen brand colors).

We still keep the style guide's *principles* even with rendered charts: in-chart title carrying units, the exact value labeled on every bar, an explicit delta/premium, no "Fig. N," honest markers (the AI-skill amber outline, the $170K baseline line), and the caption done by the sentence before/after.

**Adaptation notes for a data post (vs a systems post):**
- No code snippets / architecture diagrams / Challenge:Solution pairs. Instead the "naive baseline → earned complexity" beat becomes **naive keyword count → LLM extraction + seniority control** (a methodology-honesty section that builds trust — signature voice).
- Density target: ~8–9 visuals (guide says 4–10). Heroes are the intro salary-wall, the equity spread, and the §8 diverging premium bar.
- Glyphs: `█` solid magnitude · `▓` = "new"/highlighted vs `░` = baseline/discount · `│` = axis/baseline · `△` = "survives the seniority control." Legend inline whenever a glyph carries meaning.

## Section → visual map

| § | Visual | Type | Priority |
|---|---|---|---|
| Intro | salary-by-role wall (proof chart right after the hook) | block-bar | ⭐ hero |
| 1 | *(same chart as intro — the wall)* | block-bar | — |
| 2 | equity spread within one salary band (percentiles) | block-bar | ⭐ hero |
| 3 | the two levers — founding & seniority | 2 delta tables | core |
| 4 | pay-disclosure by stage | paired block-bar | core |
| 5 | interview formats named | ranked block-bar | core *(needs classifier)* |
| 6 | new-grad-OK by company size | block-bar | core |
| 7 | most-demanded skills (required vs preferred) | ranked block-bar | core |
| 8 | **skill pay premium vs $170K** | **diverging block-bar** | ⭐⭐ flagship |
| 8 | the skills-that-pay table (premium + senior-controlled + equity) | delta table | ⭐ hero |
| 8 | does requiring AI pay? (cohort + seniority shrink) | block-bar | core |
| 9 | "reading a YC job post" checklist | boxed list | closer |

---

## The mockups (real numbers)

### Intro / §1 — the $170K wall
_Intro sentence before:_ "…sorted by salary and expected a mess. Instead I got a wall."
```
median base salary — YC engineering roles (USD-disclosed, n=2,016)   [1 █ ≈ $10K]

  Backend           ██████████████████  $175K
  Machine learning  ██████████████████  $175K
  Full-stack        █████████████████   $170K   ← modal role, n=1,177
  Frontend          ███████████████▌    $155K
  DevOps            ███████████████▌    $155K
  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·  ·
  Engineering mgr   ████████████████████████ $239K   ← the only bar that breaks the wall
```
_Sentence after:_ "Ignore the managers and every IC role sits inside a $20K band. The kind of engineer you are barely moves the cash."

### §2 — the 40× equity spread
_Before:_ "I took only the jobs paying $150–185K, held salary constant, and looked at nothing but equity."
```
equity grant inside one salary band ($150–185K base, n=407)   [1 █ ≈ 0.1%]

  p2   0.1%  █
  p25  0.3%  ███
  p50  0.6%  ██████
  p75  1.0%  ██████████
  p98  2.3%  ███████████████████████
             └───────── same salary, 40× the equity ─────────┘
```
_After:_ "Same paycheck, forty-fold the ownership. The differentiation moved off salary entirely."

### §3 — the two levers (delta tables)
```
Lever 1 — the word "founding"        Lever 2 — years of experience
┌────────────┬───────┬────────┐      ┌────────────┬───────┬────────┐
│ title      │ base  │ equity │      │ experience │ base  │ equity │
├────────────┼───────┼────────┤      ├────────────┼───────┼────────┤
│ "founding" │ $170K │  1.0%  │      │ new-grad   │ $155K │  0.8%  │
│ everyone   │ $170K │  0.5%  │      │ 6+ years   │ $190K │  0.3%  │
├────────────┼───────┼────────┤      ├────────────┼───────┼────────┤
│ Δ          │  =    │  2×    │      │ Δ          │ +$35K │ ÷2     │
└────────────┴───────┴────────┘      └────────────┴───────┴────────┘
```
_Reads:_ "Same cash, double the equity" and "six years buys $35K and costs half your ownership."

### §4 — transparency cliff
```
pay disclosure by company stage (share of eng postings that print the number)

  equity   early  ████████████████████████████████ 62%
           growth ████████ 15%                        Δ −47pp (≈4× cliff)
  salary   early  ███████████████████████████████████████████████ 93%
           growth ████████████████████████████████████ 72%          Δ −21pp
```

### §5 — interview formats  *(needs the classifier before publish)*
```
interview formats named — YC eng loops that describe their process (n=627)

  paid / work trial   █████████████████████████ 26.8%
  take-home           ████████████████████ 20.9%
  system design       ███████████ 11.3%
  live coding         ████████ 8.5%
  LeetCode            █████ 5.1%
  whiteboard          ████ 4.1%
  ── and a founder/CEO/CTO is in the loop 49.9% of the time ──
```

### §6 — new grads by company size
```
share of eng roles open to new grads, by company headcount

  1–10     ██████████████████████████████ 29.9%
  11–50    █████████████████ 17.4%
  51–200   ███████████████ 14.9%       (smaller ≈ 2× more junior-friendly)
```

### §7 — most-demanded skills
```
most-demanded skills — share of YC eng postings (n=2,321; % that list it as required)

  Python       ████████████████████████ 48.6%   (87% required)
  TypeScript   ████████████████████ 40.5%       (82%)
  React        ██████████████████ 35.7%         (81%)
  AWS          ██████████████ 28.7%             (74%)
  PostgreSQL   █████████████ 25.5%              (79%)
  Kubernetes   ████████ 16.0%                   (71%)
  Go           ██████ 11.8%                     (80%)
```
_Note the required% column — these are hard gates, not nice-to-haves._

### §8 — FLAGSHIP: skill pay premium vs the $170K median
_Before:_ "So I ranked every skill by the median salary of the jobs that ask for it."
```
skill pay vs the $170K median   (▓ above · ░ below · △ premium survives the 3+ yrs control)

  Temporal      +9% △ │▓▓▓▓▓▓▓▓▓
  Terraform     +9% △ │▓▓▓▓▓▓▓▓▓
  CUDA          +9%   │▓▓▓▓▓▓▓▓▓
  Datadog       +9%   │▓▓▓▓▓▓▓▓▓
  PyTorch       +6% △ │▓▓▓▓▓▓
  Cursor        +3%   │▓▓▓
  Claude Code   +3%   │▓▓▓
  React          0%   │
  OpenAI API    −3%   ░░░│
  Anthropic     −3%   ░░░│
  Java          −5% ░░░░░│
  JavaScript   −12% ░░░░░░░░░░░░│
  React Native −12% ░░░░░░░░░░░░│
  Git          −18% ░░░░░░░░░░░░░░░░░░│
  CSS          −18% ░░░░░░░░░░░░░░░░░░│
                    ↑ $170K
```
_After:_ "Every skill that pays a premium is infrastructure or ML-systems. 'We use Cursor' is a rounding error, and calling an LLM API pays *below* the line. The commodity front-end stack pays a discount."

_Mobile twin (stacked, for < 40-char screens):_
```
pays MORE (infra / ML systems)
  Temporal +9% △ · Terraform +9% △
  CUDA +9% · Datadog +9% · PyTorch +6% △
"using AI" — no premium
  Cursor +3% · Claude Code +3%
  OpenAI −3% · Anthropic −3%
pays LESS (commodity / glue)
  Java −5% · JS/React-Native −12%
  Git −18% · CSS −18%
```

### §8 — the skills-that-pay table (delta columns)
```
┌──────────────┬─────────┬───────────┬────────────────┬────────┐
│ skill        │ median  │ vs $170K  │ within 3+ yrs  │ equity │
├──────────────┼─────────┼───────────┼────────────────┼────────┤
│ Temporal     │ $185K   │  +9%      │  +12% △        │ 0.55%  │
│ Terraform    │ $185K   │  +9%      │  +6%  △        │ 0.42%  │
│ CUDA         │ $185K   │  +9%      │   —            │ 1.25%  │
│ PyTorch      │ $180K   │  +6%      │  +3%  △        │ 0.80%  │
│ Cursor       │ $175K   │  +3%      │  +4%           │ 0.63%  │
│ OpenAI API   │ $165K   │  −3%      │   0%           │ 0.55%  │
│ Java         │ $161K   │  −5%      │  −6%           │ 0.30%  │
│ CSS          │ $140K   │ −18%      │ −23%           │ 0.35%  │
└──────────────┴─────────┴───────────┴────────────────┴────────┘
△ = premium holds after controlling for seniority
```

### §8 — does requiring AI actually pay?
```
median base by whether the role requires an AI/ML skill (extracted, not keyword)

  requires AI/ML   ██████████████████ $175K   n=397
  no AI/ML skill   ████████████████ $165K     n=1,345      Δ +6.1%
  ── but within the 3+ yrs band it's $180K vs $175K → +2.9%.
     Most of the "AI premium" is that AI roles skew senior, not the skill. ──
```

### §9 — closer checklist (boxed)
```
┌─ reading a YC eng job post ───────────────────────────────┐
│ • base ~$170K is fixed — negotiate equity + title         │
│ • "founding" ≈ 2× equity; seniority trades equity for cash│
│ • no equity printed = a stage signal — ask early          │
│ • the skills that move pay: infra & ML systems, not "AI"  │
│ • expect a paid trial + a founder, not LeetCode           │
└───────────────────────────────────────────────────────────┘
```

---

## Build note
These should be **generated from the DB** (a `charts.ts` that emits the ASCII), so they stay accurate, reproducible, and git-diffable — matching the guide's "visuals-as-text, diff in git" rationale. §5 waits on the interview classifier; §8's `△` survivors want the regression to confirm before the bars are final.
```
