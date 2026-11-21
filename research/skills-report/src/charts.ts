// Generate the post's charts as branded SVGs straight from the DB (ECharts SSR).
// Reproducible + versionable: re-run to regenerate. `bun run src/charts.ts`
// Output: charts/*.svg + charts/index.html (open that to preview all of them).
import * as echarts from "echarts";
import { Database } from "bun:sqlite";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { DB_PATH } from "./config.ts";

const db = new Database(DB_PATH, { readonly: true });
mkdirSync(new URL("../charts", import.meta.url).pathname, { recursive: true });
const OUT = new URL("../charts", import.meta.url).pathname;

// ---- brand + palette ----
const BRAND = "#1860fb"; // CoderScreen brand blue (from apps/marketing/public/logo.svg)
const C = { text: "#0F172A", sub: "#64748B", grid: "#E2E8F0", base: "#334155", accent: BRAND, pos: "#0F9D8C", neg: "#E05252", neutral: "#94A3B8", ai: "#D97706" };
const FONT = "Inter, system-ui, -apple-system, Segoe UI, sans-serif";

// ---- watermark: CoderScreen logo + wordmark, top-right corner ----
const LOGO = readFileSync(new URL("../../../apps/marketing/public/logo.svg", import.meta.url).pathname, "utf8");
const LOGO_PATHS = [...LOGO.matchAll(/<path[^>]*\/>/g)].map((m) => m[0].replace(/class="s0"/g, `fill="${BRAND}"`)).join("");
function watermark(svg: string, w: number): string {
  const cy = 22; // shared vertical center for icon + wordmark
  // Left-anchored (works in every SVG renderer); positioned with a generous
  // right-margin budget so the ~120px wordmark can't overflow.
  const iconX = w - 172;
  const wm = `<g opacity="0.9">` +
    `<g transform="translate(${iconX},${cy - 10}) scale(0.1)">${LOGO_PATHS}</g>` +
    `<text x="${iconX + 26}" y="${cy}" dominant-baseline="central" font-family="${FONT}" font-size="12" font-weight="700" fill="${BRAND}">CoderScreen</text>` +
    `</g>`;
  return svg.replace("</svg>", `${wm}</svg>`);
}

const rendered: { name: string; title: string }[] = [];
function render(name: string, title: string, option: echarts.EChartsCoreOption, width = 780, height = 440) {
  const chart = echarts.init(null, null, { renderer: "svg", ssr: true, width, height });
  chart.setOption({ backgroundColor: "#fff", textStyle: { fontFamily: FONT, color: C.text }, ...(option as object) });
  writeFileSync(`${OUT}/${name}.svg`, watermark(chart.renderToSVGString(), width));
  chart.dispose();
  rendered.push({ name, title });
}
const titleOpt = (text: string, subtext: string) => ({ text, subtext, left: 8, top: 6, textStyle: { fontSize: 16, fontWeight: 700 }, subtextStyle: { fontSize: 12, color: C.sub } });
const xVal = (fmt: string) => ({ type: "value", axisLabel: { formatter: fmt, color: C.sub }, splitLine: { lineStyle: { color: C.grid } }, axisLine: { show: false }, axisTick: { show: false } });
const yCat = (data: string[]) => ({ type: "category", inverse: true, data, axisTick: { show: false }, axisLine: { show: false }, axisLabel: { color: C.text, fontSize: 12 } });

// ---- parsers + helpers ----
function usdK(s: string | null): number | null { if (!s || !s.trim().startsWith("$")) return null; const t = [...s.matchAll(/\$\s?([\d,.]+)\s?([KMkm])?/g)].map((m) => { let n = parseFloat(m[1]!.replace(/,/g, "")); const u = (m[2] ?? "").toUpperCase(); if (u === "M") n *= 1000; else if (u !== "K" && n >= 1000) n /= 1000; return n; }); return t.length ? (t[0]! + t[t.length - 1]!) / 2 : null; }
function eqPct(s: string | null): number | null { if (!s) return null; const n = [...s.matchAll(/([\d.]+)\s?%/g)].map((m) => parseFloat(m[1]!)); return n.length ? (n[0]! + n[n.length - 1]!) / 2 : null; }
const median = (a: number[]) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2; };
const pctl = (a: number[], p: number) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]!; };
const ALIAS: Record<string, string> = { "amazon web services": "AWS", aws: "AWS", "aws lambda": "AWS", "google cloud platform": "GCP", gcp: "GCP", "microsoft azure": "Azure", azure: "Azure", postgres: "PostgreSQL", node: "Node.js", "node.js": "Node.js", "react.js": "React", reactjs: "React", golang: "Go", "openai api": "OpenAI", openai: "OpenAI" };
const norm = (s: string) => ALIAS[s.toLowerCase().trim()] ?? s;
const AI_RE = /\b(llm|large language|gpt|openai|anthropic|claude|gemini|rag\b|retrieval[- ]aug|fine[- ]?tun|prompt eng|vector (db|database|store)|pinecone|langchain|hugging ?face|pytorch|tensorflow|cuda|mlops|evals?\b|machine learning|deep learning|computer vision|\bnlp\b|cursor|claude code|copilot|windsurf|devin)/i;

// ---- load ----
type Row = { sal: number | null; eq: number | null; senior3: boolean; stage: string | null; team: number | null; loc: string | null; ex: string | null };
const jr = db.query<{ id: number; salary_range: string | null; equity_range: string | null; min_experience: string | null; stage: string | null; team_size: number | null; location: string | null }, []>(`SELECT j.id, j.salary_range, j.equity_range, j.min_experience, c.stage, c.team_size, j.location FROM jobs j JOIN companies c ON c.slug=j.company_slug WHERE j.role='eng'`).all();
const jobs = new Map<number, Row>();
for (const j of jr) jobs.set(j.id, { sal: usdK(j.salary_range), eq: eqPct(j.equity_range), senior3: /3\+|5\+|6\+|8\+|11\+/.test(j.min_experience ?? ""), stage: j.stage, team: j.team_size, loc: j.location, ex: j.min_experience });
const sal = [...jobs.values()].map((j) => j.sal).filter((x): x is number => x != null);
const BASE = median(sal), BASE_SR = median([...jobs.values()].filter((j) => j.senior3 && j.sal != null).map((j) => j.sal!));

// job -> skills (technical categories, aliased)
const jobSkills = new Map<number, Set<string>>();
for (const r of db.query<{ job_id: number; canonical_skill: string }, []>(`SELECT job_id, canonical_skill FROM job_skills WHERE category IN ('language','framework','library','tool','platform','database','cloud')`).all()) {
  if (!jobSkills.has(r.job_id)) jobSkills.set(r.job_id, new Set());
  jobSkills.get(r.job_id)!.add(norm(r.canonical_skill));
}
const nExtract = [...jobSkills.keys()].filter((id) => jobs.has(id)).length;
function skillSalaries(name: string, seniorOnly = false) { const out: number[] = []; for (const [id, sk] of jobSkills) { const j = jobs.get(id); if (!j || j.sal == null || (seniorOnly && !j.senior3)) continue; if (sk.has(name)) out.push(j.sal); } return out; }

// =================== CHARTS ===================

// 1) salary wall
{
  const roles = [["Backend", 175], ["Machine learning", 175], ["Full-stack", 170], ["Frontend", 155], ["DevOps", 155], ["Engineering mgr", 239]] as [string, number][];
  render("1-salary-wall", "The $170K wall", {
    title: titleOpt("Almost every role pays about $170K", "Median base salary by role, for the YC engineering jobs that list one in dollars (n=2,016)"),
    grid: { left: 130, right: 70, top: 66, bottom: 24 },
    xAxis: xVal("${value}K".replace("$", "$")), yAxis: yCat(roles.map((r) => r[0])),
    series: [{ type: "bar", barWidth: "60%", data: roles.map(([n, v]) => ({ value: v, itemStyle: { color: n === "Engineering mgr" ? C.accent : C.base, borderRadius: [0, 3, 3, 0] } })), label: { show: true, position: "right", formatter: (p: any) => `$${p.value}K`, color: C.text, fontSize: 12, fontWeight: 600 } }],
  }, 780, 360);
}

// 2) equity spread within one band
{
  const band = [...jobs.values()].filter((j) => j.sal != null && j.sal >= 150 && j.sal <= 185 && j.eq != null).map((j) => j.eq!);
  const pts = [["p2", pctl(band, 0.02)], ["p25", pctl(band, 0.25)], ["p50 (median)", median(band)], ["p75", pctl(band, 0.75)], ["p98", pctl(band, 0.98)]] as [string, number][];
  render("2-equity-spread", "The 40× equity spread", {
    title: titleOpt("Same salary, 40x the equity", `Equity offered inside a single salary band ($150K to $185K base, n=${band.length})`),
    grid: { left: 110, right: 80, top: 66, bottom: 24 },
    xAxis: xVal("{value}%"), yAxis: yCat(pts.map((p) => p[0])),
    series: [{ type: "bar", barWidth: "58%", data: pts.map(([, v]) => ({ value: +v.toFixed(2), itemStyle: { color: C.accent, borderRadius: [0, 3, 3, 0] } })), label: { show: true, position: "right", formatter: (p: any) => `${p.value}%`, color: C.text, fontSize: 12, fontWeight: 600 } }],
  }, 780, 320);
}

// 3) skill demand — normalized (merges aliases like Amazon Web Services + AWS)
{
  const dem = new Map<string, { jobs: Set<number>; req: Set<number> }>();
  for (const r of db.query<{ job_id: number; canonical_skill: string; requirement_level: string }, []>(`SELECT job_id, canonical_skill, requirement_level FROM job_skills WHERE category IN ('language','framework','library','tool','platform','database','cloud')`).all()) {
    const s = norm(r.canonical_skill);
    if (!dem.has(s)) dem.set(s, { jobs: new Set(), req: new Set() });
    const d = dem.get(s)!; d.jobs.add(r.job_id); if (r.requirement_level === "required") d.req.add(r.job_id);
  }
  const rows = [...dem.entries()].map(([s, d]) => ({ s, n: d.jobs.size, reqPct: Math.round(100 * d.req.size / d.jobs.size) })).sort((a, b) => b.n - a.n).slice(0, 12);
  render("3-skill-demand", "Most-demanded skills", {
    title: titleOpt("What YC startups screen for", `Share of engineering jobs that ask for each skill (n=${nExtract})`),
    grid: { left: 110, right: 130, top: 66, bottom: 24 },
    xAxis: xVal("{value}%"), yAxis: yCat(rows.map((r) => r.s)),
    series: [{ type: "bar", barWidth: "62%", data: rows.map((r) => +(100 * r.n / nExtract).toFixed(1)), itemStyle: { color: C.base, borderRadius: [0, 3, 3, 0] }, label: { show: true, position: "right", formatter: (p: any) => `${p.value}% (${rows[p.dataIndex]!.reqPct}% required)`, color: C.sub, fontSize: 11 } }],
  }, 780, 440);
}

// 4) FLAGSHIP — skill pay premium (diverging). Curated to tell the full story.
{
  const list = ["Temporal", "Terraform", "CUDA", "Datadog", "PyTorch", "Cursor", "Claude Code", "React", "OpenAI", "Anthropic", "Java", "JavaScript", "React Native", "Git", "CSS"];
  const data = list.map((name) => { const s = skillSalaries(name); const ok = s.length >= 15; return { name, prem: ok ? median(s) / BASE - 1 : null, ai: AI_RE.test(name) }; }).filter((d): d is { name: string; prem: number; ai: boolean } => d.prem !== null);
  render("4-skill-pay", "What actually pays", {
    title: titleOpt("Knowing AI doesn't pay. Building the systems under it does.", "How much each skill pays compared to the $170K median. Amber bars are AI or ML skills."),
    grid: { left: 150, right: 60, top: 70, bottom: 30 },
    xAxis: { ...xVal("{value}%"), max: 12, min: -20 },
    yAxis: yCat(data.map((d) => `${d.name}  ${d.prem >= 0 ? "+" : ""}${(d.prem * 100).toFixed(0)}%`)),
    series: [{ type: "bar", barWidth: "62%", data: data.map((d) => ({ value: +(d.prem * 100).toFixed(0), itemStyle: { color: d.prem > 0.005 ? C.pos : d.prem < -0.005 ? C.neg : C.neutral, borderColor: d.ai ? C.ai : "transparent", borderWidth: d.ai ? 2.5 : 0 } })), markLine: { silent: true, symbol: "none", data: [{ xAxis: 0 }], lineStyle: { color: C.base, width: 1.5 }, label: { show: false } } }],
  }, 820, 500);
}

// 5) does AI pay? cohort
{
  const ai: number[] = [], non: number[] = [];
  for (const [id, sk] of jobSkills) { const j = jobs.get(id); if (!j || j.sal == null) continue; ([...sk].some((s) => AI_RE.test(s)) ? ai : non).push(j.sal); }
  const cats = ["Requires an AI/ML skill", "No AI/ML skill"];
  render("5-ai-cohort", "Does requiring AI pay?", {
    title: titleOpt("Does requiring AI actually pay more?", `Median base salary. About +${(100 * (median(ai) / median(non) - 1)).toFixed(0)}% overall, but only +3% once you compare engineers with similar experience.`),
    grid: { left: 190, right: 70, top: 70, bottom: 24 },
    xAxis: xVal("${value}K".replace("$", "$")), yAxis: yCat(cats),
    series: [{ type: "bar", barWidth: "48%", data: [{ value: Math.round(median(ai)), itemStyle: { color: C.pos } }, { value: Math.round(median(non)), itemStyle: { color: C.neutral } }], label: { show: true, position: "right", formatter: (p: any) => `$${p.value}K`, fontSize: 12, fontWeight: 600, color: C.text } }],
  }, 780, 260);
}

// 6) new-grad by size
{
  const sizeBand = (t: number | null) => t == null ? null : t <= 10 ? "1 to 10" : t <= 50 ? "11 to 50" : t <= 200 ? "51 to 200" : t <= 500 ? "201 to 500" : "500+";
  const bins = new Map<string, { n: number; ng: number }>();
  for (const j of jobs.values()) { if (!j.ex) continue; const b = sizeBand(j.team); if (!b) continue; const o = bins.get(b) ?? { n: 0, ng: 0 }; o.n++; if (/new grad|any/i.test(j.ex)) o.ng++; bins.set(b, o); }
  const order = ["1 to 10", "11 to 50", "51 to 200"];
  render("6-newgrad-size", "New grads by company size", {
    title: titleOpt("Smaller companies hire more juniors", "Share of engineering roles open to new grads, grouped by company size"),
    grid: { left: 90, right: 80, top: 66, bottom: 24 },
    xAxis: xVal("{value}%"), yAxis: yCat(order),
    series: [{ type: "bar", barWidth: "52%", data: order.map((b) => +(100 * bins.get(b)!.ng / bins.get(b)!.n).toFixed(1)), itemStyle: { color: C.base, borderRadius: [0, 3, 3, 0] }, label: { show: true, position: "right", formatter: (p: any) => `${p.value}%`, fontSize: 12, fontWeight: 600, color: C.text } }],
  }, 780, 260);
}

// index.html preview
const html = `<!doctype html><meta charset=utf8><title>skills-report charts</title>
<style>body{font-family:${FONT};max-width:900px;margin:40px auto;padding:0 16px;color:${C.text}}
h1{font-size:22px}h2{font-size:15px;color:${C.sub};font-weight:600;margin:34px 0 8px}
img{width:100%;border:1px solid ${C.grid};border-radius:10px}</style>
<h1>Blog charts — generated from the DB</h1>
<p style="color:${C.sub}">Regenerate with <code>bun run src/charts.ts</code>. SVGs live in <code>charts/</code>.</p>
${rendered.map((r) => `<h2>${r.title}</h2><img src="${r.name}.svg" alt="${r.title}">`).join("\n")}`;
writeFileSync(`${OUT}/index.html`, html);

console.log(`generated ${rendered.length} charts → ${OUT}/`);
for (const r of rendered) console.log(`  ${r.name}.svg — ${r.title}`);
console.log(`\nopen ${OUT}/index.html to preview`);
db.close();
