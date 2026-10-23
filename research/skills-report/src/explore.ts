// Quick, FREE exploration of the YC eng postings — naive keyword matching over
// JD text just to see what's in the data. This is NOT the report's method:
// naive matching miscounts ambiguous tokens (Go, C, R) and misses synonyms.
// The real pipeline is LLM extraction + O*NET/ESCO normalization (plan §6).
// `bun run src/explore.ts [--db=PATH]`
import { Database } from "bun:sqlite";
import { DB_PATH } from "./config.ts";

const dbPath = process.argv.find((a) => a.startsWith("--db="))?.split("=")[1] ?? DB_PATH;
const db = new Database(dbPath, { readonly: true });

// [canonical, matcher]. Ambiguous tokens use case-sensitive / contextual patterns.
const SKILLS: [string, RegExp][] = [
  ["Python", /\bpython\b/i], ["TypeScript", /\btypescript\b/i], ["JavaScript", /\bjavascript\b/i],
  ["React", /\breact(\.js|js)?\b/i], ["Node.js", /\bnode(\.js|js)?\b/i], ["Go", /\bgolang\b|\bGo\b/],
  ["Rust", /\brust\b/i], ["Java", /\bjava\b/i], ["Ruby", /\bruby\b/i], ["Rails", /\b(ruby on )?rails\b/i],
  ["C++", /\bc\+\+/i], ["Kotlin", /\bkotlin\b/i], ["Swift", /\bswift\b/i], ["PHP", /\bphp\b/i],
  ["Scala", /\bscala\b/i], ["Elixir", /\belixir\b/i],
  ["PostgreSQL", /\b(postgres(ql)?)\b/i], ["MySQL", /\bmysql\b/i], ["MongoDB", /\bmongo(db)?\b/i],
  ["Redis", /\bredis\b/i], ["Kafka", /\bkafka\b/i],
  ["AWS", /\baws\b|amazon web services/i], ["GCP", /\b(gcp|google cloud)\b/i], ["Azure", /\bazure\b/i],
  ["Kubernetes", /\b(kubernetes|k8s)\b/i], ["Docker", /\bdocker\b/i], ["Terraform", /\bterraform\b/i],
  ["GraphQL", /\bgraphql\b/i], ["Next.js", /\bnext\.?js\b/i], ["Django", /\bdjango\b/i],
  ["FastAPI", /\bfastapi\b/i], ["Flask", /\bflask\b/i], ["Vue", /\bvue(\.js)?\b/i],
  ["Tailwind", /\btailwind\b/i], ["PyTorch", /\bpytorch\b/i], ["TensorFlow", /\btensorflow\b/i],
  ["LLMs / GenAI", /\b(llms?|large language models?|generative ai|genai|gpt-?4|openai|anthropic)\b/i],
  ["LangChain", /\blangchain\b/i], ["Vector DB", /\b(vector (database|db|search)|pinecone|weaviate|pgvector)\b/i],
  ["RAG", /\b(retrieval[- ]augmented|rag)\b/i], ["Machine Learning", /\b(machine learning|deep learning|\bml\b)\b/i],
];

type Job = { description: string; team_size: number | null; location: string | null; salary_range: string | null; industry: string | null };
const jobs = db
  .query<Job, []>(
    `SELECT j.description, c.team_size, j.location, j.salary_range, c.industry
     FROM jobs j JOIN companies c ON c.slug=j.company_slug
     WHERE j.role='eng' AND j.description IS NOT NULL AND j.description!=''`,
  )
  .all();

const N = jobs.length;
const bucketOf = (t: number | null) => (t == null ? "unknown" : t <= 50 ? "early" : t <= 500 ? "growth" : "500+");
const seg = { early: 0, growth: 0, "500+": 0, unknown: 0 } as Record<string, number>;
for (const j of jobs) seg[bucketOf(j.team_size)]!++;

// counts: overall + per segment bucket
const counts = new Map<string, { all: number; early: number; growth: number }>();
for (const [name] of SKILLS) counts.set(name, { all: 0, early: 0, growth: 0 });
let remote = 0, withSalary = 0;
for (const j of jobs) {
  const text = j.description;
  if (/\bremote\b/i.test(j.location ?? "")) remote++;
  if (j.salary_range) withSalary++;
  const b = bucketOf(j.team_size);
  for (const [name, re] of SKILLS) {
    if (re.test(text)) {
      const c = counts.get(name)!;
      c.all++;
      if (b === "early") c.early++;
      else if (b === "growth") c.growth++;
    }
  }
}

const pct = (n: number, d: number) => (d ? ((100 * n) / d).toFixed(1) + "%" : "—");
console.log(`YC engineering postings with JD text: ${N}`);
console.log(`segments: early(≤50) ${seg.early} · growth(51-500) ${seg.growth} · 500+ ${seg["500+"]} · unknown ${seg.unknown}`);
console.log(`remote-friendly: ${pct(remote, N)} · salary disclosed: ${pct(withSalary, N)}\n`);

const ranked = [...counts.entries()].sort((a, b) => b[1].all - a[1].all);
console.log("top skills (naive keyword match — illustrative only):");
console.log("  skill".padEnd(22), "overall".padStart(9), "early".padStart(9), "growth".padStart(9), "  lift");
for (const [name, c] of ranked.slice(0, 25)) {
  const earlyPct = seg.early ? (100 * c.early) / seg.early : 0;
  const growthPct = seg.growth ? (100 * c.growth) / seg.growth : 0;
  const lift = growthPct ? (earlyPct / growthPct).toFixed(2) : "—";
  console.log(
    "  " + name.padEnd(20),
    pct(c.all, N).padStart(9),
    (earlyPct.toFixed(1) + "%").padStart(9),
    (growthPct.toFixed(1) + "%").padStart(9),
    ("  " + lift).padStart(6),
  );
}

console.log("\ntop industries (eng postings):");
const inds = db
  .query<{ industry: string; n: number }, []>(
    `SELECT COALESCE(c.industry,'(none)') industry, COUNT(*) n FROM jobs j JOIN companies c ON c.slug=j.company_slug
     WHERE j.role='eng' GROUP BY industry ORDER BY n DESC LIMIT 8`,
  )
  .all();
for (const i of inds) console.log(`  ${String(i.n).padStart(5)}  ${i.industry}`);

db.close();
