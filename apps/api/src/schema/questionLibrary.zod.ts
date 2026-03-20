import { idString } from '@coderscreen/common/id';
import { z } from 'zod';

export const QuestionLibraryDifficultySchema = z.enum(['easy', 'medium', 'hard']);

// === Question Library ===

export const QuestionLibrarySchema = z.object({
  id: idString('questionLibrary'),
  createdAt: z.string(),
  updatedAt: z.string(),
  title: z.string().min(1).max(200),
  description: z.record(z.any()),
  starterCode: z.string(),
  timeLimitSeconds: z.number().int().positive().nullable(),
  difficulty: QuestionLibraryDifficultySchema.nullable(),
  tags: z.array(z.string()),
  isPublic: z.boolean(),
});

export const CreateQuestionLibrarySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.record(z.any()).optional().default({}),
  starterCode: z.string().optional().default(''),
  timeLimitSeconds: z.number().int().positive().nullable().optional().default(null),
  difficulty: QuestionLibraryDifficultySchema.nullable().optional().default(null),
  tags: z.array(z.string()).optional().default([]),
});

export const UpdateQuestionLibrarySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.record(z.any()).optional(),
  starterCode: z.string().optional(),
  timeLimitSeconds: z.number().int().positive().nullable().optional(),
  difficulty: QuestionLibraryDifficultySchema.nullable().optional(),
  tags: z.array(z.string()).optional(),
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
