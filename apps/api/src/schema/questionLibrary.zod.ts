import { idString } from '@coderscreen/common/id';
import { z } from 'zod';

// === Question Library ===

export const QuestionLibrarySchema = z.object({
  id: idString('questionLibrary'),
  createdAt: z.string(),
  updatedAt: z.string(),
  title: z.string().min(1).max(200),
  description: z.record(z.any()),
  starterCode: z.string(),
  timeLimitSeconds: z.number().int().positive().nullable(),
  isPublic: z.boolean(),
  timesTaken: z.number().int().min(0),
  avgScore: z.number().min(0).max(1).nullable(),
});

export const CreateQuestionLibrarySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.record(z.any()).optional().default({}),
  starterCode: z.string().optional().default(''),
  timeLimitSeconds: z.number().int().positive().nullable().optional().default(null),
});

export const UpdateQuestionLibrarySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.record(z.any()).optional(),
  starterCode: z.string().optional(),
  timeLimitSeconds: z.number().int().positive().nullable().optional(),
});

// === Question Library Test Case ===

export const QuestionLibraryTestCaseSchema = z.object({
  id: idString('questionLibraryTestCase'),
  createdAt: z.string(),
  updatedAt: z.string(),
  questionId: idString('questionLibrary'),
  label: z.string(),
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean(),
  position: z.number().int().min(0),
});

export const CreateQuestionLibraryTestCaseSchema = z.object({
  label: z.string().optional().default(''),
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean().optional().default(false),
  position: z.number().int().min(0).optional().default(0),
});

export const UpdateQuestionLibraryTestCaseSchema = z.object({
  label: z.string().optional(),
  input: z.string().optional(),
  expectedOutput: z.string().optional(),
  isHidden: z.boolean().optional(),
  position: z.number().int().min(0).optional(),
});

// === Types ===

export type QuestionLibrarySchema = z.infer<typeof QuestionLibrarySchema>;
export type CreateQuestionLibrarySchema = z.infer<typeof CreateQuestionLibrarySchema>;
export type UpdateQuestionLibrarySchema = z.infer<typeof UpdateQuestionLibrarySchema>;
export type QuestionLibraryTestCaseSchema = z.infer<typeof QuestionLibraryTestCaseSchema>;
export type CreateQuestionLibraryTestCaseSchema = z.infer<typeof CreateQuestionLibraryTestCaseSchema>;
export type UpdateQuestionLibraryTestCaseSchema = z.infer<typeof UpdateQuestionLibraryTestCaseSchema>;
