// Quick look at what's in the store. `bun run src/stats.ts [--db=PATH]`
import { Database } from "bun:sqlite";
import { DB_PATH } from "./config.ts";

const dbPath = process.argv.find((a) => a.startsWith("--db="))?.split("=")[1] ?? DB_PATH;
const db = new Database(dbPath, { readonly: true });

const rows = <T>(sql: string) => db.query(sql).all() as T[];
const one = (sql: string) => (db.query(sql).get() as { n: number }).n;

console.log(`db: ${dbPath}\n`);
console.log(`companies:      ${one("SELECT COUNT(*) n FROM companies")}`);
console.log(`  hiring:       ${one("SELECT COUNT(*) n FROM companies WHERE is_hiring=1")}`);
console.log(`jobs:           ${one("SELECT COUNT(*) n FROM jobs")}`);
console.log(`  eng roles:    ${one("SELECT COUNT(*) n FROM jobs WHERE role='eng'")}`);
console.log(`  with JD text: ${one("SELECT COUNT(*) n FROM jobs WHERE description IS NOT NULL AND description != ''")}`);

console.log("\njobs by role:");
for (const r of rows<{ role: string; n: number }>("SELECT COALESCE(role,'(none)') role, COUNT(*) n FROM jobs GROUP BY role ORDER BY n DESC")) {
  console.log(`  ${String(r.n).padStart(6)}  ${r.role}`);
}

console.log("\neng jobs by company team_size bucket (proxy segment signal):");
const buckets = rows<{ bucket: string; n: number }>(`
  SELECT CASE
    WHEN c.team_size IS NULL THEN '(unknown)'
    WHEN c.team_size <= 10 THEN 'B 1-10'
    WHEN c.team_size <= 50 THEN 'C 11-50'
    WHEN c.team_size <= 200 THEN 'D 51-200'
    WHEN c.team_size <= 500 THEN 'E 201-500'
    ELSE 'F+ 500+' END bucket,
  COUNT(*) n
  FROM jobs j JOIN companies c ON c.slug = j.company_slug
  WHERE j.role='eng'
  GROUP BY bucket ORDER BY bucket`);
for (const b of buckets) console.log(`  ${String(b.n).padStart(6)}  ${b.bucket}`);

db.close();
