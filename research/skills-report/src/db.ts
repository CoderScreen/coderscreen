// SQLite landing store (Bun's built-in driver).
//
// Two layers:
//   - PARSED tables (`companies`, `jobs`, `job_skills`) = convenient projections
//     for analysis.
//   - RAW archive (`raw_docs` + `companies.raw` + `jobs.detail_raw`) = the COMPLETE
//     payload of every page/entity we fetched. For the Inertia pages the full
//     `props` JSON is the entire data the site itself renders from, so storing it
//     means any future analysis runs offline — no re-scrape.
//
// Only aggregates are ever published; the raw store is internal.
import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

function addColumnIfMissing(db: Database, table: string, col: string, decl: string): void {
  const cols = db.query<{ name: string }, []>(`PRAGMA table_info(${table})`).all();
  if (!cols.some((c) => c.name === col)) db.run(`ALTER TABLE ${table} ADD COLUMN ${col} ${decl}`);
}

export function openDb(path: string): Database {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path, { create: true });
  db.run("PRAGMA journal_mode = WAL;");
  db.run("PRAGMA foreign_keys = ON;");

  db.run(`
    CREATE TABLE IF NOT EXISTS companies (
      slug              TEXT PRIMARY KEY,
      yc_id             INTEGER,
      name              TEXT,
      website           TEXT,
      one_liner         TEXT,
      long_description  TEXT,
      team_size         INTEGER,
      industry          TEXT,
      subindustry       TEXT,
      industries        TEXT,   -- JSON array
      tags              TEXT,   -- JSON array
      batch             TEXT,
      stage             TEXT,
      status            TEXT,
      all_locations     TEXT,
      regions           TEXT,   -- JSON array
      is_hiring         INTEGER,
      source_api        TEXT,
      raw               TEXT,    -- FULL yc-oss company object (all fields)
      fetched_at        TEXT
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS jobs (
      id                 INTEGER PRIMARY KEY,
      company_slug       TEXT REFERENCES companies(slug),
      company_name       TEXT,
      company_batch      TEXT,
      title              TEXT,
      url                TEXT,
      apply_url          TEXT,
      location           TEXT,
      type               TEXT,
      role               TEXT,
      role_specific_type TEXT,
      pretty_role        TEXT,
      salary_range       TEXT,
      equity_range       TEXT,
      min_experience     TEXT,
      min_school_year    TEXT,
      visa               TEXT,
      skills             TEXT,
      is_incomplete      INTEGER,
      created_at_label   TEXT,
      last_active_label  TEXT,
      description        TEXT,
      interview_process  TEXT,
      listing_raw        TEXT,   -- FULL listing object (from company page)
      detail_raw         TEXT,   -- FULL job object (from job detail page)
      detail_fetched_at  TEXT,
      fetched_at         TEXT
    );
  `);
  db.run("CREATE INDEX IF NOT EXISTS jobs_company ON jobs(company_slug);");
  db.run("CREATE INDEX IF NOT EXISTS jobs_role ON jobs(role);");

  db.run(`
    CREATE TABLE IF NOT EXISTS job_skills (
      job_id            INTEGER REFERENCES jobs(id),
      raw_span          TEXT,
      canonical_skill   TEXT,
      category          TEXT,
      requirement_level TEXT,
      evidence_quote    TEXT,
      evidence_ok       INTEGER,
      model             TEXT,
      extracted_at      TEXT
    );
  `);
  db.run("CREATE INDEX IF NOT EXISTS job_skills_job ON job_skills(job_id);");
  db.run("CREATE INDEX IF NOT EXISTS job_skills_canon ON job_skills(canonical_skill);");

  // Complete raw archive: one row per fetched page. `props` is the entire Inertia
  // props JSON (the full data). `html_gz` is optional gzipped HTML for byte-level
  // insurance (only when --archive-html is passed).
  db.run(`
    CREATE TABLE IF NOT EXISTS raw_docs (
      url         TEXT PRIMARY KEY,
      kind        TEXT,          -- 'company_page' | 'job_page'
      fetched_at  TEXT,
      props       TEXT,          -- full props JSON
      html_gz     BLOB           -- optional gzipped raw HTML
    );
  `);
  db.run("CREATE INDEX IF NOT EXISTS raw_docs_kind ON raw_docs(kind);");

  // Migrate older DBs created before the raw columns existed.
  addColumnIfMissing(db, "companies", "raw", "TEXT");
  addColumnIfMissing(db, "jobs", "detail_raw", "TEXT");

  return db;
}

type Row = Record<string, string | number | null>;

/** Generic upsert keyed on a single column. Non-key columns are overwritten. */
export function upsert(db: Database, table: string, key: string, row: Row): void {
  const cols = Object.keys(row);
  const placeholders = cols.map(() => "?").join(", ");
  const updates = cols.filter((c) => c !== key).map((c) => `${c} = excluded.${c}`).join(", ");
  db.query(
    `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders}) ON CONFLICT(${key}) DO UPDATE SET ${updates}`,
  ).run(...cols.map((c) => row[c]));
}

/** Archive the complete payload of a fetched page. */
export function archiveDoc(
  db: Database,
  doc: { url: string; kind: string; props: unknown; htmlGz?: Uint8Array | null; fetched_at: string },
): void {
  db.query(
    `INSERT INTO raw_docs (url, kind, fetched_at, props, html_gz) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(url) DO UPDATE SET kind=excluded.kind, fetched_at=excluded.fetched_at, props=excluded.props,
       html_gz=COALESCE(excluded.html_gz, raw_docs.html_gz)`,
  ).run(doc.url, doc.kind, doc.fetched_at, JSON.stringify(doc.props), doc.htmlGz ?? null);
}

/** Update the detail columns of an existing job row (never resets listing data). */
export function updateJobDetail(
  db: Database,
  id: number,
  detail: { description: string | null; interview_process: string | null; skills: string | null; detail_raw: unknown; detail_fetched_at: string },
): void {
  db.query(
    `UPDATE jobs SET description = ?, interview_process = ?, skills = COALESCE(NULLIF(?, '[]'), skills),
       detail_raw = ?, detail_fetched_at = ? WHERE id = ?`,
  ).run(detail.description, detail.interview_process, detail.skills, JSON.stringify(detail.detail_raw), detail.detail_fetched_at, id);
}

/** Jobs that already have extracted skills (for resumability). */
export function extractedJobIds(db: Database): Set<number> {
  const rows = db.query<{ job_id: number }, []>("SELECT DISTINCT job_id FROM job_skills").all();
  return new Set(rows.map((r) => r.job_id));
}
