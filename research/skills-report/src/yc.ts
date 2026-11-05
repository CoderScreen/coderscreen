// YC-specific fetching + parsing.
//
// Data flow (all public, no auth):
//   1. yc-oss all.json           -> company list + firmographics
//   2. /companies/{slug}         -> Inertia props: { jobPostings[], company, ... }
//   3. /companies/{slug}/jobs/.. -> Inertia props: { job, company, relatedJobs, ... }
//
// The pages embed ALL their data as HTML-escaped JSON in `data-page="..."`. We
// return both the parsed props AND the raw HTML so the caller can archive the
// complete payload (see db.archiveDoc).
import { YC_BASE, YC_OSS_ALL } from "./config.ts";
import { fetchJson, fetchText } from "./http.ts";

export interface YcCompany {
  id: number;
  name: string;
  slug: string;
  website: string | null;
  one_liner: string | null;
  long_description: string | null;
  team_size: number | null;
  industry: string | null;
  subindustry: string | null;
  industries: string[];
  tags: string[];
  batch: string | null;
  stage: string | null;
  status: string | null;
  all_locations: string | null;
  regions: string[];
  isHiring: boolean;
  api: string | null;
}

export interface YcJobListing {
  id: number;
  title: string;
  url: string;
  applyUrl?: string;
  location?: string;
  type?: string;
  role?: string;
  roleSpecificType?: string;
  prettyRole?: string;
  salaryRange?: string;
  equityRange?: string;
  minExperience?: string;
  minSchoolYear?: string | null;
  visa?: string;
  skills?: string[];
  isIncomplete?: boolean;
  companyName?: string;
  companyBatchName?: string;
  createdAt?: string;
  lastActive?: string;
}

export interface YcJobDetail extends YcJobListing {
  description?: string;
  interview_process?: string;
}

export interface FetchedPage {
  url: string;
  html: string;
  props: Record<string, unknown>;
}

/** Decode HTML entities (named + numeric) in a single pass. */
export function decodeEntities(s: string): string {
  const named: Record<string, string> = { quot: '"', amp: "&", apos: "'", lt: "<", gt: ">", nbsp: " " };
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return e in named ? named[e]! : m;
  });
}

/** Pull the Inertia page props out of an HTML document. */
export function parseInertiaProps(html: string): Record<string, unknown> {
  const m = html.match(/data-page="([^"]*)"/);
  if (!m) throw new Error("no data-page attribute found (page shape changed?)");
  const data = JSON.parse(decodeEntities(m[1]!)) as { props?: Record<string, unknown> };
  if (!data.props) throw new Error("data-page had no props");
  return data.props;
}

/** Fetch an Inertia page and return raw HTML + full parsed props. */
export async function fetchPage(url: string): Promise<FetchedPage> {
  const abs = url.startsWith("http") ? url : `${YC_BASE}${url}`;
  const html = await fetchText(abs);
  return { url: abs, html, props: parseInertiaProps(html) };
}

export const companyPageUrl = (slug: string) => `${YC_BASE}/companies/${slug}`;

/** All launched YC companies with firmographics. */
export async function fetchCompanies(): Promise<YcCompany[]> {
  return fetchJson<YcCompany[]>(YC_OSS_ALL);
}
