// Scrape YC (Work at a Startup) job postings into the local SQLite store, and
// ARCHIVE the complete raw payload of every page so future analyses run offline.
//
// Three phases, all resumable — re-running only does outstanding work:
//   1. companies : upsert firmographics + full raw object from yc-oss
//   2. listings  : per hiring company, fetch page, archive props, upsert listings
//   3. details   : per job missing detail/archive, fetch page, archive, store JD
//
// Usage:
//   bun run src/scrape-yc.ts [flags]
//     --limit=N        cap number of companies processed (testing)
//     --concurrency=N  in-flight requests (default 4)
//     --all            include non-hiring companies (default: hiring only)
//     --eng-only       only fetch detail pages for engineering roles
//     --skip-details   phases 1-2 only
//     --refresh        re-fetch detail pages even if already stored
//     --archive-html   also store gzipped raw HTML (byte-level insurance)
//     --db=PATH        override SQLite path
import { Database } from "bun:sqlite";
import { DB_PATH, DEFAULTS, YC_BASE } from "./config.ts";
import { archiveDoc, openDb, updateJobDetail, upsert } from "./db.ts";
import { mapPool } from "./http.ts";
import { companyPageUrl, fetchCompanies, fetchPage, type YcJobListing } from "./yc.ts";

function parseFlags(argv: string[]) {
  const get = (name: string) => argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
  const has = (name: string) => argv.includes(`--${name}`);
  return {
    limit: get("limit") ? Number(get("limit")) : undefined,
    concurrency: get("concurrency") ? Number(get("concurrency")) : DEFAULTS.concurrency,
    all: has("all"),
    engOnly: has("eng-only"),
    skipDetails: has("skip-details"),
    refresh: has("refresh"),
    archiveHtml: has("archive-html"),
    db: get("db") ?? DB_PATH,
  };
}

const now = () => new Date().toISOString();
const gz = (html: string, on: boolean) => (on ? Bun.gzipSync(new TextEncoder().encode(html)) : null);

async function phaseCompanies(db: Database, flags: ReturnType<typeof parseFlags>) {
  console.log("· phase 1/3 — companies (yc-oss)");
  const all = await fetchCompanies();
  const ts = now();
  const tx = db.transaction((cos: typeof all) => {
    for (const c of cos) {
      upsert(db, "companies", "slug", {
        slug: c.slug,
        yc_id: c.id,
        name: c.name,
        website: c.website,
        one_liner: c.one_liner,
        long_description: c.long_description,
        team_size: c.team_size,
        industry: c.industry,
        subindustry: c.subindustry,
        industries: JSON.stringify(c.industries ?? []),
        tags: JSON.stringify(c.tags ?? []),
        batch: c.batch,
        stage: c.stage,
        status: c.status,
        all_locations: c.all_locations,
        regions: JSON.stringify(c.regions ?? []),
        is_hiring: c.isHiring ? 1 : 0,
        source_api: c.api,
        raw: JSON.stringify(c), // FULL yc-oss object
        fetched_at: ts,
      });
    }
  });
  tx(all);

  let targets = all.filter((c) => (flags.all ? true : c.isHiring));
  if (flags.limit) targets = targets.slice(0, flags.limit);
  console.log(`  ${all.length} companies upserted · ${targets.length} selected for job scraping`);
  return targets;
}

async function phaseListings(db: Database, slugs: string[], flags: ReturnType<typeof parseFlags>) {
  console.log("· phase 2/3 — job listings");
  let jobsSeen = 0;
  let companiesWithJobs = 0;
  const insertStub = db.query(
    `INSERT INTO jobs (id, company_slug, company_name, company_batch, title, url, apply_url,
       location, type, role, role_specific_type, pretty_role, salary_range, equity_range,
       min_experience, min_school_year, visa, skills, is_incomplete, created_at_label,
       last_active_label, listing_raw, fetched_at)
     VALUES ($id,$company_slug,$company_name,$company_batch,$title,$url,$apply_url,$location,
       $type,$role,$role_specific_type,$pretty_role,$salary_range,$equity_range,$min_experience,
       $min_school_year,$visa,$skills,$is_incomplete,$created_at_label,$last_active_label,
       $listing_raw,$fetched_at)
     ON CONFLICT(id) DO UPDATE SET
       title=excluded.title, url=excluded.url, apply_url=excluded.apply_url, location=excluded.location,
       type=excluded.type, role=excluded.role, role_specific_type=excluded.role_specific_type,
       pretty_role=excluded.pretty_role, salary_range=excluded.salary_range, equity_range=excluded.equity_range,
       min_experience=excluded.min_experience, min_school_year=excluded.min_school_year, visa=excluded.visa,
       is_incomplete=excluded.is_incomplete, created_at_label=excluded.created_at_label,
       last_active_label=excluded.last_active_label, listing_raw=excluded.listing_raw, fetched_at=excluded.fetched_at`,
  );

  await mapPool(
    slugs,
    flags.concurrency,
    async (slug) => {
      const page = await fetchPage(companyPageUrl(slug));
      archiveDoc(db, { url: page.url, kind: "company_page", props: page.props, htmlGz: gz(page.html, flags.archiveHtml), fetched_at: now() });
      const listings = (Array.isArray(page.props.jobPostings) ? page.props.jobPostings : []) as YcJobListing[];
      if (listings.length === 0) return;
      companiesWithJobs++;
      const ts = now();
      const tx = db.transaction((rows: YcJobListing[]) => {
        for (const l of rows) {
          insertStub.run({
            $id: l.id,
            $company_slug: slug,
            $company_name: l.companyName ?? null,
            $company_batch: l.companyBatchName ?? null,
            $title: l.title ?? null,
            $url: l.url?.startsWith("http") ? l.url : `${YC_BASE}${l.url}`,
            $apply_url: l.applyUrl ?? null,
            $location: l.location ?? null,
            $type: l.type ?? null,
            $role: l.role ?? null,
            $role_specific_type: l.roleSpecificType ?? null,
            $pretty_role: l.prettyRole ?? null,
            $salary_range: l.salaryRange ?? null,
            $equity_range: l.equityRange ?? null,
            $min_experience: l.minExperience ?? null,
            $min_school_year: l.minSchoolYear ?? null,
            $visa: l.visa ?? null,
            $skills: JSON.stringify(l.skills ?? []),
            $is_incomplete: l.isIncomplete ? 1 : 0,
            $created_at_label: l.createdAt ?? null,
            $last_active_label: l.lastActive ?? null,
            $listing_raw: JSON.stringify(l),
            $fetched_at: ts,
          });
        }
      });
      tx(listings);
      jobsSeen += listings.length;
    },
    (slug, _i, err) => console.warn(`  ! listings failed for ${slug}: ${(err as Error).message}`),
  );
  console.log(`  ${jobsSeen} job listings across ${companiesWithJobs} companies`);
}

async function phaseDetails(db: Database, flags: ReturnType<typeof parseFlags>) {
  console.log("· phase 3/3 — job details (full JD text + raw archive)");
  // Needs work if never detailed OR not yet archived (backfills archive for
  // jobs scraped before raw archival existed).
  const where = flags.refresh
    ? "1=1"
    : "(detail_fetched_at IS NULL OR url NOT IN (SELECT url FROM raw_docs WHERE kind='job_page'))";
  const engClause = flags.engOnly ? "AND role = 'eng'" : "";
  const jobs = db.query<{ id: number; url: string }, []>(`SELECT id, url FROM jobs WHERE ${where} ${engClause}`).all();
  console.log(`  ${jobs.length} jobs need detail/archive`);
  let done = 0;
  await mapPool(
    jobs,
    flags.concurrency,
    async (job) => {
      const page = await fetchPage(job.url);
      archiveDoc(db, { url: page.url, kind: "job_page", props: page.props, htmlGz: gz(page.html, flags.archiveHtml), fetched_at: now() });
      const detail = (page.props.job ?? {}) as Record<string, unknown>;
      updateJobDetail(db, job.id, {
        description: (detail.description as string) ?? null,
        interview_process: (detail.interview_process as string) ?? null,
        skills: JSON.stringify(detail.skills ?? []),
        detail_raw: detail,
        detail_fetched_at: now(),
      });
      if (++done % 100 === 0) console.log(`    ${done}/${jobs.length}`);
    },
    (job, _i, err) => console.warn(`  ! detail failed for job ${job.id}: ${(err as Error).message}`),
  );
  console.log(`  ${done} job details fetched + archived`);
}

function summary(db: Database) {
  const q = (sql: string) => (db.query(sql).get() as { n: number }).n;
  console.log("\n── summary ──");
  console.log(`companies:        ${q("SELECT COUNT(*) n FROM companies")} (hiring: ${q("SELECT COUNT(*) n FROM companies WHERE is_hiring=1")})`);
  console.log(`jobs:             ${q("SELECT COUNT(*) n FROM jobs")} (eng: ${q("SELECT COUNT(*) n FROM jobs WHERE role='eng'")})`);
  console.log(`jobs w/ desc:     ${q("SELECT COUNT(*) n FROM jobs WHERE description IS NOT NULL AND description != ''")}`);
  console.log(`raw_docs:         ${q("SELECT COUNT(*) n FROM raw_docs")} (company_page: ${q("SELECT COUNT(*) n FROM raw_docs WHERE kind='company_page'")}, job_page: ${q("SELECT COUNT(*) n FROM raw_docs WHERE kind='job_page'")})`);
}

async function main() {
  const flags = parseFlags(process.argv.slice(2));
  console.log(`skills-report · YC scrape → ${flags.db}`);
  console.log(`flags: ${JSON.stringify(flags)}\n`);
  const db = openDb(flags.db);

  const started = Date.now();
  const targets = await phaseCompanies(db, flags);
  await phaseListings(db, targets.map((c) => c.slug), flags);
  if (!flags.skipDetails) await phaseDetails(db, flags);

  summary(db);
  console.log(`\ndone in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
