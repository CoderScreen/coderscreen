import { idString } from '@coderscreen/common/id';
import { z } from 'zod';

export const AssessmentLanguageSchema = z.enum([
  'typescript',
  'javascript',
  'python',
  'bash',
  'rust',
  'c++',
  'c',
  'java',
  'go',
  'php',
  'ruby',
]);

export const AssessmentModeSchema = z.enum(['sequential', 'independent']);
export const AssessmentStatusSchema = z.enum(['draft', 'active', 'archived']);

// === Assessment ===

export const AssessmentSchema = z.object({
  id: idString('assessment'),
  createdAt: z.string(),
  updatedAt: z.string(),
  title: z.string().min(1).max(200),
  description: z.string(),
  mode: AssessmentModeSchema,
  status: AssessmentStatusSchema,
  allowedLanguages: z.array(AssessmentLanguageSchema).min(1),
  timeLimitSeconds: z.number().int().positive().nullable(),
});

export const CreateAssessmentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional().default(''),
  mode: AssessmentModeSchema,
  allowedLanguages: z.array(AssessmentLanguageSchema).min(1),
  timeLimitSeconds: z.number().int().positive().nullable().optional().default(null),
});

export const UpdateAssessmentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  mode: AssessmentModeSchema.optional(),
  allowedLanguages: z.array(AssessmentLanguageSchema).min(1).optional(),
  timeLimitSeconds: z.number().int().positive().nullable().optional(),
});

// === Question ===

export const AssessmentQuestionSchema = z.object({
  id: idString('assessmentQuestion'),
  createdAt: z.string(),
  updatedAt: z.string(),
  assessmentId: idString('assessment'),
  title: z.string().min(1).max(200),
  description: z.record(z.any()),
  position: z.number().int().min(0),
  timeLimitSeconds: z.number().int().positive().nullable(),
  starterCode: z.string(),
});

export const CreateQuestionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.record(z.any()),
  position: z.number().int().min(0),
  timeLimitSeconds: z.number().int().positive().nullable().optional().default(null),
  starterCode: z.string().optional().default(''),
});

export const UpdateQuestionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.record(z.any()).optional(),
  position: z.number().int().min(0).optional(),
  timeLimitSeconds: z.number().int().positive().nullable().optional(),
  starterCode: z.string().optional(),
});

export const ReorderQuestionsSchema = z.object({
  order: z.array(
    z.object({
      id: idString('assessmentQuestion'),
      position: z.number().int().min(0),
    })
  ),
});

// === Test Case ===

export const TestCaseSchema = z.object({
  id: idString('assessmentTestCase'),
  createdAt: z.string(),
  updatedAt: z.string(),
  questionId: idString('assessmentQuestion'),
  label: z.string(),
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean(),
  position: z.number().int().min(0),
});

export const CreateTestCaseSchema = z.object({
  label: z.string().optional().default(''),
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean().optional().default(false),
  position: z.number().int().min(0).optional().default(0),
});

export const UpdateTestCaseSchema = z.object({
  label: z.string().optional(),
  input: z.string().optional(),
  expectedOutput: z.string().optional(),
  isHidden: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

// === Candidate ===

export const CandidateSchema = z.object({
  id: idString('candidate'),
  createdAt: z.string(),
  updatedAt: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
});

export const CreateCandidateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

// === Submission ===

export const SubmissionStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'submitted',
  'expired',
  'graded',
]);

export const SubmissionSchema = z.object({
  id: idString('assessmentSubmission'),
  createdAt: z.string(),
  updatedAt: z.string(),
  assessmentId: idString('assessment'),
  candidateId: idString('candidate'),
  status: SubmissionStatusSchema,
  selectedLanguage: AssessmentLanguageSchema.nullable(),
  startedAt: z.string().nullable(),
  submittedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  totalScore: z.number().int().nullable(),
  maxScore: z.number().int().nullable(),
  gradingNotes: z.string(),
  accessToken: z.string(),
});

export const CreateSubmissionSchema = z.object({
  candidateId: idString('candidate').optional(),
  candidateName: z.string().min(1).optional(),
  candidateEmail: z.string().email().optional(),
});

export const GradeSubmissionSchema = z.object({
  gradingNotes: z.string().optional(),
  questionScores: z
    .array(
      z.object({
        questionSubmissionId: idString('questionSubmission'),
        score: z.number().int().min(0),
      })
    )
    .optional(),
});

// === Types ===

export type AssessmentSchema = z.infer<typeof AssessmentSchema>;
export type CreateAssessmentSchema = z.infer<typeof CreateAssessmentSchema>;
export type UpdateAssessmentSchema = z.infer<typeof UpdateAssessmentSchema>;
export type AssessmentQuestionSchema = z.infer<typeof AssessmentQuestionSchema>;
export type CreateQuestionSchema = z.infer<typeof CreateQuestionSchema>;
export type UpdateQuestionSchema = z.infer<typeof UpdateQuestionSchema>;
export type TestCaseSchema = z.infer<typeof TestCaseSchema>;
export type CreateTestCaseSchema = z.infer<typeof CreateTestCaseSchema>;
export type UpdateTestCaseSchema = z.infer<typeof UpdateTestCaseSchema>;
export type CandidateSchema = z.infer<typeof CandidateSchema>;
export type CreateCandidateSchema = z.infer<typeof CreateCandidateSchema>;
export type SubmissionSchema = z.infer<typeof SubmissionSchema>;
export type CreateSubmissionSchema = z.infer<typeof CreateSubmissionSchema>;
export type GradeSubmissionSchema = z.infer<typeof GradeSubmissionSchema>;
