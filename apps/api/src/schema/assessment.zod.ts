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

const IDENT_RE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export const TypeStringSchema = z.string().regex(/^(string|int|float|bool|null|object|array<.+>)$/);

export const ParameterSchema = z.object({
  name: z.string().min(1).regex(IDENT_RE),
  type: TypeStringSchema,
});

export const SignatureSchema = z.object({
  functionName: z.string().min(1).regex(IDENT_RE),
  parameters: z.array(ParameterSchema).max(10),
  returnType: TypeStringSchema,
});

export const StarterCodeMapSchema = z.record(AssessmentLanguageSchema, z.string());

export const AssessmentQuestionSchema = z.object({
  id: idString('assessmentQuestion'),
  createdAt: z.string(),
  updatedAt: z.string(),
  assessmentId: idString('assessment'),
  questionId: idString('questionLibrary'),
  position: z.number().int().min(0),
  points: z.number().int().min(0).max(10000),
  // Flattened from library question
  title: z.string().min(1).max(200),
  description: z.record(z.any()),
  functionName: z.string(),
  parameters: z.array(ParameterSchema),
  returnType: TypeStringSchema,
  starterCode: StarterCodeMapSchema,
  timeLimitSeconds: z.number().int().positive().nullable(),
});

export const CreateQuestionSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.record(z.any()),
  position: z.number().int().min(0),
  points: z.number().int().min(0).max(10000).optional().default(100),
  timeLimitSeconds: z.number().int().positive().nullable().optional().default(null),
  functionName: z.string().min(1).regex(IDENT_RE),
  parameters: z.array(ParameterSchema).max(10).optional().default([]),
  returnType: TypeStringSchema,
  starterCode: StarterCodeMapSchema.optional().default({}),
});

export const UpdateQuestionSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.record(z.any()).optional(),
  position: z.number().int().min(0).optional(),
  points: z.number().int().min(0).max(10000).optional(),
  timeLimitSeconds: z.number().int().positive().nullable().optional(),
  functionName: z.string().min(1).regex(IDENT_RE).optional(),
  parameters: z.array(ParameterSchema).max(10).optional(),
  returnType: TypeStringSchema.optional(),
  starterCode: StarterCodeMapSchema.optional(),
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
  id: idString('questionLibraryTestCase'),
  createdAt: z.string(),
  updatedAt: z.string(),
  questionId: idString('questionLibrary'),
  label: z.string(),
  args: z.array(z.unknown()),
  expectedReturn: z.unknown(),
  isHidden: z.boolean(),
  position: z.number().int().min(0),
});

export const CreateTestCaseSchema = z.object({
  label: z.string().optional().default(''),
  args: z.array(z.unknown()),
  expectedReturn: z.unknown(),
  isHidden: z.boolean().optional().default(false),
  position: z.number().int().min(0).optional().default(0),
});

export const UpdateTestCaseSchema = z.object({
  label: z.string().optional(),
  args: z.array(z.unknown()).optional(),
  expectedReturn: z.unknown().optional(),
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
  isArchived: z.boolean(),
});

export const CreateSubmissionSchema = z.union([
  z.object({
    candidateId: idString('candidate'),
  }),
  z.object({
    candidateName: z.string().min(1),
    candidateEmail: z.string().email(),
  }),
]);

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

// === Candidate-Facing Schemas ===

export const StartAssessmentSchema = z.object({
  selectedLanguage: AssessmentLanguageSchema,
});

export const SaveCodeSchema = z.object({
  questionId: idString('assessmentQuestion'),
  code: z.string(),
});

export const RunTestsSchema = z.object({
  questionId: idString('assessmentQuestion'),
  code: z.string(),
});

export const ChangeLanguageSchema = z.object({
  selectedLanguage: AssessmentLanguageSchema,
});

export type ChangeLanguageSchema = z.infer<typeof ChangeLanguageSchema>;

// === Link Existing Library Question ===

export const LinkQuestionSchema = z.object({
  libraryQuestionId: idString('questionLibrary'),
  position: z.number().int().min(0),
  points: z.number().int().min(0).max(10000).optional().default(100),
});

export type LinkQuestionSchema = z.infer<typeof LinkQuestionSchema>;

// === Types ===

export type StartAssessmentSchema = z.infer<typeof StartAssessmentSchema>;
export type SaveCodeSchema = z.infer<typeof SaveCodeSchema>;
export type RunTestsSchema = z.infer<typeof RunTestsSchema>;
export type TypeStringSchema = z.infer<typeof TypeStringSchema>;
export type ParameterSchema = z.infer<typeof ParameterSchema>;
export type SignatureSchema = z.infer<typeof SignatureSchema>;
export type StarterCodeMapSchema = z.infer<typeof StarterCodeMapSchema>;
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
