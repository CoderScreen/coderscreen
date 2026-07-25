import type { AssessmentEntity } from '@coderscreen/db/assessment.db';
import type { AssessmentSubmissionEntity } from '@coderscreen/db/assessmentSubmission.db';
import type { CandidateEntity } from '@coderscreen/db/candidate.db';
import type { RoomEntity } from '@coderscreen/db/room.db';
import { z } from 'zod';

/**
 * Public API (v1) response contract. These schemas are deliberately decoupled
 * from the internal DB entities: they expose only stable, documented fields
 * (no org/user foreign keys, no secrets like access tokens) and map internal
 * URLs into absolute links. Change internal shapes freely; only breaking
 * changes here need a new API version.
 */

// --- Interviews (rooms) -----------------------------------------------------
export const PublicRoomSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  language: z.string(),
  notes: z.string(),
  url: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PublicRoom = z.infer<typeof PublicRoomSchema>;

export const toPublicRoom = (room: RoomEntity, feUrl: string): PublicRoom => ({
  id: room.id,
  title: room.title,
  status: room.status,
  language: room.language,
  notes: room.notes,
  url: `${feUrl}/room/${room.id}`,
  createdAt: room.createdAt,
  updatedAt: room.updatedAt,
});

// --- Assessments ------------------------------------------------------------
export const PublicAssessmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  mode: z.string(),
  status: z.string(),
  allowedLanguages: z.array(z.string()),
  timeLimitSeconds: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PublicAssessment = z.infer<typeof PublicAssessmentSchema>;

export const toPublicAssessment = (assessment: AssessmentEntity): PublicAssessment => ({
  id: assessment.id,
  title: assessment.title,
  description: assessment.description,
  mode: assessment.mode,
  status: assessment.status,
  allowedLanguages: assessment.allowedLanguages,
  timeLimitSeconds: assessment.timeLimitSeconds,
  createdAt: assessment.createdAt,
  updatedAt: assessment.updatedAt,
});

// --- Candidates -------------------------------------------------------------
export const PublicCandidateSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.string(),
});
export type PublicCandidate = z.infer<typeof PublicCandidateSchema>;

export const toPublicCandidate = (candidate: CandidateEntity): PublicCandidate => ({
  id: candidate.id,
  name: candidate.name,
  email: candidate.email,
  createdAt: candidate.createdAt,
});

// --- Submissions ------------------------------------------------------------
export const PublicSubmissionSchema = z.object({
  id: z.string(),
  assessmentId: z.string(),
  status: z.string(),
  candidate: PublicCandidateSchema.nullable(),
  selectedLanguage: z.string().nullable(),
  startedAt: z.string().nullable(),
  submittedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  totalScore: z.number().nullable(),
  maxScore: z.number().nullable(),
  // Candidate-facing link to take the assessment (embeds the access token).
  takeUrl: z.string(),
  // Recruiter-facing link to review results in the app.
  resultsUrl: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PublicSubmission = z.infer<typeof PublicSubmissionSchema>;

export const toPublicSubmission = (
  submission: AssessmentSubmissionEntity & { candidate?: CandidateEntity | null },
  feUrl: string
): PublicSubmission => ({
  id: submission.id,
  assessmentId: submission.assessmentId,
  status: submission.status,
  candidate: submission.candidate ? toPublicCandidate(submission.candidate) : null,
  selectedLanguage: submission.selectedLanguage,
  startedAt: submission.startedAt ?? null,
  submittedAt: submission.submittedAt ?? null,
  expiresAt: submission.expiresAt ?? null,
  totalScore: submission.totalScore,
  maxScore: submission.maxScore,
  takeUrl: `${feUrl}/take/${submission.id}?token=${submission.accessToken}`,
  resultsUrl: `${feUrl}/assessments/${submission.assessmentId}/submissions/${submission.id}`,
  createdAt: submission.createdAt,
  updatedAt: submission.updatedAt,
});

// Pagination envelope mirrored from lib/pagination for the public contract.
export const PublicPaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  totalCount: z.number(),
  totalPages: z.number(),
});
