// Battery of cross-sectional findings over the YC eng jobs. Everything here is a
// snapshot comparison (by role / stage / experience / size / industry) — NOT a
// time trend. `bun run src/findings.ts`
import { Database } from "bun:sqlite";
import { DB_PATH } from "./config.ts";

const db = new Database(process.argv.find((a) => a.startsWith("--db="))?.split("=")[1] ?? DB_PATH, { readonly: true });

// ---- parsers ----
function usdK(s: string | null): { low: number; high: number; mid: number } | null {
  if (!s || !s.trim().startsWith("$")) return null; // USD only
  const toks = [...s.matchAll(/\$\s?([\d,.]+)\s?([KMkm])?/g)].map((m) => {
    let n = parseFloat(m[1]!.replace(/,/g, ""));
    const u = (m[2] ?? "").toUpperCase();
    if (u === "M") n *= 1000; else if (u === "K") n *= 1; else if (n >= 1000) n /= 1000; // -> $K
    return n;
  });
  if (toks.length === 0) return null;
  const low = toks[0]!, high = toks[toks.length - 1]!;
  return { low, high, mid: (low + high) / 2 };
}
function equityPct(s: string | null): { low: number; high: number; mid: number } | null {
  if (!s) return null;
  const nums = [...s.matchAll(/([\d.]+)\s?%/g)].map((m) => parseFloat(m[1]!));
  if (nums.length === 0) return null;
  const low = nums[0]!, high = nums[nums.length - 1]!;
  return { low, high, mid: (low + high) / 2 };
}
const median = (a: number[]) => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2; };
const pctl = (a: number[], p: number) => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]!; };
const r1 = (n: number) => Math.round(n * 10) / 10;

type J = { title: string; role_specific_type: string | null; location: string | null; salary_range: string | null; equity_range: string | null; min_experience: string | null; stage: string | null; team_size: number | null; industry: string | null; description: string | null; interview_process: string | null };
const eng = db.query<J, []>(`SELECT j.title, j.role_specific_type, j.location, j.salary_range, j.equity_range, j.min_experience, c.stage, c.team_size, c.industry, j.description, j.interview_process FROM jobs j JOIN companies c ON c.slug=j.company_slug WHERE j.role='eng'`).all();
console.log(`eng jobs: ${eng.length}\n`);

// ---- 1. Salary convergence across roles (USD) ----
console.log("=== 1. Median salary & equity by role type (USD-disclosed only) ===");
const byRole = new Map<string, { sal: number[]; eq: number[] }>();
for (const j of eng) {
  const rt = j.role_specific_type ?? "(unspecified)";
  if (!byRole.has(rt)) byRole.set(rt, { sal: [], eq: [] });
  const s = usdK(j.salary_range); if (s) byRole.get(rt)!.sal.push(s.mid);
  const e = equityPct(j.equity_range); if (e) byRole.get(rt)!.eq.push(e.mid);
}
for (const [rt, v] of [...byRole.entries()].filter(([, v]) => v.sal.length >= 25).sort((a, b) => b[1].sal.length - a[1].sal.length))
  console.log(`  ${rt.padEnd(16)} n=${String(v.sal.length).padStart(4)}  median $${Math.round(median(v.sal))}K   equity ${r1(median(v.eq))}%`);

// ---- 2. Equity spread within one salary band ($150-185K) ----
console.log("\n=== 2. Equity spread WITHIN the $150-185K salary band ===");
const band = eng.filter((j) => { const s = usdK(j.salary_range); return s && s.mid >= 150 && s.mid <= 185; }).map((j) => equityPct(j.equity_range)?.mid).filter((x): x is number => x != null && x > 0);
console.log(`  n=${band.length}  min ${r1(pctl(band, 0.02))}%  p25 ${r1(pctl(band, 0.25))}%  median ${r1(median(band))}%  p75 ${r1(pctl(band, 0.75))}%  p98 ${r1(pctl(band, 0.98))}%  → ${r1(pctl(band, 0.98) / Math.max(0.01, pctl(band, 0.02)))}x spread`);

// ---- 3. Founding vs non-founding ----
console.log("\n=== 3. Founding-title vs non-founding (same corpus) ===");
for (const [lbl, filt] of [["founding", (j: J) => /found/i.test(j.title)], ["non-founding", (j: J) => !/found/i.test(j.title)]] as const) {
  const sub = eng.filter(filt);
  const sal = sub.map((j) => usdK(j.salary_range)?.mid).filter((x): x is number => x != null);
  const eq = sub.map((j) => equityPct(j.equity_range)?.mid).filter((x): x is number => x != null);
  console.log(`  ${lbl.padEnd(13)} n=${sub.length}  median salary $${Math.round(median(sal))}K  median equity ${r1(median(eq))}%`);
}

// ---- 4. Equity & salary by experience (new grad vs senior) ----
console.log("\n=== 4. Salary & equity by required experience ===");
const expBucket = (s: string | null) => !s ? null : /new grad|any/i.test(s) ? "0 new-grad-ok" : /^1\+/.test(s) ? "1+ yrs" : /^3\+/.test(s) ? "3+ yrs" : /^5\+/.test(s) ? "5+ yrs" : /6\+|8\+|11\+|10\+/.test(s) ? "6+ yrs" : "other";
const byExp = new Map<string, { sal: number[]; eq: number[] }>();
for (const j of eng) { const b = expBucket(j.min_experience); if (!b) continue; if (!byExp.has(b)) byExp.set(b, { sal: [], eq: [] }); const s = usdK(j.salary_range); if (s) byExp.get(b)!.sal.push(s.mid); const e = equityPct(j.equity_range); if (e) byExp.get(b)!.eq.push(e.mid); }
for (const b of ["0 new-grad-ok", "1+ yrs", "3+ yrs", "5+ yrs", "6+ yrs"]) { const v = byExp.get(b); if (v) console.log(`  ${b.padEnd(14)} n=${String(v.sal.length).padStart(4)}  median $${Math.round(median(v.sal))}K  equity ${r1(median(v.eq))}%`); }

// ---- 5. Disclosure by stage ----
console.log("\n=== 5. Pay transparency by stage ===");
for (const st of ["Early", "Growth"]) {
  const sub = eng.filter((j) => j.stage === st);
  const salN = sub.filter((j) => j.salary_range && j.salary_range.trim()).length;
  const eqN = sub.filter((j) => j.equity_range && j.equity_range.trim()).length;
  console.log(`  ${st.padEnd(7)} n=${sub.length}  salary disclosed ${r1(100 * salN / sub.length)}%  equity disclosed ${r1(100 * eqN / sub.length)}%`);
}

// ---- 6. Remote vs onsite salary (within experience) ----
console.log("\n=== 6. Remote vs onsite median salary ===");
for (const [lbl, filt] of [["remote", (j: J) => /remote/i.test(j.location ?? "")], ["onsite/other", (j: J) => !/remote/i.test(j.location ?? "")]] as const) {
  const sal = eng.filter(filt).map((j) => usdK(j.salary_range)?.mid).filter((x): x is number => x != null);
  console.log(`  ${lbl.padEnd(13)} n=${sal.length}  median $${Math.round(median(sal))}K`);
}

// ---- 7. Interview format prevalence (among described processes) ----
console.log("\n=== 7. Interview format prevalence (jobs with interview_process > 40 chars) ===");
const proc = eng.filter((j) => (j.interview_process ?? "").length > 40);
const fmt: [string, RegExp][] = [["paid/work trial", /trial|paid project|work with us|work sample/i], ["take-home", /take[- ]?home|take home|async (project|assignment)|assignment/i], ["live coding / pairing", /live coding|pair(ing| program)|screen ?share/i], ["system design", /system design|architecture (interview|round)/i], ["LeetCode", /leetcode|leet code/i], ["whiteboard", /whiteboard/i], ["founder / CEO / CTO", /founder|\bceo\b|\bcto\b/i], ["references", /reference check|references/i]];
console.log(`  described processes: ${proc.length} (${r1(100 * proc.length / eng.length)}% of eng jobs)`);
for (const [lbl, re] of fmt) { const n = proc.filter((j) => re.test(j.interview_process!)).length; console.log(`  ${lbl.padEnd(22)} ${String(n).padStart(4)}  ${r1(100 * n / proc.length)}%`); }
// LeetCode negation
const lc = proc.filter((j) => /leetcode|leet code/i.test(j.interview_process!));
const lcNeg = lc.filter((j) => /no |not |instead of |rather than |zero |without |don'?t/i.test(j.interview_process!.slice(Math.max(0, j.interview_process!.toLowerCase().indexOf("leet") - 25), j.interview_process!.toLowerCase().indexOf("leet"))));
console.log(`  → of ${lc.length} LeetCode mentions, ${lcNeg.length} are negations ("no leetcode")`);

// ---- 8. Paid-trial gradient by experience ----
console.log("\n=== 8. Paid/work-trial rate by required experience (described processes) ===");
for (const b of ["0 new-grad-ok", "1+ yrs", "3+ yrs", "6+ yrs"]) { const sub = proc.filter((j) => expBucket(j.min_experience) === b); if (sub.length >= 15) { const t = sub.filter((j) => /trial|paid project|work sample/i.test(j.interview_process!)).length; console.log(`  ${b.padEnd(14)} n=${String(sub.length).padStart(3)}  trial ${r1(100 * t / sub.length)}%`); } }

// ---- 9. New-grad openness: size (honest) + controlled-for-size ----
console.log("\n=== 9. New-grad-OK by TEAM SIZE (cross-sectional, honest framing) ===");
const sizeBand = (t: number | null) => t == null ? null : t <= 10 ? "1-10" : t <= 50 ? "11-50" : t <= 200 ? "51-200" : t <= 500 ? "201-500" : "500+";
const bySize = new Map<string, { n: number; ng: number }>();
for (const j of eng) { if (!j.min_experience) continue; const b = sizeBand(j.team_size); if (!b) continue; const o = bySize.get(b) ?? { n: 0, ng: 0 }; o.n++; if (/new grad|any/i.test(j.min_experience)) o.ng++; bySize.set(b, o); }
for (const b of ["1-10", "11-50", "51-200", "201-500", "500+"]) { const v = bySize.get(b); if (v) console.log(`  ${b.padEnd(9)} n=${String(v.n).padStart(4)}  new-grad-ok ${r1(100 * v.ng / v.n)}%`); }

// ---- 10. Industry stack outliers (naive) ----
console.log("\n=== 10. Industry stack outliers (naive desc regex) ===");
const inds = ["B2B", "Fintech", "Healthcare", "Industrials", "Consumer"];
const probe: [string, RegExp][] = [["C++", /\bc\+\+/i], ["LLM/GenAI", /\bllms?\b|generative ai|large language model/i], ["HIPAA", /hipaa/i], ["Rust", /\brust\b/i], ["Python", /\bpython\b/i]];
process.stdout.write("  industry".padEnd(14)); for (const [p] of probe) process.stdout.write(p.padStart(11)); console.log();
for (const ind of inds) { const sub = eng.filter((j) => j.industry === ind && j.description); process.stdout.write(`  ${ind.padEnd(12)}`); for (const [, re] of probe) process.stdout.write((r1(100 * sub.filter((j) => re.test(j.description!)).length / sub.length) + "%").padStart(11)); console.log(`   (n=${sub.length})`); }

// ---- 11. AI coding tools named (company-deduped) ----
console.log("\n=== 11. AI coding tools NAMED in eng JDs (company-deduped) ===");
const coRows = db.query<{ slug: string; d: string }, []>(`SELECT c.slug, GROUP_CONCAT(j.description,' ') d FROM jobs j JOIN companies c ON c.slug=j.company_slug WHERE j.role='eng' AND j.description IS NOT NULL GROUP BY c.slug`).all();
for (const [tool, re] of [["Cursor", /\bcursor\b/i], ["Claude Code", /claude code/i], ["Copilot", /copilot/i], ["Windsurf", /windsurf/i], ["Devin", /\bdevin\b/i]] as [string, RegExp][]) { const n = coRows.filter((r) => re.test(r.d)).length; console.log(`  ${tool.padEnd(13)} ${String(n).padStart(4)} companies  ${r1(100 * n / coRows.length)}%`); }
console.log(`  (base: ${coRows.length} hiring eng companies)`);

db.close();
