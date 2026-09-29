// Inspect the extraction INPUT (the JD) against the OUTPUT (extracted skills)
// for a single job — or audit the whole extracted set for anomalies.
//
//   bun run src/debug-job.ts --id=76919          # a specific job
//   bun run src/debug-job.ts --company=Attack     # first extracted job matching
//   bun run src/debug-job.ts --most-skills         # the job with the most skills (over-extraction check)
//   bun run src/debug-job.ts                       # a random extracted job
//   bun run src/debug-job.ts --audit               # distribution + anomalies across all extracted
import { Database } from "bun:sqlite";
import { DB_PATH } from "./config.ts";

const argv = process.argv.slice(2);
const get = (n: string) => argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const has = (n: string) => argv.includes(`--${n}`);
const db = new Database(get("db") ?? DB_PATH, { readonly: true });

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const catIcon: Record<string, string> = { language: "🔤", framework: "🧩", library: "📦", tool: "🔧", platform: "☁️", database: "🗄️", cloud: "☁️", soft_skill: "🧠", other: "•" };

type Skill = { canonical_skill: string; raw_span: string; category: string; requirement_level: string; evidence_quote: string; evidence_ok: number };

function showJob(id: number) {
  const j = db.query<{ id: number; title: string; company_name: string; role: string; salary_range: string | null; equity_range: string | null; min_experience: string | null; description: string; interview_process: string | null }, [number]>(
    `SELECT id, title, company_name, role, salary_range, equity_range, min_experience, description, interview_process FROM jobs WHERE id = ?`,
  ).get(id);
  if (!j) return console.log(`job ${id} not found`);
  const skills = db.query<Skill, [number]>(`SELECT canonical_skill, raw_span, category, requirement_level, evidence_quote, evidence_ok FROM job_skills WHERE job_id = ?`).all(id);

  console.log("═".repeat(90));
  console.log(`JOB ${j.id}  ·  ${j.title} — ${j.company_name}`);
  console.log(`role=${j.role} · exp=${j.min_experience ?? "?"} · ${j.salary_range ?? "?"} · equity ${j.equity_range ?? "?"}`);
  console.log("═".repeat(90));
  console.log("\n── INPUT: job description (" + j.description.length + " chars) ──\n");
  console.log(j.description.trim());
  if (j.interview_process) console.log("\n── interview_process ──\n" + j.interview_process.trim());

  console.log(`\n── OUTPUT: ${skills.length} extracted skills ──\n`);
  const order = { required: 0, preferred: 1, unknown: 2 } as Record<string, number>;
  const jd = norm(j.description);
  for (const s of skills.sort((a, b) => (order[a.requirement_level] ?? 3) - (order[b.requirement_level] ?? 3))) {
    const flag = s.requirement_level === "required" ? "REQ " : s.requirement_level === "preferred" ? "pref" : "?   ";
    const ok = jd.includes(norm(s.evidence_quote)) ? "  " : "⚠️"; // re-check evidence live
    console.log(`  ${ok} [${flag}] ${catIcon[s.category] ?? "•"} ${s.canonical_skill.padEnd(22)} (${s.category})  ← "${s.evidence_quote.replace(/\n/g, " ").slice(0, 90)}"`);
  }
  const fails = skills.filter((s) => !jd.includes(norm(s.evidence_quote)));
  console.log(`\n  ${skills.length} skills · ${fails.length} evidence-not-found (⚠️ = quote not a verbatim substring of the JD)`);
}

function audit() {
  const perJob = db.query<{ job_id: number; n: number }, []>(`SELECT job_id, COUNT(*) n FROM job_skills GROUP BY job_id`).all();
  const counts = perJob.map((r) => r.n).sort((a, b) => a - b);
  const jobs = counts.length, total = counts.reduce((a, b) => a + b, 0);
  const med = counts[counts.length >> 1] ?? 0;
  console.log(`extracted jobs: ${jobs} · total skills: ${total} · per-job min ${counts[0]} / median ${med} / max ${counts[counts.length - 1]} / avg ${(total / jobs).toFixed(1)}\n`);

  console.log("top 10 by skill count (over-extraction check):");
  for (const r of db.query<{ id: number; title: string; company_name: string; n: number }, []>(
    `SELECT j.id, j.title, j.company_name, COUNT(*) n FROM job_skills s JOIN jobs j ON j.id=s.job_id GROUP BY s.job_id ORDER BY n DESC LIMIT 10`).all())
    console.log(`  ${String(r.n).padStart(3)}  [job ${r.id}] ${r.company_name} — ${r.title}`);

  // live evidence re-check across all extracted
  let fails = 0, checked = 0;
  const rows = db.query<{ job_id: number; canonical_skill: string; evidence_quote: string; desc: string }, []>(
    `SELECT s.job_id, s.canonical_skill, s.evidence_quote, j.description desc FROM job_skills s JOIN jobs j ON j.id=s.job_id`).all();
  const sampleFails: string[] = [];
  for (const r of rows) { checked++; if (!norm(r.desc).includes(norm(r.evidence_quote))) { fails++; if (sampleFails.length < 12) sampleFails.push(`  [job ${r.job_id}] ${r.canonical_skill} ← "${r.evidence_quote.slice(0, 70)}"`); } }
  console.log(`\nevidence guard: ${fails}/${checked} skills failed the verbatim check (${(100 * fails / checked).toFixed(1)}%)`);
  if (sampleFails.length) { console.log("sample fails (potential hallucinations / paraphrases):"); console.log(sampleFails.join("\n")); }

  console.log("\ncategory distribution:");
  for (const r of db.query<{ category: string; n: number }, []>(`SELECT category, COUNT(*) n FROM job_skills GROUP BY category ORDER BY n DESC`).all())
    console.log(`  ${String(r.n).padStart(5)}  ${r.category}`);
  console.log("\nrequirement-level split:");
  for (const r of db.query<{ requirement_level: string; n: number }, []>(`SELECT requirement_level, COUNT(*) n FROM job_skills GROUP BY requirement_level ORDER BY n DESC`).all())
    console.log(`  ${String(r.n).padStart(5)}  ${r.requirement_level}`);
}

if (has("audit")) {
  audit();
} else {
  let id = get("id") ? Number(get("id")) : undefined;
  if (!id && get("most-skills") !== undefined) id = db.query<{ job_id: number }, []>(`SELECT job_id FROM job_skills GROUP BY job_id ORDER BY COUNT(*) DESC LIMIT 1`).get()?.job_id;
  if (!id && get("company")) id = db.query<{ id: number }, [string]>(`SELECT j.id FROM jobs j WHERE j.company_name LIKE ? AND EXISTS (SELECT 1 FROM job_skills s WHERE s.job_id=j.id) LIMIT 1`).get(`%${get("company")}%`)?.id;
  if (!id) id = db.query<{ job_id: number }, []>(`SELECT job_id FROM job_skills ORDER BY job_id LIMIT 1`).get()?.job_id;
  if (id) showJob(id);
  else console.log("no extracted jobs found — run extraction first, or pass --id");
}
db.close();
