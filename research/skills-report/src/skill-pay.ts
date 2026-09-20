// Which skills pay more? Naive-keyword preview of skill x compensation, to
// validate the "highest-paying skills" angle before the full LLM extraction.
// Controls partially for seniority by also showing pay WITHIN the "3+ yrs" band.
// `bun run src/skill-pay.ts`
import { Database } from "bun:sqlite";
import { DB_PATH } from "./config.ts";

const db = new Database(process.argv.find((a) => a.startsWith("--db="))?.split("=")[1] ?? DB_PATH, { readonly: true });

function usdK(s: string | null): number | null {
  if (!s || !s.trim().startsWith("$")) return null;
  const toks = [...s.matchAll(/\$\s?([\d,.]+)\s?([KMkm])?/g)].map((m) => { let n = parseFloat(m[1]!.replace(/,/g, "")); const u = (m[2] ?? "").toUpperCase(); if (u === "M") n *= 1000; else if (u !== "K" && n >= 1000) n /= 1000; return n; });
  if (!toks.length) return null; return (toks[0]! + toks[toks.length - 1]!) / 2;
}
function eqPct(s: string | null): number | null {
  if (!s) return null; const n = [...s.matchAll(/([\d.]+)\s?%/g)].map((m) => parseFloat(m[1]!)); if (!n.length) return null; return (n[0]! + n[n.length - 1]!) / 2;
}
const median = (a: number[]) => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2; };

type J = { salary_range: string | null; equity_range: string | null; min_experience: string | null; description: string };
const eng = db.query<J, []>(`SELECT j.salary_range, j.equity_range, j.min_experience, j.description FROM jobs j WHERE j.role='eng' AND j.description IS NOT NULL AND j.description!=''`).all();
const withSal = eng.map((j) => ({ ...j, sal: usdK(j.salary_range), eq: eqPct(j.equity_range), senior3: /3\+|5\+|6\+|8\+|11\+/.test(j.min_experience ?? "") })).filter((j) => j.sal != null);
const baseAll = median(withSal.map((j) => j.sal!));
const senior = withSal.filter((j) => j.senior3);
const baseSenior = median(senior.map((j) => j.sal!));
console.log(`eng jobs w/ USD salary: ${withSal.length}  ·  overall median $${Math.round(baseAll)}K`);
console.log(`  (within 3+ yrs band: n=${senior.length}, median $${Math.round(baseSenior)}K — used to control for seniority)\n`);

const SKILLS: [string, RegExp][] = [
  ["Rust", /\brust\b/i], ["Go", /\bgolang\b|\bGo\b/], ["C++", /\bc\+\+/i], ["Python", /\bpython\b/i], ["TypeScript", /\btypescript\b/i], ["React", /\breact(\.js|js)?\b/i], ["Node.js", /\bnode(\.js|js)?\b/i], ["Java", /\bjava\b/i], ["Kotlin", /\bkotlin\b/i], ["Swift", /\bswift\b/i], ["Elixir", /\belixir\b/i], ["Scala", /\bscala\b/i],
  ["Kubernetes", /\b(kubernetes|k8s)\b/i], ["Terraform", /\bterraform\b/i], ["AWS", /\baws\b/i], ["GCP", /\b(gcp|google cloud)\b/i], ["Distributed systems", /distributed systems/i], ["Postgres", /\bpostgres/i], ["Kafka", /\bkafka\b/i], ["Redis", /\bredis\b/i],
  ["Machine learning", /machine learning|deep learning/i], ["PyTorch", /\bpytorch\b/i], ["LLM / GenAI", /\bllms?\b|large language model|generative ai|genai/i], ["RAG", /\brag\b|retrieval[- ]augmented/i], ["Fine-tuning", /fine[- ]tun/i], ["CUDA / GPU", /\bcuda\b|gpu kernel|triton/i], ["Evals", /\bevals?\b/i],
  ["Cursor", /\bcursor\b/i], ["Claude Code", /claude code/i], ["Copilot", /copilot/i],
];

type Row = { skill: string; n: number; med: number; prem: number; medSr: number | null; nSr: number; eq: number };
const rows: Row[] = [];
for (const [skill, re] of SKILLS) {
  const hit = withSal.filter((j) => re.test(j.description));
  if (hit.length < 20) continue;
  const med = median(hit.map((j) => j.sal!));
  const srHit = hit.filter((j) => j.senior3);
  const medSr = srHit.length >= 15 ? median(srHit.map((j) => j.sal!)) : null;
  const eqv = hit.map((j) => j.eq).filter((x): x is number => x != null);
  rows.push({ skill, n: hit.length, med, prem: 100 * (med / baseAll - 1), medSr, nSr: srHit.length, eq: median(eqv) });
}

console.log("=== Skills ranked by median salary (naive keyword) ===");
console.log("  skill".padEnd(22), "n".padStart(5), "median".padStart(8), "vs all".padStart(8), "  3+yr med".padStart(10), "median eq".padStart(11));
for (const r of rows.sort((a, b) => b.med - a.med)) {
  const prem = (r.prem >= 0 ? "+" : "") + r.prem.toFixed(0) + "%";
  const sr = r.medSr != null ? `$${Math.round(r.medSr)}K (${(100 * (r.medSr / baseSenior - 1)).toFixed(0)}%)` : "—";
  console.log("  " + r.skill.padEnd(20), String(r.n).padStart(5), `$${Math.round(r.med)}K`.padStart(8), prem.padStart(8), sr.padStart(12), `${r.eq.toFixed(2)}%`.padStart(11));
}

console.log("\n=== 'AI-native' cohorts vs the rest (naive) ===");
const cohorts: [string, RegExp][] = [["mentions LLM/GenAI", /\bllms?\b|large language model|generative ai|genai/i], ["AI-native / AI-first framing", /ai[- ](native|first|forward)/i], ["names a coding agent (Cursor/Claude/Copilot)", /\bcursor\b|claude code|copilot/i], ["expects AI in workflow", /ai[- ]assisted|coding agent|leverage ai|use ai to|fluency (with|in) ai/i]];
for (const [lbl, re] of cohorts) {
  const yes = withSal.filter((j) => re.test(j.description)); const no = withSal.filter((j) => !re.test(j.description));
  const my = median(yes.map((j) => j.sal!)), mn = median(no.map((j) => j.sal!));
  console.log(`  ${lbl.padEnd(46)} n=${String(yes.length).padStart(4)}  $${Math.round(my)}K vs $${Math.round(mn)}K  (${(100 * (my / mn - 1) >= 0 ? "+" : "")}${(100 * (my / mn - 1)).toFixed(1)}%)`);
}
db.close();
