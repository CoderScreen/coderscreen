// LLM skill extraction over YC eng JDs — TEST-RUN oriented.
//
// Runs on a subset (--limit) using the synchronous API so you get results to
// review immediately. Writes a `job_skills` table AND a human-reviewable
// Markdown report at data/extraction-sample.md so you can eyeball accuracy and
// give feedback before we scale to the full set (which we'll move to the 50%-off
// Batch API).
//
// Usage:
//   OPENAI_API_KEY=sk-... bun run src/extract-skills.ts [flags]
//     --limit=N        number of jobs to extract (default 20)
//     --model=NAME     OpenAI model (default gpt-4.1)
//     --concurrency=N  parallel requests (default 4)
//     --refresh        re-extract jobs that already have skills
//     --dry            no API calls — naive stub extraction, to test the plumbing
//     --db=PATH        override SQLite path
import { Database } from "bun:sqlite";
import { DB_PATH } from "./config.ts";
import { extractedJobIds, openDb } from "./db.ts";
import { extractSkills, type ExtractedSkill } from "./openai.ts";

function parseFlags(argv: string[]) {
  const get = (n: string) => argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
  const has = (n: string) => argv.includes(`--${n}`);
  return {
    limit: get("limit") ? Number(get("limit")) : 20,
    model: get("model") ?? "gpt-4.1",
    concurrency: get("concurrency") ? Number(get("concurrency")) : 4,
    refresh: has("refresh"),
    dry: has("dry"),
    db: get("db") ?? DB_PATH,
  };
}

const now = () => new Date().toISOString();
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

// Approximate USD per 1M tokens (synchronous / non-batch). Rough — for a ballpark only.
const RATES: Record<string, { in: number; out: number }> = {
  "gpt-4.1": { in: 2, out: 8 },
  "gpt-4.1-mini": { in: 0.4, out: 1.6 },
  "gpt-4o": { in: 2.5, out: 10 },
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
};

type Job = { id: number; title: string; company_name: string; description: string; team_size: number | null; stage: string | null; batch: string | null };

/** Naive stub used only in --dry mode to exercise the pipeline without the API. */
function stubExtract(desc: string): ExtractedSkill[] {
  const probes: [string, string, ExtractedSkill["category"]][] = [
    ["python", "Python", "language"], ["typescript", "TypeScript", "language"], ["react", "React", "framework"],
    ["postgres", "PostgreSQL", "database"], ["aws", "AWS", "cloud"], ["kubernetes", "Kubernetes", "platform"],
  ];
  const out: ExtractedSkill[] = [];
  for (const [needle, canon, cat] of probes) {
    const i = desc.toLowerCase().indexOf(needle);
    if (i >= 0) out.push({ raw_span: desc.slice(i, i + needle.length), canonical_skill: canon, category: cat, requirement_level: "unknown", evidence_quote: desc.slice(Math.max(0, i - 10), i + needle.length + 10) });
  }
  return out;
}

async function main() {
  const flags = parseFlags(process.argv.slice(2));
  const apiKey = process.env.OPENAI_API_KEY;
  if (!flags.dry && !apiKey) {
    console.error("Missing OPENAI_API_KEY. Set it, or pass --dry to test the plumbing without the API.");
    process.exit(1);
  }
  console.log(`skills-report · extract (${flags.dry ? "DRY" : flags.model}) · limit ${flags.limit}\n`);

  const db = openDb(flags.db);

  // Sample a varied subset: spread across team_size, deterministic pseudo-shuffle.
  const done = flags.refresh ? new Set<number>() : extractedJobIds(db);
  const all = db
    .query<Job, []>(
      `SELECT j.id, j.title, j.company_name, j.description, c.team_size, c.stage, c.batch
       FROM jobs j JOIN companies c ON c.slug=j.company_slug
       WHERE j.role='eng' AND j.description IS NOT NULL AND j.description!=''
       ORDER BY (j.id * 2654435761) % 2147483647`,
    )
    .all();
  const jobs = all.filter((j) => !done.has(j.id)).slice(0, flags.limit);
  if (jobs.length === 0) {
    console.log("Nothing to extract (already done? use --refresh).");
    return;
  }
  if (flags.refresh) {
    const del = db.query("DELETE FROM job_skills WHERE job_id = ?");
    for (const j of jobs) del.run(j.id);
  }

  const insert = db.query(
    `INSERT INTO job_skills (job_id, raw_span, canonical_skill, category, requirement_level, evidence_quote, evidence_ok, model, extracted_at)
     VALUES ($job_id,$raw_span,$canonical_skill,$category,$requirement_level,$evidence_quote,$evidence_ok,$model,$extracted_at)`,
  );

  let totIn = 0, totOut = 0, totSkills = 0, evidenceFails = 0, errors = 0;
  const results: { job: Job; skills: (ExtractedSkill & { evidence_ok: boolean })[] }[] = [];

  // simple concurrency pool
  let cursor = 0;
  const worker = async () => {
    while (cursor < jobs.length) {
      const job = jobs[cursor++]!;
      try {
        let skills: ExtractedSkill[];
        if (flags.dry) {
          skills = stubExtract(job.description);
        } else {
          const r = await extractSkills(job, { model: flags.model, apiKey: apiKey! });
          skills = r.skills;
          totIn += r.usage.prompt_tokens;
          totOut += r.usage.completion_tokens;
        }
        const jdNorm = norm(job.description);
        const withCheck = skills.map((s) => {
          const ok = jdNorm.includes(norm(s.evidence_quote));
          if (!ok) evidenceFails++;
          return { ...s, evidence_ok: ok };
        });
        const ts = now();
        const tx = db.transaction(() => {
          for (const s of withCheck) {
            insert.run({
              $job_id: job.id, $raw_span: s.raw_span, $canonical_skill: s.canonical_skill, $category: s.category,
              $requirement_level: s.requirement_level, $evidence_quote: s.evidence_quote,
              $evidence_ok: s.evidence_ok ? 1 : 0, $model: flags.dry ? "dry" : flags.model, $extracted_at: ts,
            });
          }
        });
        tx();
        totSkills += withCheck.length;
        results.push({ job, skills: withCheck });
        console.log(`  ✓ ${job.company_name} — ${job.title}  (${withCheck.length} skills)`);
      } catch (err) {
        errors++;
        console.warn(`  ✗ job ${job.id} (${job.company_name}): ${(err as Error).message}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, flags.concurrency) }, worker));

  // ---- human-reviewable report ----
  const catIcon: Record<string, string> = { language: "🔤", framework: "🧩", library: "📦", tool: "🔧", platform: "☁️", database: "🗄️", cloud: "☁️", soft_skill: "🧠", other: "•" };
  const sample = results.slice(0, 40); // cap the human-review artifact even on full runs
  let md = `# Skill extraction — sample review\n\nModel: \`${flags.dry ? "DRY (stub)" : flags.model}\` · ${results.length} jobs · ${totSkills} skills` + (results.length > sample.length ? ` (showing first ${sample.length})` : "") + `\n\n`;
  md += `Review each block: are the skills right, the required-vs-preferred correct, the canonical names sensible? A ✗ on evidence means the quote wasn't found verbatim in the JD (candidate hallucination).\n\n---\n\n`;
  for (const { job, skills } of sample) {
    md += `## ${job.title} — ${job.company_name}\n`;
    md += `_${job.batch} · team ${job.team_size ?? "?"} · ${job.stage ?? "?"}_ · [job ${job.id}]\n\n`;
    if (skills.length === 0) md += `_(no skills extracted)_\n\n`;
    const order = { required: 0, preferred: 1, unknown: 2 } as Record<string, number>;
    for (const s of [...skills].sort((a, b) => order[a.requirement_level]! - order[b.requirement_level]!)) {
      const flag = s.requirement_level === "required" ? "**[required]**" : s.requirement_level === "preferred" ? "[preferred]" : "[unknown]";
      md += `- ${catIcon[s.category] ?? "•"} ${flag} **${s.canonical_skill}** _(${s.category})_ ${s.evidence_ok ? "" : "⚠️ evidence-not-found"} — “${s.evidence_quote.replace(/\n/g, " ").slice(0, 120)}”\n`;
    }
    md += `\n`;
  }
  const reportPath = new URL("../data/extraction-sample.md", import.meta.url).pathname;
  await Bun.write(reportPath, md);

  // ---- console summary ----
  const rate = RATES[flags.model];
  const cost = rate ? (totIn / 1e6) * rate.in + (totOut / 1e6) * rate.out : null;
  console.log(`\n── summary ──`);
  console.log(`jobs extracted:   ${results.length}${errors ? ` (errors: ${errors})` : ""}`);
  console.log(`skills total:     ${totSkills}  (avg ${(totSkills / Math.max(1, results.length)).toFixed(1)}/job)`);
  console.log(`evidence guard:   ${evidenceFails} failed verbatim check${totSkills ? ` (${((100 * evidenceFails) / totSkills).toFixed(1)}%)` : ""}`);
  if (!flags.dry) {
    console.log(`tokens:           ${totIn} in / ${totOut} out`);
    if (cost != null) {
      const per10k = (cost / results.length) * 10_000;
      console.log(`cost (approx):    $${cost.toFixed(3)} for ${results.length} jobs  →  ~$${per10k.toFixed(2)} per 10k (sync; Batch API ≈ 50% less)`);
    }
  }
  console.log(`\nreview file:      ${reportPath}`);
  db.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
