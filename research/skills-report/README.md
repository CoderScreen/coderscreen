# skills-report

Data pipeline for the flagship post **"What skills do startups want vs. enterprises — from ~10,000 job postings."** Standalone Bun project, intentionally decoupled from the Nx/Workers app (it lives outside the pnpm `workspaces` globs).

Full strategy + methodology: `../../.context/flagship-data-gathering-plan.md`.

## Source: YC / Work at a Startup

Every YC company is a startup, so this feeds the **early/growth-startup** segments with high-confidence labels — and `team_size` from yc-oss gives a direct early-vs-growth split, no enrichment needed. All data is public and logged-off:

| Step | Endpoint | Yields |
|---|---|---|
| companies | `yc-oss.github.io/api/companies/all.json` | firmographics: `slug`, `team_size`, `industry`, `batch`, `stage`, `isHiring` |
| listings | `ycombinator.com/companies/{slug}` (Inertia `data-page`) | `jobPostings[]`: title, role, salary, location |
| details | `ycombinator.com/companies/{slug}/jobs/{id-slug}` | full JD `description` + `interview_process` |

## Run

```bash
cd research/skills-report
bun install

# smoke test — 3 companies, full pipeline
bun run src/scrape-yc.ts --limit=3

# full run: all hiring companies, engineering roles only for detail fetch
bun run src/scrape-yc.ts --eng-only

bun run stats
```

Flags: `--limit=N`, `--concurrency=N` (default 4), `--all` (include non-hiring), `--eng-only` (detail-fetch eng roles only), `--skip-details`, `--refresh`, `--db=PATH`.

All three phases are **resumable** — re-running only fetches outstanding work (jobs with no `detail_fetched_at`). Safe to Ctrl-C and restart.

## Output

SQLite at `data/skills-report.sqlite` (gitignored). Two layers:

**Parsed tables** (convenient projections for analysis):
- `companies` — one row per YC company + firmographics
- `jobs` — one row per posting; `description` holds the JD markdown
- `job_skills` — one row per (job, extracted skill) from the LLM pass

**Raw archive** (the complete payload — so new analyses never require a re-scrape):
- `raw_docs` — one row per fetched page. `props` is the **entire Inertia props JSON** the site renders from (all fields, including ones we don't parse into columns — e.g. `company.year_founded`, `founders`, `linkedin_url`, `cb_url`, `hiring_description`). Pass `--archive-html` to also store gzipped raw HTML.
- `companies.raw` — full yc-oss company object · `jobs.detail_raw` — full job object

To backfill the archive for data scraped before this existed, just re-run the scraper — phase 3 re-fetches any job whose page isn't archived yet. Add `--archive-html` for byte-level insurance.

Only **aggregate** statistics from this store are ever published (see the plan's legal guardrails). Recruiter/personal data is not collected here; strip any that appears before publishing.

## Etiquette / legal

Set a real contact in `src/config.ts` (`USER_AGENT`). The client self-throttles (bounded concurrency + backoff) and only reads public pages — no login, no ToS acceptance, no fake accounts. Stop on any request to do so.

## Next sources (per the plan)

YC covers startups. The report also needs **enterprise/big-tech** cells (the binding constraint): Greenhouse/Lever/Ashby boards + Workday tenants + Fortune-1000 JSON-LD + USAJOBS. Those are separate collectors that write into the same `jobs` table.
