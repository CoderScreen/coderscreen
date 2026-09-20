import { z } from 'zod';

/**
 * Declarative registry of MCP tools. Each entry maps 1:1 to a public `/v1`
 * endpoint: `input` is the tool's parameters (a zod raw shape) and `request`
 * turns validated args into the `/v1` call to make. Adding a public endpoint to
 * the MCP is a single entry here; there is no per-tool boilerplate. Business
 * logic stays in the services behind `/v1`.
 */
export interface McpToolDef {
  name: string;
  description: string;
  input: z.ZodRawShape;
  request: (args: Record<string, unknown>) => { method: string; path: string; body?: unknown };
}

const withQuery = (base: string, params: Record<string, unknown>): string => {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${base}?${s}` : base;
};

export const TOOLS: McpToolDef[] = [
  {
    name: 'list_interviews',
    description: 'List live coding interviews for your organization.',
    input: {},
    request: () => ({ method: 'GET', path: '/rooms' }),
  },
  {
    name: 'create_interview',
    description:
      'Create a live coding interview. Returns the interview and its shareable join URL.',
    input: {
      title: z.string().describe('Title of the interview'),
      language: z.string().describe('Primary language, e.g. "python", "typescript", "go"'),
      notes: z.string().optional().describe('Optional private notes'),
    },
    request: (a) => ({
      method: 'POST',
      path: '/rooms',
      body: { title: a.title, language: a.language, notes: a.notes },
    }),
  },
  {
    name: 'get_interview',
    description: 'Get a single interview by its ID.',
    input: { id: z.string().describe('Interview ID (starts with r_)') },
    request: (a) => ({ method: 'GET', path: `/rooms/${a.id}` }),
  },
  {
    name: 'list_assessments',
    description: 'List assessments (auto-graded coding tests) for your organization, paginated.',
    input: {
      page: z.number().int().min(1).optional().describe('Page number, default 1'),
      limit: z.number().int().min(1).max(100).optional().describe('Page size, default 20'),
    },
    request: (a) => ({
      method: 'GET',
      path: withQuery('/assessments', { page: a.page, limit: a.limit }),
    }),
  },
  {
    name: 'get_assessment',
    description: 'Get a single assessment by its ID.',
    input: { id: z.string().describe('Assessment ID (starts with as_)') },
    request: (a) => ({ method: 'GET', path: `/assessments/${a.id}` }),
  },
  {
    name: 'list_submissions',
    description: 'List candidate submissions for an assessment, including scores and status.',
    input: { assessmentId: z.string().describe('Assessment ID (starts with as_)') },
    request: (a) => ({ method: 'GET', path: `/assessments/${a.assessmentId}/submissions` }),
  },
  {
    name: 'invite_candidate',
    description:
      'Invite a candidate to an assessment. Emails them a link to start it, and returns the submission including that link (takeUrl) plus `emailSent`. If `emailSent` is false the email did not go out and you must send takeUrl to the candidate yourself. The candidate still has to open the link and press Start before the timer begins.',
    input: {
      assessmentId: z.string().describe('Assessment ID (starts with as_)'),
      candidateName: z.string().describe('Candidate full name'),
      candidateEmail: z.string().email().describe('Candidate email address'),
    },
    request: (a) => ({
      method: 'POST',
      path: `/assessments/${a.assessmentId}/invites`,
      body: { candidateName: a.candidateName, candidateEmail: a.candidateEmail },
    }),
  },
  {
    name: 'get_submission',
    description: 'Get a single submission (with results) by its ID.',
    input: { id: z.string().describe('Submission ID (starts with asub_)') },
    request: (a) => ({ method: 'GET', path: `/submissions/${a.id}` }),
  },
  {
    name: 'list_candidates',
    description: 'List candidates in your organization.',
    input: {},
    request: () => ({ method: 'GET', path: '/candidates' }),
  },
];
