// Minimal OpenAI client for skill extraction — no SDK, just fetch + retry.
// Uses Chat Completions with Structured Outputs (strict json_schema) so the
// model is forced to return valid, schema-conforming JSON.
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface ExtractedSkill {
  raw_span: string;
  canonical_skill: string;
  category: "language" | "framework" | "library" | "tool" | "platform" | "database" | "cloud" | "soft_skill" | "other";
  requirement_level: "required" | "preferred" | "unknown";
  evidence_quote: string;
}

export interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
}

// Strict-mode schema: every object has additionalProperties:false and lists all
// properties as required (OpenAI strict requirement).
const SKILL_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["skills"],
  properties: {
    skills: {
      type: "array",
      description: "One entry per distinct skill explicitly mentioned in the JD.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["raw_span", "canonical_skill", "category", "requirement_level", "evidence_quote"],
        properties: {
          raw_span: { type: "string", description: "Exact phrase as written in the JD." },
          canonical_skill: { type: "string", description: "Normalized standard name, e.g. React.js -> React, k8s -> Kubernetes, GCP -> Google Cloud Platform." },
          category: {
            type: "string",
            enum: ["language", "framework", "library", "tool", "platform", "database", "cloud", "soft_skill", "other"],
          },
          requirement_level: { type: "string", enum: ["required", "preferred", "unknown"] },
          evidence_quote: { type: "string", description: "A short substring copied VERBATIM from the JD that mentions this skill." },
        },
      },
    },
  },
} as const;

const SYSTEM_PROMPT = `You are an expert technical recruiter extracting the skills a software engineering role requires, from its job description.

Rules:
- Extract ONLY skills, technologies, tools, platforms, databases, or notable competencies that are EXPLICITLY mentioned. Never infer or add anything not in the text.
- One entry per DISTINCT canonical skill (deduplicate; if a skill appears as both required and preferred, use "required").
- canonical_skill: normalize to the standard industry name — "ReactJS"/"React.js" -> "React", "k8s" -> "Kubernetes", "GCP" -> "Google Cloud Platform", "postgres" -> "PostgreSQL", "TS" -> "TypeScript".
- Distinguish a programming language from a same-named product (e.g. "Go" the language vs the word "go"; "Java" vs "JavaScript").
- category: pick the best fit. Use "soft_skill" ONLY for genuinely notable, explicitly-stated competencies (e.g. "technical leadership", "mentoring"), not generic filler like "team player".
- requirement_level: "required" if under required/must-have/core responsibilities; "preferred" if nice-to-have/bonus/plus/a-plus; "unknown" if unclear.
- evidence_quote: copy a SHORT verbatim span from the JD (character-for-character) that mentions the skill. This is used to verify you did not hallucinate — it must appear exactly in the description.`;

export async function extractSkills(
  input: { title: string; company: string; description: string },
  opts: { model: string; apiKey: string; retries?: number },
): Promise<{ skills: ExtractedSkill[]; usage: Usage }> {
  const body = {
    model: opts.model,
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Title: ${input.title}\nCompany: ${input.company}\n\nJob description:\n${input.description}` },
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "skill_extraction", strict: true, schema: SKILL_SCHEMA },
    },
  };

  const retries = opts.retries ?? 4;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(Math.min(1000 * 2 ** (attempt - 1), 16_000) + Math.random() * 500);
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${opts.apiKey}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120_000),
      });
      if (res.status === 429 || res.status >= 500) {
        const ra = Number(res.headers.get("retry-after"));
        if (Number.isFinite(ra) && ra > 0) await sleep(ra * 1000);
        lastErr = new Error(`OpenAI HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
        continue;
      }
      if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`);

      const json = (await res.json()) as {
        choices: { message: { content: string | null; refusal?: string | null } }[];
        usage?: { prompt_tokens: number; completion_tokens: number };
      };
      const msg = json.choices?.[0]?.message;
      if (msg?.refusal) return { skills: [], usage: { prompt_tokens: json.usage?.prompt_tokens ?? 0, completion_tokens: json.usage?.completion_tokens ?? 0 } };
      const parsed = JSON.parse(msg?.content ?? "{}") as { skills?: ExtractedSkill[] };
      return {
        skills: parsed.skills ?? [],
        usage: { prompt_tokens: json.usage?.prompt_tokens ?? 0, completion_tokens: json.usage?.completion_tokens ?? 0 },
      };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("extractSkills failed");
}
