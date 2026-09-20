// P1 (normalize) + P0.2 (rigorous skill x pay) over the LLM-extracted skills.
// Produces the §7 demand ranking and the §8 skills-that-pay numbers, with a
// seniority control. `bun run src/analyze-skills.ts`
import { Database } from "bun:sqlite";
import { DB_PATH } from "./config.ts";

const db = new Database(process.argv.find((a) => a.startsWith("--db="))?.split("=")[1] ?? DB_PATH, { readonly: true });

// ---- parsers ----
function usdK(s: string | null): number | null {
  if (!s || !s.trim().startsWith("$")) return null;
  const t = [...s.matchAll(/\$\s?([\d,.]+)\s?([KMkm])?/g)].map((m) => { let n = parseFloat(m[1]!.replace(/,/g, "")); const u = (m[2] ?? "").toUpperCase(); if (u === "M") n *= 1000; else if (u !== "K" && n >= 1000) n /= 1000; return n; });
  return t.length ? (t[0]! + t[t.length - 1]!) / 2 : null;
}
function eqPct(s: string | null): number | null {
  if (!s) return null; const n = [...s.matchAll(/([\d.]+)\s?%/g)].map((m) => parseFloat(m[1]!)); return n.length ? (n[0]! + n[n.length - 1]!) / 2 : null;
}
const median = (a: number[]) => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2; };

// ---- normalization: merge obvious aliases ----
const ALIAS: Record<string, string> = {
  "amazon web services": "AWS", "aws": "AWS", "aws lambda": "AWS", "amazon s3": "AWS",
  "google cloud platform": "GCP", "gcp": "GCP", "google cloud": "GCP",
  "microsoft azure": "Azure", "azure": "Azure",
  "postgres": "PostgreSQL", "postgresql": "PostgreSQL",
  "node": "Node.js", "node.js": "Node.js", "nodejs": "Node.js",
  "react.js": "React", "reactjs": "React", "react": "React",
  "golang": "Go", "go": "Go",
  "github copilot": "GitHub Copilot", "copilot": "GitHub Copilot",
  "openai api": "OpenAI", "openai": "OpenAI",
  "large language models": "LLMs", "large language model": "LLMs", "llm": "LLMs", "llms": "LLMs",
};
const norm = (s: string) => ALIAS[s.toLowerCase().trim()] ?? s;

// skills that count as AI/GenAI work (matched on the normalized canonical name)
const AI_RE = /\b(llm|large language|gpt|openai|anthropic|claude|gemini|rag\b|retrieval[- ]aug|fine[- ]?tun|prompt eng|vector (db|database|store)|pinecone|weaviate|pgvector|embedding|langchain|langgraph|llamaindex|hugging ?face|pytorch|tensorflow|\bjax\b|cuda|triton|mlops|llmops|evals?\b|machine learning|deep learning|computer vision|\bnlp\b|diffusion|transformer|cursor|claude code|copilot|windsurf|devin)/i;
const isAISkill = (s: string) => AI_RE.test(s);

// ---- load ----
type Row = { id: number; sal: number | null; eq: number | null; senior3: boolean };
const jobRows = db.query<{ id: number; salary_range: string | null; equity_range: string | null; min_experience: string | null }, []>(
  `SELECT j.id, j.salary_range, j.equity_range, j.min_experience FROM jobs j WHERE j.role='eng'`).all();
const jobs = new Map<number, Row>();
for (const j of jobRows) jobs.set(j.id, { id: j.id, sal: usdK(j.salary_range), eq: eqPct(j.equity_range), senior3: /3\+|5\+|6\+|8\+|11\+/.test(j.min_experience ?? "") });

// job -> set of normalized skills (technical categories) + required flags
const skillRows = db.query<{ job_id: number; canonical_skill: string; category: string; requirement_level: string }, []>(
  `SELECT job_id, canonical_skill, category, requirement_level FROM job_skills WHERE category IN ('language','framework','library','tool','platform','database','cloud')`).all();
const jobSkills = new Map<number, Map<string, string>>(); // job -> skill -> best req level
for (const r of skillRows) {
  const sk = norm(r.canonical_skill);
  if (!jobSkills.has(r.job_id)) jobSkills.set(r.job_id, new Map());
  const m = jobSkills.get(r.job_id)!;
  if (!m.has(sk) || r.requirement_level === "required") m.set(sk, r.requirement_level);
}

const extractedEng = [...jobSkills.keys()].filter((id) => jobs.has(id)).length;
const salJobs = [...jobs.values()].filter((j) => j.sal != null);
const baseAll = median(salJobs.map((j) => j.sal!));
const baseSr = median(salJobs.filter((j) => j.senior3).map((j) => j.sal!));
console.log(`eng jobs with extracted skills: ${extractedEng} · with USD salary: ${salJobs.length}`);
console.log(`baseline median salary $${Math.round(baseAll)}K (within 3+ yrs: $${Math.round(baseSr)}K)\n`);

// aggregate per skill
type Agg = { n: number; req: number; sal: number[]; salSr: number[]; eq: number[] };
const agg = new Map<string, Agg>();
for (const [jid, skills] of jobSkills) {
  const j = jobs.get(jid); if (!j) continue;
  for (const [sk, lvl] of skills) {
    if (!agg.has(sk)) agg.set(sk, { n: 0, req: 0, sal: [], salSr: [], eq: [] });
    const a = agg.get(sk)!;
    a.n++; if (lvl === "required") a.req++;
    if (j.sal != null) { a.sal.push(j.sal); if (j.senior3) a.salSr.push(j.sal); }
    if (j.eq != null) a.eq.push(j.eq);
  }
}

console.log("=== §7 DEMAND: top 25 skills by share of eng jobs (required vs preferred) ===");
console.log("  skill".padEnd(22), "jobs".padStart(6), "% eng".padStart(7), "req%".padStart(6));
for (const [sk, a] of [...agg.entries()].filter(([, a]) => a.n >= 20).sort((x, y) => y[1].n - x[1].n).slice(0, 25))
  console.log("  " + sk.padEnd(20), String(a.n).padStart(6), (100 * a.n / extractedEng).toFixed(1).padStart(6) + "%", (100 * a.req / a.n).toFixed(0).padStart(5) + "%");

console.log("\n=== §8 PAY: skills ranked by median salary (min 30 jobs w/ salary) ===");
console.log("  skill".padEnd(22), "n".padStart(5), "median".padStart(8), "vs base".padStart(8), "3+yr vs base".padStart(13), "med eq".padStart(8));
const rows = [...agg.entries()].filter(([, a]) => a.sal.length >= 30).map(([sk, a]) => ({ sk, n: a.sal.length, med: median(a.sal), medSr: a.salSr.length >= 20 ? median(a.salSr) : null, eq: median(a.eq), ai: isAISkill(sk) }));
for (const r of rows.sort((x, y) => y.med - x.med)) {
  const prem = (r.med >= baseAll ? "+" : "") + (100 * (r.med / baseAll - 1)).toFixed(0) + "%";
  const sr = r.medSr != null ? ((r.medSr >= baseSr ? "+" : "") + (100 * (r.medSr / baseSr - 1)).toFixed(0) + "%") : "—";
  console.log("  " + (r.ai ? "🤖 " : "   ") + r.sk.padEnd(17), String(r.n).padStart(5), `$${Math.round(r.med)}K`.padStart(8), prem.padStart(8), sr.padStart(13), `${r.eq.toFixed(2)}%`.padStart(8));
}

console.log("\n=== §8 AI COHORT: jobs requiring >=1 AI/ML skill vs none (extracted, not regex) ===");
const aiJobs: number[] = [], nonAiJobs: number[] = [], aiEq: number[] = [], nonAiEq: number[] = [];
let aiN = 0;
for (const [jid, skills] of jobSkills) {
  const j = jobs.get(jid); if (!j || j.sal == null) continue;
  const hasAI = [...skills.keys()].some(isAISkill);
  if (hasAI) { aiN++; aiJobs.push(j.sal); if (j.eq != null) aiEq.push(j.eq); } else { nonAiJobs.push(j.sal); if (j.eq != null) nonAiEq.push(j.eq); }
}
const ma = median(aiJobs), mn = median(nonAiJobs);
console.log(`  AI/ML-skill jobs (n=${aiJobs.length}): median $${Math.round(ma)}K, equity ${median(aiEq).toFixed(2)}%`);
console.log(`  no-AI jobs       (n=${nonAiJobs.length}): median $${Math.round(mn)}K, equity ${median(nonAiEq).toFixed(2)}%`);
console.log(`  → AI premium: ${(100 * (ma / mn - 1) >= 0 ? "+" : "")}${(100 * (ma / mn - 1)).toFixed(1)}% cash, ${(median(aiEq) - median(nonAiEq)).toFixed(2)}pp equity`);

// seniority-controlled AI premium (within 3+ yrs)
const aiSr: number[] = [], nonAiSr: number[] = [];
for (const [jid, skills] of jobSkills) { const j = jobs.get(jid); if (!j || j.sal == null || !j.senior3) continue; ([...skills.keys()].some(isAISkill) ? aiSr : nonAiSr).push(j.sal); }
console.log(`  within 3+ yrs: AI $${Math.round(median(aiSr))}K (n=${aiSr.length}) vs non-AI $${Math.round(median(nonAiSr))}K (n=${nonAiSr.length}) → ${(100 * (median(aiSr) / median(nonAiSr) - 1)).toFixed(1)}%`);

db.close();
